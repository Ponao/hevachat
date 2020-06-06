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
    ROOMS_USER_LEAVE_IN_ROOM,
    DIALOGS_ADD_MESSAGE,
    DIALOGS_READ_MESSAGES,
    DIALOGS_SET_TYPER,
    DIALOGS_EDIT_MESSAGE,
    DIALOGS_DELETE_MESSAGE,
    DIALOGS_ADD
} from '../Redux/constants'
import WebRtcController from './WebRtcController'
import {urlApi} from '../config'

let socket = null
let activeLang = false

export default { 
    init: (apiToken) => {
        socket = io(urlApi, {transports: ['websocket', 'polling', 'flashsocket']})
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

        socket.on('sendMessageDialog', ({message, otherId}) => {
            if(store.getState().dialogs.dialogs.find(x => x._id === message.dialogId)) {
                let noReadCount = false

                if(
                    message.user._id !== store.getState().user._id &&
                    !store.getState().dialogs.dialogs.find(x => x._id === message.dialogId).noRead
                ) {
                    noReadCount = true
                }

                store.dispatch({
                    type: DIALOGS_ADD_MESSAGE,
                    payload: {message, dialogId: message.dialogId, noRead: message.user._id !== store.getState().user._id, noReadCount}
                })
            } else {
                fetch(`${urlApi}/api/user/get`, {
                    method: "post",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${apiToken}`,
                    },
                    body: JSON.stringify({
                        userId: otherId
                    })
                })
                .then((response) => response.json())
                .then((user) => {
                    let dialog = {
                        lastMessage: message,
                        _id: message.dialogId,
                        users: [store.getState().user, user],
                        user: user,
                        getted: false,
                        typing: false,
                        noRead: 1,
                        messages: []
                    }
                    store.dispatch({
                        type: DIALOGS_ADD,
                        payload: dialog
                    })
                });
            }
        })

        socket.on('readMessagesDialog', ({dialogId, userId}) => {
            store.dispatch({
                type: DIALOGS_READ_MESSAGES,
                payload: {dialogId, userId, noRead: userId !== store.getState().user._id, noReadCount: userId !== store.getState().user._id}
            })
        })

        socket.on('editMessageDialog', ({message, dialogId}) => {
            let last = store.getState().dialogs.dialogs.find(x => x._id === dialogId).lastMessage

            let editLast
            if(last)
                editLast = message._id === last._id
            else 
                editLast = false

            store.dispatch({
                type: DIALOGS_EDIT_MESSAGE,
                payload: {message, dialogId, editLast}
            })
        })

        socket.on('deleteMessageDialog', ({messageIds, dialogId, lastMessage, noRead, noReadCount}) => {
            console.log(noReadCount)
            store.dispatch({
                type: DIALOGS_DELETE_MESSAGE,
                payload: {dialogId, messageIds, lastMessage, noRead, noReadCount}
            })
        })

        socket.on('typingDialog', userId => {
            if(store.getState().dialogs.dialogs.find(x => x.user._id === userId)) {
                store.dispatch({
                    type: DIALOGS_SET_TYPER,
                    payload: {userId, typing: true}
                })
    
                setTimeout(() => {
                    store.dispatch({
                        type: DIALOGS_SET_TYPER,
                        payload: {userId, typing: false}
                    })
                }, 2500)
            }
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
    },
    typingDialog: (otherId, userId) => {
        socket.emit('typingDialog', {otherId, userId})
    }
}

