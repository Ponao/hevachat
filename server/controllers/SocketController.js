const User = require('../models/User');
const jwt = require('jsonwebtoken')

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
        }, 1000)
    
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

            socket.join(`${userVerify.data.userId}`)

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
                }
            }
        })
        

        // Join and leave from Room and Language
        socket.on('joinLang', lang => {
            socket.join(`language.${lang}`)
            activeLang = lang
        })

        socket.on('joinRoom', ({roomId, lang}) => {
            socket.to(`language.${lang}`).emit('joinRoom', {roomId, user})
            socket.join(`room.${roomId}`)
            activeRoomId = roomId
            activeLang = lang
        })

        socket.on('leaveLang', lang => {
            socket.leave(`language.${lang}`)
            activeLang = false
        })

        socket.on('leaveRoom', ({roomId, lang}) => {
            socket.to(`language.${lang}`).emit('leaveRoom', {userId: user._id, roomId})
            socket.leave(`room.${roomId}`)
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
    })
}

function sendMessageRoom({roomId, message, socketId}) {
    io.sockets.connected[socketId].to(`room.${roomId}`).emit('sendMessageRoom', message)
}

function deleteMessageRoom({roomId, messageIds, socketId}) {
    io.sockets.connected[socketId].to(`room.${roomId}`).emit('deleteMessageRoom', messageIds)
}

function readMessageRoom({roomId, socketId}) {
    io.sockets.connected[socketId].to(`room.${roomId}`).emit('readMessagesRoom', roomId)
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