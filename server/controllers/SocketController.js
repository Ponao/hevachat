const User = require('../models/User');
const Room = require('../models/Room');
const jwt = require('jsonwebtoken')

const {roomOnIceCandidate, roomOfferSdp, stop} = require('./WebRtcController')

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

            socket.join(`${String(user._id)}`)

            // Set online status for user
            user = await User.findById(userVerify.data.userId)
            if(user) {
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

                    stop(activeRoomId, user._id)
                }
            }
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

            stop(roomId, user._id)

            let room = await Room.findById(roomId).populate('users')

            room.users = room.users.filter(x => String(x._id) != String(user._id))

            await room.save()

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

        // Room conference
        socket.on('roomIceCandidate', ({roomId, candidate}) => {
            roomOnIceCandidate(roomId, user._id, candidate)
        })

        socket.on('roomOfferSdp', ({roomId, offerSdp}) => {
            roomOfferSdp(roomId, user._id, offerSdp, socket, (error, answerSdp) => {
                if(error) return console.log(error)
                socket.emit('roomAnswerSdp', answerSdp)
            })
        })

        socket.on('roomSpeaking', (roomId) => {
            socket.to(`room.${roomId}`).emit('roomSpeaking', user._id)
        })

        socket.on('roomStopSpeaking', (roomId) => {
            socket.to(`room.${roomId}`).emit('roomStopSpeaking', user._id)
        })
    })
}

function sendMessageRoom({roomId, message, socketId}) {
    io.sockets.connected[socketId].to(`room.${roomId}`).emit('sendMessageRoom', message)
}

function deleteMessageRoom({roomId, messageIds, socketId}) {
    console.log(roomId)
    io.sockets.connected[socketId].to(`room.${roomId}`).emit('deleteMessageRoom', messageIds)
}

function readMessageRoom({roomId}) {
    io.to(`room.${roomId}`).emit('readMessagesRoom', roomId)
}

function editMessageRoom({roomId, message, socketId}) {
    io.sockets.connected[socketId].to(`room.${roomId}`).emit('editMessageRoom', message)
}

module.exports = {
    initSocket, 
    sendMessageRoom, 
    deleteMessageRoom,
    readMessageRoom,
    editMessageRoom
}