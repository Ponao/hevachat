import io from 'socket.io-client'
import store from '../Redux/store'
import {
    ROOMS_ADD,
    ROOMS_JOIN_ROOM,
    ROOMS_USER_JOIN_ROOM,
    ROOMS_USER_LEAVE_ROOM,
    ROOMS_ADD_MESSAGE,
    ROOMS_DELETE_MESSAGE,
    ROOMS_READ_MESSAGE,
    ROOMS_EDIT_MESSAGE
} from '../Redux/constants'

let socket = null
let activeLang = false

export default { 
    init: (apiToken) => {
        socket = io('http://localhost:8000')
        socket.on('connect', () => {
            socket.emit('auth', apiToken)
        })

        socket.on('createRoom', room => {
            store.dispatch({
                type: ROOMS_ADD,
                payload: room
            })
        })

        socket.on('joinRoom', ({roomId, user}) => {
            store.dispatch({
                type: ROOMS_USER_JOIN_ROOM,
                payload: {roomId, user}
            })
        })

        socket.on('leaveRoom', ({roomId, userId}) => {
            store.dispatch({
                type: ROOMS_USER_LEAVE_ROOM,
                payload: {roomId, userId}
            })
        })

        socket.on('sendMessageRoom', (message) => {
            store.dispatch({
                type: ROOMS_ADD_MESSAGE,
                payload: message
            })
        })

        socket.on('deleteMessageRoom', (messageIds) => {
            store.dispatch({
                type: ROOMS_DELETE_MESSAGE,
                payload: messageIds
            })
        })

        socket.on('readMessagesRoom', roomId => {
            if(store.getState().rooms.activeRoom && store.getState().rooms.activeRoom._id === roomId)
                store.dispatch({
                    type: ROOMS_READ_MESSAGE,
                    payload: store.getState().user._id
                })
        })

        socket.on('editMessageRoom', message => {
            store.dispatch({
                type: ROOMS_EDIT_MESSAGE,
                payload: message
            })
        })
    },
    getSocketId: () => {
        return socket.id
    },
    joinLang: lang => {
        if(activeLang)
            socket.emit('leaveLang', lang)
        
        socket.emit('joinLang', lang)
        activeLang = lang
    },
    createRoom: ({room, lang}) => {
        socket.emit('createRoom', {room, lang})
    },
    joinRoom: ({roomId, lang}) => {
        socket.emit('joinRoom', {roomId, lang})
    },
    leaveRoom: ({roomId, lang}) => {
        socket.emit('leaveRoom', {roomId, lang})
    },
    sendMessageRoom: ({roomId, message}) => {
        socket.emit('sendMessageRoom', {roomId, message})
    }
}

