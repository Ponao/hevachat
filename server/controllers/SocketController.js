const User = require('../models/User');
const Room = require('../models/Room');
const jwt = require('jsonwebtoken')

const {roomOnIceCandidate, roomOfferSdp, stop, stopRoomBySocketId, getUserExistById, getUserExistBySocketId, stopCall} = require('./WebRtcController')

let idCounter = 0;
let io = false

function nextUniqueId() {
    idCounter++;
    return idCounter.toString();
}

function initSocket(initIo) {
    io = initIo
    io.on('connection', (socket) => {
        let user = false;
        let activeLang = false;
        let activeRoomId = 0;
        let sessionId = nextUniqueId();

        // Check user token
        let disconnectTimer = setTimeout(() => {
            socket.disconnect('Unauthorized');
        }, 10000)
    
        socket.on('auth', async apiToken => {
            clearTimeout(disconnectTimer)

            try {
                var userVerify = jwt.verify(apiToken, process.env.JWT_SECRET)
            } catch (e) {
                socket.disconnect('Unauthorized');
                return;
            }

            if (!userVerify.data.userId) {
                socket.disconnect('Unauthorized');
                return;
            }

            // Set online status for user
            user = await User.findById(userVerify.data.userId)
            if(user) {
                socket.join(`user.${user._id}`)

                user.onlineAt = Date.now()
                user.online = true
                
                await user.save()
            }
        })

        socket.on('disconnect', async () => {
            if(user) {
                user.onlineAt = Date.now()
                user.online = false
                await user.save()

                if(activeLang && activeRoomId) {
                    socket.to(`language.${activeLang}`).emit('leaveRoom', {userId: user._id, roomId: activeRoomId})
                    socket.to(`room.${activeRoomId}`).emit('leaveInRoom', user._id)

                    let room = await Room.findById(activeRoomId).populate('users')
                    
                    room.users = room.users.filter(x => String(x._id) != String(user._id))

                    await room.save()
                }

                stopCall(socket.id, user._id, stopUserCall, io)
            } 

            stopRoomBySocketId(socket.id)
        })

        // Join and leave from Room and Language
        socket.on('joinLang', lang => {
            socket.join(`language.${lang}`)
            activeLang = lang
        })

        socket.on('joinRoom', async ({roomId, lang, userId}) => {
            socket.to(`language.${lang}`).emit('joinRoom', {roomId, user})
            socket.join(`room.${roomId}`)
            socket.to(`room.${roomId}`).emit('joinInRoom', user)

            let room = await Room.findById(roomId).populate('users')

            if(user)
                room.users.push(user)
            else {
                let userS = await User.findById(userId)
                room.users.push(userS)
            }

            await room.save()

            activeRoomId = roomId
            activeLang = lang
        })

        socket.on('leaveLang', lang => {
            socket.leave(`language.${lang}`)
            activeLang = false
        })

        socket.on('leaveRoom', async ({roomId, lang}) => {
            socket.to(`language.${lang}`).emit('leaveRoom', {userId: user._id, roomId})
            socket.leave(`room.${roomId}`)
            socket.to(`room.${roomId}`).emit('leaveInRoom', user._id)

            stopRoomBySocketId(socket.id)

            let room = await Room.findById(roomId).populate('users')
            if(room) {
                room.users = room.users.filter(x => String(x._id) != String(user._id))

                await room.save()
            }

            activeRoomId = 0
        })

        // Create Edit Delete room
        socket.on('createRoom', ({room, lang}) => {
            socket.to(`language.${lang}`).emit('createRoom', room)
        })

        socket.on('editRoom', ({room, lang}) => {
            socket.to(`language.${lang}`).emit('editRoom', room)
        })

        socket.on('deleteRoom', ({roomId, lang}) => {
            socket.to(`language.${lang}`).emit('deleteRoom', roomId)
        })

        // Messages in rooms
        socket.on('sendMessageRoom', ({roomId, message}) => {
            socket.to(`room.${roomId}`).emit('sendMessageRoom', message)
        })

        socket.on('editMessageRoom', ({roomId, message}) => {
            socket.to(`room.${roomId}`).emit('editMessageRoom', message)
        })

        socket.on('deleteMessageRoom', ({roomId, messageId}) => {
            socket.to(`room.${roomId}`).emit('deleteMessageRoom', messageId)
        })

        socket.on('typingRoom', roomId => {
            socket.to(`room.${roomId}`).emit('typingRoom', user)
        })

        // Messages in users
        socket.on('sendMessageUser', ({userId, message}) => {
            socket.to(`${userId}`).emit('sendMessageUser', message)
        })

        socket.on('editMessageUser', ({userId, message}) => {
            socket.to(`${userId}`).emit('editMessageRoom', message)
        })

        socket.on('deleteMessageUser', ({userId, messageId}) => {
            socket.to(`${userId}`).emit('deleteMessageRoom', messageId)
        })

        socket.on('typingDialog', ({otherId, userId}) => {
            if(userId == user._id)
                socket.to(`user.${otherId}`).emit('typingDialog', userId)
        })

        // Room conference
        socket.on('roomIceCandidate', ({roomId, candidate}) => {
            roomOnIceCandidate(roomId, user._id, candidate)
        })

        socket.on('roomOfferSdp', ({roomId, offerSdp}) => {
            if(getUserExistBySocketId(socket.id)) {
                roomOfferSdp(roomId, user._id, offerSdp, socket, (error, answerSdp) => {
                    if(error) return console.log(error)
                    socket.emit('roomAnswerSdp', answerSdp)
                })
            }
        })

        socket.on('roomSpeaking', (roomId) => {
            socket.to(`room.${roomId}`).emit('roomSpeaking', user._id)
        })

        socket.on('roomStopSpeaking', (roomId) => {
            socket.to(`room.${roomId}`).emit('roomStopSpeaking', user._id)
        })
    })
}

