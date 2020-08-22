import io from 'socket.io-client'
import store from '../Redux/store'
import {
    ROOMS_ADD,
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
    DIALOGS_ADD,
    USERS_SET_FRIEND_STATUS,
    USERS_FRIENDS_ADD,
    USERS_PENDING_ADD,
    USERS_REQUESTED_ADD,
    USERS_FRIENDS_REMOVE,
    USERS_PENDING_REMOVE,
    USERS_REQUESTED_REMOVE,
    USERS_ADD,
    NOTIFICATIONS_ADD,
    NOTIFICATIONS_READ,
    NOTIFICATIONS_SET_NO_READ,
    NOTIFICATIONS_REMOVE,
    ROOMS_EDIT_ROOM,
    ROOMS_EDIT_IN_ROOM,
    ROOMS_DELETE_ROOM,
    CALL_SET_USER,
    CALL_SET_STATUS,
    CALL_SET_MEDIA,
    ROOMS_SET_MUTED,
    ROOMS_JOIN_ERROR,
    ROOMS_LEAVE_ROOM,
    USER_SET_WARNING,
    TOASTS_ADD,
    TOASTS_REMOVE,
    USER_LOGOUT,
    BAN_SET,
    USER_LOGIN,
    DIALOGS_GET,
    APP_SET_STATUS_NETWORK,
    ROOMS_JOIN_ROOM,
    ROOMS_GET,
    ROOMS_GET_ERROR,
    ROOMS_SET_GET,
    NOTIFICATIONS_GET
} from '../Redux/constants'
import WebRtcController from './WebRtcController'
import {urlApi} from '../config'
import {playNewMessage, stopBeep, playRington, stopRington} from './SoundController'
import { setForceTitle } from './FunctionsController'

let socket = false
let activeLang = false
let unmuteTimer = false
let counterConnect = 0

