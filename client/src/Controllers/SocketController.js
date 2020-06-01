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
    ROOMS_EDIT_MESSAGE,
    ROOMS_ADD_TYPER,
    ROOMS_REMOVE_TYPER,
    ROOMS_SET_SPEAKING_STATUS,
    ROOMS_USER_JOIN_IN_ROOM,
    ROOMS_USER_LEAVE_IN_ROOM
} from '../Redux/constants'
import WebRtcController from './WebRtcController'

let socket = null
let activeLang = false

export default { 
    init: (apiToken) => {
        socket = io('http://localhost:8000', {transports: ['websocket', 'polling', 'flashsocket']})
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

        socket.on('joinInRoom', (user) => {
            store.dispatch({
                type: ROOMS_USER_JOIN_IN_ROOM,
                payload: user
            })
        })

        socket.on('leaveRoom', ({roomId, userId}) => {
            store.dispatch({
                type: ROOMS_USER_LEAVE_ROOM,
                payload: {roomId, userId}
            })
        })

        socket.on('leaveInRoom', (userId) => {
            store.dispatch({
                type: ROOMS_USER_LEAVE_IN_ROOM,
                payload: userId
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

        socket.on('typingRoom', user => {
            if(!store.getState().rooms.activeRoom.typers.find(x => x._id === user._id)) {
                store.dispatch({
                    type: ROOMS_ADD_TYPER,
                    payload: user
                })
    
                setTimeout(() => {
                    store.dispatch({
                        type: ROOMS_REMOVE_TYPER,
                        payload: user._id
                    })
                }, 2500)
            }
        })

        socket.on('roomAnswerSdp', answerSdp => {
            WebRtcController.onRoomAnswerSdp(answerSdp)
        })

        socket.on('roomOnIceCandidate', candidate => {
            WebRtcController.roomOnIceCandidate(candidate)
        })

        socket.on('roomSpeaking', userId => {
            store.dispatch({
                type: ROOMS_SET_SPEAKING_STATUS,
                payload: {userId, speaking: true}
            })
        })

        socket.on('roomStopSpeaking', userId => {
            store.dispatch({
                type: ROOMS_SET_SPEAKING_STATUS,
                payload: {userId, speaking: false}
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
        socket.emit('joinRoom', {roomId, lang, userId: store.getState().user._id})
        // console.log(123)
    },
    leaveRoom: ({roomId, lang}) => {
        socket.emit('leaveRoom', {roomId, lang})
    },
    sendMessageRoom: ({roomId, message}) => {
        socket.emit('sendMessageRoom', {roomId, message})
    },
    typingRoom: (roomId) => {
        socket.emit('typingRoom', roomId)
    },

    // Room conference
    sendRoomIceCandidate: ({roomId, candidate}) => {
        socket.emit('roomIceCandidate', {roomId, candidate})
    },
    sendRoomOfferSdp: ({roomId, offerSdp}) => {
        socket.emit('roomOfferSdp', {roomId, offerSdp})
    },
    sendRoomSpeaking: ({roomId}) => {
        socket.emit('roomSpeaking', roomId)
    },
    sendRoomStopSpeaking: ({roomId}) => {
        socket.emit('roomStopSpeaking', roomId)
    }
}