function getIO() {
    return io
}

// Chat room
function sendMessageRoom({roomId, message, socketId}) {
    io.sockets.connected[socketId].to(`room.${roomId}`).emit('sendMessageRoom', message)
}

function deleteMessageRoom({roomId, messageIds, socketId}) {
    io.sockets.connected[socketId].to(`room.${roomId}`).emit('deleteMessageRoom', messageIds)
}

function readMessageRoom({roomId}) {
    io.to(`room.${roomId}`).emit('readMessagesRoom', roomId)
}

function editMessageRoom({roomId, message, socketId}) {
    io.sockets.connected[socketId].to(`room.${roomId}`).emit('editMessageRoom', message)
}

function editRoom({roomId, lang, room}) {
    io.to(`language.${lang}`).emit('editRoom', room)
    io.to(`room.${roomId}`).emit('editInRoom', room)
}

function deleteRoom({roomId, lang}) {
    io.to(`language.${lang}`).emit('deleteRoom', roomId)
}

// Chat dialog
function sendMessageDialog({userId, socketId, otherId, message}) {
    if(userId != otherId) {
        io.sockets.connected[socketId].to(`user.${otherId}`).emit('sendMessageDialog', ({message, otherId: userId}))
        io.sockets.connected[socketId].to(`user.${userId}`).emit('sendMessageDialog', ({message, otherId}))
    } else {
        io.sockets.connected[socketId].to(`user.${otherId}`).emit('sendMessageDialog', ({message, otherId: userId}))
    }
}

function readMessageDialog({dialogId, userId, otherId, socketId}) {
    io.sockets.connected[socketId].to(`user.${otherId}`).emit('readMessagesDialog', {dialogId, userId: otherId})
    io.sockets.connected[socketId].to(`user.${userId}`).emit('readMessagesDialog', {dialogId, userId: otherId})
}

function editMessageDialog({userId, otherId, message, socketId, dialogId}) {
    io.sockets.connected[socketId].to(`user.${otherId}`).emit('editMessageDialog', {message, dialogId})
    io.sockets.connected[socketId].to(`user.${userId}`).emit('editMessageDialog', {message, dialogId})
}

function deleteMessageDialog({userId, otherId, socketId, messageIds, dialogId, lastMessage, noRead, noReadCount}) {
    io.sockets.connected[socketId].to(`user.${otherId}`).emit('deleteMessageDialog', {messageIds, dialogId, lastMessage, noRead, noReadCount})
    io.sockets.connected[socketId].to(`user.${userId}`).emit('deleteMessageDialog', {messageIds, dialogId, lastMessage, noRead})
}

function findBySocketId(socketId) {
    return io.sockets.connected[socketId]
}

// User friends
function sendRequestFriend({userId, otherId, friendStatus}) {
    io.to(`user.${otherId}`).emit('sendRequestFriend', {userId, friendStatus})
}

function sendAcceptFriend({userId, otherId, friendStatus}) {
    io.to(`user.${otherId}`).emit('sendAcceptFriend', {userId, friendStatus})
}

function sendRemoveFriend({userId, otherId, friendStatus}) {
    io.to(`user.${otherId}`).emit('sendRemoveFriend', {userId, friendStatus})
}

// Notifications
function sendNotification({userId, notification}) {
    io.to(`user.${userId}`).emit('sendNotification', notification)
}

function removeNotification({userId, id, read}) {
    io.to(`user.${userId}`).emit('removeNotification', {id, read})
}

function readNotification({socketId, userId, id}) {
    io.sockets.connected[socketId].to(`user.${userId}`).emit('readNotification', id)
}

// Calls
function sendUserCall({userId, otherId, socketId}) {
    io.sockets.connected[socketId].to(`user.${otherId}`).emit('sendUserCall', userId)
}

function stopUserCall({userId, otherId, socketId}) {
    if(io.sockets.connected[socketId]) {
        io.sockets.connected[socketId].to(`user.${otherId}`).emit('stopUserCall', userId)
        io.sockets.connected[socketId].to(`user.${userId}`).emit('stopUserCall', otherId)
    } else {
        io.to(`user.${otherId}`).emit('stopUserCall', userId)
    }
}

module.exports = {
    getIO,
    initSocket, 
    sendMessageRoom, 
    deleteMessageRoom,
    readMessageRoom,
    editMessageRoom,
    sendMessageDialog,
    readMessageDialog,
    editMessageDialog,
    deleteMessageDialog,
    findBySocketId,
    sendRequestFriend,
    sendAcceptFriend,
    sendRemoveFriend,
    sendNotification,
    readNotification,
    removeNotification,
    editRoom,
    deleteRoom,
    stopUserCall,
    sendUserCall,
}