export default { 
    init: (apiToken) => {
        if(socket) 
            return

        socket = io(urlApi, {transports: ['websocket', 'polling', 'flashsocket']})

        socket.on('disconnect', () => {
            store.dispatch({
                type: APP_SET_STATUS_NETWORK,
                payload: true
            })
        })

        socket.on('connect', () => {
            socket.emit('auth', apiToken)

            fetch(`${urlApi}/api/call/check`, {
                method: "post",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiToken}`,
                }
            })
            .then((response) => response.json())
            .then(({have, call}) => {
                if(have) {
                    fetch(`${urlApi}/api/user/get`, {
                        method: "post",
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${apiToken}`,
                        },
                        body: JSON.stringify({
                            userId: call.userFrom._id
                        })
                    })
                    .then((response) => response.json())
                    .then(({user, friendStatus}) => {
                        store.dispatch({
                            type: CALL_SET_USER,
                            payload: {user, status: 'incoming'}
                        })
                    });
                }
            });

            if(counterConnect > 0) {
                fetch(`${urlApi}/api/user/me`, {
                    method: "get",
                    headers: {
                      Accept: "application/json",
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${apiToken}`,
                    },
                  })
                    .then((response) => response.json())
                    .then(({user, dialogs, noReadCount, noReadNotifications, ban, numDate, date}) => {
                      if(ban) {
                        store.dispatch({
                          type: BAN_SET,
                          payload: {numDate, date}
                        })
                      } else {
                        // this.props.userActions.loginUser(user, dialogs, noReadCount, noReadNotifications, apiToken);
                        user.apiToken = apiToken
    
                        store.dispatch({
                            type: USER_LOGIN,
                            payload: user
                        })

                        for (let i = 0; i < dialogs.length; i++) {
                            dialogs[i].user = dialogs[i].users.find(user => user._id !== store.getState().user._id)

                            if(!dialogs[i].user)
                                dialogs[i].user = dialogs[i].users[0]

                            dialogs[i].typing = false
                            dialogs[i].getted = false
                            dialogs[i].isLoading = false

                            if(dialogs[i].lastMessage) {
                                dialogs[i].lastMessage.isLoading = false
                                dialogs[i].lastMessage.isError = false
                            }

                            if(dialogs[i].lastMessage && dialogs[i].lastMessage.user._id === store.getState().user._id)
                                dialogs[i].noRead = 0
                        }

                        store.dispatch({
                            type: DIALOGS_GET,
                            payload: {dialogs, noReadCount}
                        })

                        store.dispatch({
                            type: NOTIFICATIONS_SET_NO_READ,
                            payload: noReadNotifications
                        })

                        if(window.location.pathname.slice(1, 6) === 'chats') {
                            let userId = window.location.pathname.slice(7, 31)

                            fetch(`${urlApi}/api/dialog/get`, {
                                method: "post",
                                headers: {
                                    Accept: "application/json",
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${apiToken}`,
                                },
                                body: JSON.stringify({
                                    userId
                                })
                            })
                            .then((response) => response.json())
                            .then(({dialog, messages}) => {
                                if(!dialog.error) {
                                    dialog.user = dialog.users.find(user => user._id !== store.getState().user._id)
                        
                                    if(!dialog.user)
                                        dialog.user = dialog.users[0]
                        
                                    dialog.typing = false
                        
                                    dialog.getted = true
                        
                                    dialog.messages = messages.reverse()
                                    dialog.lastMessage = false
                                    dialog.canLoad = messages.length === 50
                                    dialog.isLoading = false
                        
                                    store.dispatch({
                                        type: DIALOGS_ADD,
                                        payload: dialog
                                    })
                                } else {
                                    let dialog = {
                                        getted: true,
                                        isNotFound: true,
                                        user: {_id: userId}
                                    }
                        
                                    store.dispatch({
                                        type: DIALOGS_ADD,
                                        payload: dialog
                                    })
                                }
                            });
                        }
                      }
                    })
                    .catch(() => {
                        localStorage.setItem('drafts', JSON.stringify([]));
                    //   this.setState({isRender: true})
                        store.dispatch({
                            type: USER_LOGOUT
                        })
                    })

                if(store.getState().notifications.getted) {
                    fetch(`${urlApi}/api/notification/get-all`, {
                        method: "post",
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${apiToken}`,
                        }
                    })
                    .then((response) => response.json())
                    .then((notifications) => {
                        store.dispatch({
                            type: NOTIFICATIONS_GET,
                            payload: notifications
                        })
                    });
                }
                
                if(store.getState().rooms.getted) {
                    store.dispatch({
                        type: ROOMS_SET_GET,
                    })
                
                    fetch(`${urlApi}/api/room/get-all`, {
                        method: "post",
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${apiToken}`,
                        },
                        body: JSON.stringify({
                            lang: store.getState().user.roomLang
                        })
                    })
                    .then((response) => response.json())
                    .then((rooms) => {
                        store.dispatch({
                            type: ROOMS_GET,
                            payload: rooms
                        })
                    })
                    .catch((err) => {
                        store.dispatch({
                            type: ROOMS_GET_ERROR,
                        })
                    })
                }
                    
                let activeRoom = store.getState().rooms.activeRoom

                if(!!activeRoom) {
                    WebRtcController.leaveRoom({roomId: activeRoom._id, lang: activeRoom.lang})
                    store.dispatch({
                        type: ROOMS_LEAVE_ROOM
                    })

                    fetch(`${urlApi}/api/room/get`, {
                        method: "post",
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${apiToken}`,
                        },
                        body: JSON.stringify({
                            id: activeRoom._id,
                            socketId: socket.id
                        })
                    })
                    .then(response => response.json())
                    .then((data) => {
                        if(data.error) {
                            setForceTitle('Error')
            
                            store.dispatch({
                                type: ROOMS_JOIN_ERROR,
                                payload: data.errors[0]
                            })
                            
                            return
                        } else {
                            let room = data.room
                            let muted = data.muted
            
                            room.dialog.messages = room.dialog.messages.reverse()
            
                            room.users.map(x => {
                                x.speaking = false
                                return 1
                            })
            
                            setForceTitle(room.title)
            
                            store.dispatch({
                                type: ROOMS_JOIN_ROOM,
                                payload: {room, canLoad: room.dialog.messages.length === 50, muted}
                            })
            
                            if(unmuteTimer) {
                                clearTimeout(unmuteTimer)
                            }
            
                            if(muted && (new Date(muted.date).getTime() - new Date().getTime()) <= 86400000) {
                                unmuteTimer = setTimeout(() => {
                                    if(store.getState().rooms.activeRoom && 
                                    store.getState().rooms.activeRoom._id === room._id && 
                                    !!store.getState().rooms.activeRoom.muted && 
                                    store.getState().rooms.activeRoom.muted.date === muted.date) {
                                        store.dispatch({
                                            type: ROOMS_SET_MUTED,
                                            payload: false
                                        })
                                    }
                                    // console.log(unmuteTimer)
                                }, (new Date(muted.date).getTime() - new Date().getTime()) );
                            }

                            socket.emit('joinRoom', {roomId: room._id, lang: room.lang, userId: store.getState().user._id})
            
                            try {
                                WebRtcController.connectRoom(room._id)
                            } catch (err) {
                                socket.emit('leaveRoom', {roomId: room._id, lang: room.lang})
                                store.dispatch({
                                    type: ROOMS_JOIN_ERROR,
                                    payload: {param: 'all', msg: 'something_goes_wrong'}
                                })
                            }
                        }
                    })
                    .catch((err) => {
                        store.dispatch({
                            type: ROOMS_JOIN_ERROR,
                            payload: {param: 'all', msg: 'something_goes_wrong'}
                        })
                    })
                }

                store.dispatch({
                    type: APP_SET_STATUS_NETWORK,
                    payload: false
                })
            }

            counterConnect++
        })

        socket.on('createRoom', room => {
            store.dispatch({
                type: ROOMS_ADD,
                payload: room
            })
        })

        socket.on('editRoom', room => {
            store.dispatch({
                type: ROOMS_EDIT_ROOM,
                payload: room
            })
        })

        socket.on('editInRoom', room => {
            store.dispatch({
                type: ROOMS_EDIT_IN_ROOM,
                payload: room
            })
        })

        socket.on('deleteRoom', roomId => {
            store.dispatch({
                type: ROOMS_DELETE_ROOM,
                payload: roomId
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

            if(store.getState().rooms.activeRoom.typers.find(x => x._id === message.user._id)) {
                store.dispatch({
                    type: ROOMS_REMOVE_TYPER,
                    payload: message.user._id
                })
            }
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
            if(store.getState().dialogs.dialogs.find(x => x.user._id === message.user._id) && store.getState().dialogs.dialogs.find(x => x.user._id === message.user._id).typing) {
                store.dispatch({
                    type: DIALOGS_SET_TYPER,
                    payload: {userId: message.user._id, typing: false}
                })
            }

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
                .then(({user, friendStatus}) => {
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

            if(message.user._id !== store.getState().user._id && `/chats/${message.user._id}` !== window.location.pathname) {
                playNewMessage()

                store.dispatch({
                    type: TOASTS_ADD,
                    payload: {toast: message, toastType: 'message'}
                })

                setTimeout(() => {
                    store.dispatch({
                        type: TOASTS_REMOVE,
                        payload: message._id
                    })
                }, 5000)
            }
        })

        socket.on('sendNotification', notification => {
            if(store.getState().notifications.getted) {
                store.dispatch({
                    type: NOTIFICATIONS_ADD,
                    payload: notification
                })
            } else 
                store.dispatch({
                    type: NOTIFICATIONS_SET_NO_READ,
                    payload: store.getState().notifications.noRead+1
                })
            
            store.dispatch({
                type: TOASTS_ADD,
                payload: {toast: notification, toastType: 'notification'}
            })

            setTimeout(() => {
                store.dispatch({
                    type: TOASTS_REMOVE,
                    payload: notification._id
                })
            }, 5000)

            playNewMessage()
        })

        socket.on('readNotification', id => {
            store.dispatch({
                type: NOTIFICATIONS_READ,
                payload: id
            })
        })

        socket.on('removeNotification', ({id, read}) => {
            let noRead = store.getState().notifications.noRead
            
            if(!read)
                noRead--

            store.dispatch({
                type: NOTIFICATIONS_SET_NO_READ,
                payload: noRead
            })

            store.dispatch({
                type: NOTIFICATIONS_REMOVE,
                payload: id
            })

            store.dispatch({
                type: TOASTS_REMOVE,
                payload: id
            })
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

        socket.on('sendRequestFriend', ({userId, friendStatus}) => {
            store.dispatch({
                type: USERS_SET_FRIEND_STATUS,
                payload: {userId, friendStatus}
            })

            if(store.getState().users.pending.getted) {
                store.dispatch({
                    type: USERS_PENDING_REMOVE,
                    payload: {userId}
                })
            }
    
            if(store.getState().users.requested.getted) {
                if(store.getState().users.users.find(x => x._id === userId)) {
                    store.dispatch({
                        type: USERS_REQUESTED_ADD,
                        payload: {user: store.getState().users.users.find(x => x._id === userId)}
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
                            userId: userId
                        })
                    })
                    .then((response) => response.json())
                    .then(({user, friendStatus}) => {
                        user.friendStatus = friendStatus
                        store.dispatch({
                            type: USERS_ADD,
                            payload: user
                        })
                        store.dispatch({
                            type: USERS_REQUESTED_ADD,
                            payload: {user}
                        })
                    });
                }
            }
        })

        socket.on('sendAcceptFriend', ({userId, friendStatus}) => {
            store.dispatch({
                type: USERS_SET_FRIEND_STATUS,
                payload: {userId, friendStatus}
            })
    
            if(store.getState().users.pending.getted) {
                store.dispatch({
                    type: USERS_PENDING_REMOVE,
                    payload: {userId}
                })
            }
    
            if(store.getState().users.friends.getted) {
                if(store.getState().users.users.find(x => x._id === userId)) {
                    store.dispatch({
                        type: USERS_FRIENDS_ADD,
                        payload: {user: store.getState().users.users.find(x => x._id === userId)}
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
                            userId: userId
                        })
                    })
                    .then((response) => response.json())
                    .then(({user, friendStatus}) => {
                        user.friendStatus = friendStatus
                        store.dispatch({
                            type: USERS_ADD,
                            payload: user
                        })
                        store.dispatch({
                            type: USERS_FRIENDS_ADD,
                            payload: {user}
                        })
                    });
                }
            }
        })

        socket.on('sendRemoveFriend', ({userId, friendStatus}) => {
            store.dispatch({
                type: USERS_SET_FRIEND_STATUS,
                payload: {userId, friendStatus}
            })
    
            if(store.getState().users.friends.getted) {
                if(friendStatus === 1) {
                    store.dispatch({
                        type: USERS_FRIENDS_REMOVE,
                        payload: {userId}
                    })
    
                    if(store.getState().users.requested.getted) {
                        if(store.getState().users.users.find(x => x._id === userId)) {
                            store.dispatch({
                                type: USERS_PENDING_ADD,
                                payload: {user: store.getState().users.users.find(x => x._id === userId)}
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
                                    userId: userId
                                })
                            })
                            .then((response) => response.json())
                            .then(({user, friendStatus}) => {
                                user.friendStatus = friendStatus
                                store.dispatch({
                                    type: USERS_ADD,
                                    payload: user
                                })
                                store.dispatch({
                                    type: USERS_PENDING_ADD,
                                    payload: {user}
                                })
                            });
                        }
                    }
                }
            }
    
            if(store.getState().users.pending.getted && friendStatus === 0) {
                store.dispatch({
                    type: USERS_PENDING_REMOVE,
                    payload: {userId}
                })
            }
    
            if(store.getState().users.requested.getted && friendStatus === 0) {
                store.dispatch({
                    type: USERS_REQUESTED_REMOVE,
                    payload: {userId}
                })
            }
        })

        socket.on('sendUserCall', userId => {
            fetch(`${urlApi}/api/user/get`, {
                method: "post",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiToken}`,
                },
                body: JSON.stringify({
                    userId: userId
                })
            })
            .then((response) => response.json())
            .then(({user, friendStatus}) => {
                playRington()
                store.dispatch({
                    type: CALL_SET_USER,
                    payload: {user, status: 'incoming'}
                })
            });
        })

        socket.on('sendUserAcceptCall', userId => {
            if(store.getState().call.user && store.getState().call.user._id === userId) {
                store.dispatch({
                    type: CALL_SET_STATUS,
                    payload: 'active'
                })
                WebRtcController.call(userId, true)
                stopBeep()
            }
        })

        socket.on('callOnIceCandidate', candidate => {
            if(store.getState().call.user) {
                WebRtcController.callOnIceCandidate(candidate)
            }
        })

        socket.on('stopUserCall', userId => {
            if(store.getState().call.user && store.getState().call.user._id === userId) {
                stopBeep()
                stopRington()
                if(store.getState().call.status === 'outcoming')
                    store.dispatch({
                        type: CALL_SET_STATUS,
                        payload: 'canceled'
                    })
                
                if(store.getState().call.status === 'incoming')
                    store.dispatch({
                        type: CALL_SET_USER,
                        payload: {user: false, status: 'none'}
                    })
                
                if(store.getState().call.status === 'active') {
                    store.dispatch({
                        type: CALL_SET_USER,
                        payload: {user: false, status: 'none'}
                    })

                    WebRtcController.stopCall()
                }
            }
        })

        socket.on('callOfferSdp', ({offerSdp, media}) => {
            if(store.getState().call.user) {
                WebRtcController.onCallOfferSdp({offerSdp, media})
            }
        })

        socket.on('callAnswerSdp', sdp => {
            if(store.getState().call.user) {
                WebRtcController.onCallAnswerSdp(sdp)
            }
        })

        socket.on('toggleCameraCall', ({userId, media}) => {
            if(store.getState().call.user && store.getState().call.user._id === userId) {
                store.dispatch({
                    type: CALL_SET_MEDIA,
                    payload: media
                })
            }
        })

        socket.on('muteRoom', ({roomId, muted}) => {
            if(store.getState().rooms.activeRoom && store.getState().rooms.activeRoom._id === roomId) {
                store.dispatch({
                    type: ROOMS_SET_MUTED,
                    payload: muted
                })

                if(unmuteTimer) {
                    clearTimeout(unmuteTimer)
                }

                if((muted.numDate*1000) <= 86400000) {
                    unmuteTimer = setTimeout(() => {
                        if(store.getState().rooms.activeRoom && 
                        store.getState().rooms.activeRoom._id === roomId && 
                        !!store.getState().rooms.activeRoom.muted && 
                        store.getState().rooms.activeRoom.muted.date === muted.date) {
                            store.dispatch({
                                type: ROOMS_SET_MUTED,
                                payload: false
                            })
                        }
                    }, muted.numDate*1000);
                }
            }
        })

        socket.on('unmuteRoom', roomId => {
            if(store.getState().rooms.activeRoom && store.getState().rooms.activeRoom._id === roomId) {
                store.dispatch({
                    type: ROOMS_SET_MUTED,
                    payload: false
                })

                if(unmuteTimer) {
                    clearTimeout(unmuteTimer)
                }
            }
        })

        socket.on('banRoom', ({roomId, ban}) => {
            if(store.getState().rooms.activeRoom && store.getState().rooms.activeRoom._id === roomId) {
                WebRtcController.leaveRoom({roomId, lang: store.getState().rooms.activeRoom.lang})
                store.dispatch({
                    type: ROOMS_LEAVE_ROOM
                })
                store.dispatch({
                    type: ROOMS_JOIN_ERROR,
                    payload: {msg: 'you_banned_in_this_room', ban: ban}
                })
            }
        })

        socket.on('sendWarning', warning => {
            store.dispatch({
                type: USER_SET_WARNING,
                payload: warning
            })
        })

        socket.on('ban', async () => {
            window.location.reload()
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
    },

    // Calls
    sendCallOfferSdp: ({userId, offerSdp, media}) => {
        socket.emit('callOfferSdp', {userId, offerSdp, media})
    },
    sendCallAnswerSdp: ({userId, answerSdp}) => {
        socket.emit('callAnswerSdp', {userId, answerSdp})
    },
    sendCallIceCandidate: ({userId, candidate}) => {
        socket.emit('callIceCandidate', {userId, candidate})
    },
    toggleCameraCall: (userId, media) => {
        socket.emit('toggleCameraCall', {userId, media})
    }
}

