import { 
    ROOMS_GET,
    ROOMS_ADD,
    ROOMS_JOIN_ROOM,
    ROOMS_LEAVE_ROOM,
    ROOMS_ADD_MESSAGE,
    ROOMS_SUCCESS_MESSAGE,
    ROOMS_ERROR_MESSAGE,
    ROOMS_EDIT_MESSAGE,
    ROOMS_JOIN_ERROR,
    ROOMS_DELETE_MESSAGE,
    ROOMS_READ_MESSAGES,
    ROOMS_LOAD_MESSAGES,
    ROOMS_SET_LOADING,
    ROOMS_GET_ERROR,
    ROOMS_SET_GET,
    ROOMS_PRELOAD,
    ROOMS_SET_MUTED
} from '../constants'
import SocketController from '../../Controllers/SocketController';
import store from '../store';
import WebRtcController from '../../Controllers/WebRtcController'
import { randomInteger, setForceTitle } from '../../Controllers/FunctionsController';
import {urlApi} from '../../config'
import { toast } from 'react-toastify';

let unmuteTimer = false

export const roomsGet = (apiToken, lang) => (dispatch) => {
    dispatch({
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
            lang
        })
    })
    .then((response) => response.json())
    .then((rooms) => {
        dispatch({
            type: ROOMS_GET,
            payload: rooms
        })

        SocketController.joinLang(lang)
    })
    .catch((err) => {
        dispatch({
            type: ROOMS_GET_ERROR,
        })
    })
}

export const roomsAdd = room => (dispatch) => {
    dispatch({
        type: ROOMS_ADD,
        payload: room
    })
}

export const roomsLoad = (apiToken, lang) => (dispatch) => {
    if(store.getState().rooms.canLoad) {
        dispatch({
            type: ROOMS_PRELOAD,
            payload: []
        })

        fetch(`${urlApi}/api/room/load`, {
            method: "post",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiToken}`,
            },
            body: JSON.stringify({
                lastRoomId: store.getState().rooms.rooms[store.getState().rooms.rooms.length-1]._id,
                firstRoomId: store.getState().rooms.rooms[0]._id,
                lang
            })
        })
        .then((response) => response.json())
        .then((rooms) => {
            dispatch({
                type: ROOMS_PRELOAD,
                payload: rooms
            })
        })
    }
}

export const joinRoom = ({id, apiToken}) => (dispatch) => {
    fetch(`${urlApi}/api/room/get`, {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiToken}`,
            },
            body: JSON.stringify({
                id,
                socketId: SocketController.getSocketId()
            })
        })
        .then(response => response.json())
        .then(({room, muted}) => {
            if(room.error) {
                setForceTitle('Error')

                dispatch({
                    type: ROOMS_JOIN_ERROR,
                    payload: room.errors[0]
                })
                
                return
            }

            room.dialog.messages = room.dialog.messages.reverse()

            room.users.map(x => {
                x.speaking = false
                return 1
            })

            setForceTitle(room.title)

            dispatch({
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
            
            SocketController.joinRoom({roomId: room._id, lang: room.lang})

            try {
                WebRtcController.connectRoom(room._id)
            } catch (err) {
                SocketController.leaveRoom({roomId: room._id, lang: room.lang})
                dispatch({
                    type: ROOMS_JOIN_ERROR,
                    payload: {param: 'all', msg: 'something_goes_wrong'}
                })
            }
        })
        .catch((err) => {
            dispatch({
                type: ROOMS_JOIN_ERROR,
                payload: {param: 'all', msg: 'something_goes_wrong'}
            })
        })
}

export const leaveRoom = (roomId, lang) => (dispatch) => {
    WebRtcController.leaveRoom({roomId, lang})
    dispatch({
        type: ROOMS_LEAVE_ROOM
    })
}

export const sendMessage = (message, apiToken) => (dispatch) => {
    let formData = new FormData()
    let _id = randomInteger(0, 1000000)
    let images = []
    let files = []
    let sounds = []

    for (let i = 0; i < message.images.length; i++) {
        formData.append('images'+i, message.images[i].file)
        message.images[i].file = false
        images.push(message.images[i])
    }

    for (let i = 0; i < message.files.length; i++) {
        formData.append('files'+i, message.files[i].file)
        message.files[i].file = false
        files.push(message.files[i])
    }

    for (let i = 0; i < message.sounds.length; i++) {
        formData.append('sounds'+i, message.sounds[i].file)
        message.sounds[i].file = false
        sounds.push(message.sounds[i])
    }

    let localMessage = {
        _id,
        user: store.getState().user,
        text: message.text,
        images,
        sounds,
        files,
        isLoading: true,
        isError: false,
        isRead: false,
        recentMessages: message.recentMessages,
        createdAt: Date.now(),
        type: 'message'
    }
    
    dispatch({
        type: ROOMS_ADD_MESSAGE,
        payload: localMessage
    })

    let recentMessages = []

    message.recentMessages.map(m => {
        recentMessages.push(m._id)
        return 1
    })

    message.recentMessages = recentMessages
    message.socketId = SocketController.getSocketId()

    formData.append('text', message.text)
    formData.append('recentMessages', message.recentMessages)
    formData.append('roomId', message.roomId)
    formData.append('dialogId', message.dialogId)
    formData.append('socketId', SocketController.getSocketId())
    // formData.append('apiToken', apiToken)

    fetch(`${urlApi}/api/room/send-message`, {
            method: "post",
            headers: {
                // 'Accept': 'application/json',
                // 'Content-Type': 'application/json',
                Authorization: `Bearer ${apiToken}`,
            },
            body: formData
        })
        .then(response => response.json())
        .then(messageRes => {
            if(messageRes.error) {
                if(messageRes.errors[0].msg === 'max_size') {
                    toast.error("Max file size upload 10 Mb.", {
                        position: toast.POSITION.TOP_CENTER
                    });
                }
                return dispatch({
                    type: ROOMS_ERROR_MESSAGE,
                    payload: _id
                })
            }
            dispatch({
                type: ROOMS_SUCCESS_MESSAGE,
                payload: {_id, _newId: messageRes._id}
            })
        })
        .catch(() => {
            dispatch({
                type: ROOMS_ERROR_MESSAGE,
                payload: _id
            })
        })
}

export const editMessage = (message, apiToken) => (dispatch) => {
    let formData = new FormData()

    let images = []
    let files = []
    let sounds = []

    let oldImages = []
    let oldFiles = []
    let oldSounds = []

    for (let i = 0; i < message.images.length; i++) {
        if(message.images[i].file) {
            formData.append('images'+i, message.images[i].file)

            images.push(message.images[i])
        } else {
            oldImages.push(message.images[i].id)
        }
    }

    for (let i = 0; i < message.files.length; i++) {
        if(message.files[i].file) {
            formData.append('files'+i, message.files[i].file)

            files.push(message.files[i])
        } else {
            oldFiles.push(message.files[i].id)
        }
    }

    for (let i = 0; i < message.sounds.length; i++) {
        if(message.sounds[i].file) {
            formData.append('sounds'+i, message.sounds[i].file)

            sounds.push(message.sounds[i])
        } else {
            oldSounds.push(message.sounds[i].id)
        }        
    }

    let localMessage = {
        _id: message._id,
        user: store.getState().user,
        text: message.text,
        images: message.images,
        sounds: message.sounds,
        files: message.files,
        isLoading: true,
        isError: false,
        recentMessages: message.recentMessages,
    }
    
    dispatch({
        type: ROOMS_EDIT_MESSAGE,
        payload: localMessage
    })

    let recentMessages = []

    message.recentMessages.map(m => {
        recentMessages.push(m._id)
        return 1
    })

    message.recentMessages = recentMessages
    message.socketId = SocketController.getSocketId()
    message.roomId = store.getState().rooms.activeRoom._id
    
    formData.append('_id', message._id)
    formData.append('text', message.text)
    formData.append('recentMessages', message.recentMessages)
    formData.append('roomId', message.roomId)
    formData.append('dialogId', message.dialogId)
    formData.append('socketId', SocketController.getSocketId())
    formData.append('oldImages', oldImages)
    formData.append('oldSounds', oldSounds)
    formData.append('oldFiles', oldFiles)

    fetch(`${urlApi}/api/room/edit-message`, {
            method: "post",
            headers: {
                Authorization: `Bearer ${apiToken}`,
            },
            body: formData
        })
        .then(response => response.json())
        .then(messageRes => {
            if(messageRes.error) {
                if(messageRes.errors[0].msg === 'max_size') {
                    toast.error("Max file size upload 10 Mb.", {
                        position: toast.POSITION.TOP_CENTER
                    });
                }
                return dispatch({
                    type: ROOMS_ERROR_MESSAGE,
                    payload: message._id
                })
            }
            dispatch({
                type: ROOMS_SUCCESS_MESSAGE,
                payload: {_id: message._id, _newId: message._id}
            })
        })
        .catch(() => {
            dispatch({
                type: ROOMS_ERROR_MESSAGE,
                payload: message._id
            })
        })
}

export const deleteMessage = ({roomId, deleteMessages}, apiToken) => (dispatch) => {
    let messageIds = []
    deleteMessages.map(m => {
        messageIds.push(m._id)
        return 1
    })

    dispatch({
        type: ROOMS_DELETE_MESSAGE,
        payload: messageIds
    })

    fetch(`${urlApi}/api/room/delete-message`, {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiToken}`,
            },
            body: JSON.stringify({
                roomId,
                messageIds,
                socketId: SocketController.getSocketId()
            })
        })
        .then()
        .catch(() => {
            
        })
}

export const deleteLocalMessage = (_id) => (dispatch) => {
    dispatch({
        type: ROOMS_DELETE_MESSAGE,
        payload: [_id]
    })
}

export const retrySendMessage = (message, apiToken) => (dispatch) => {
    let formData = new FormData()
    let images = []

    let localMessage = {
        _id: message._id,
        user: store.getState().user,
        text: message.text,
        images: message.images,
        sounds: [],
        files: [],
        isLoading: true,
        isError: false,
        recentMessages: message.recentMessages,
        createdAt: Date.now(),
        type: 'message'
    }

    dispatch({
        type: ROOMS_DELETE_MESSAGE,
        payload: [message._id]
    })

    dispatch({
        type: ROOMS_ADD_MESSAGE,
        payload: localMessage
    })

    for (let i = 0; i < message.images.length; i++) {
        formData.append('images'+i, message.images[i].file)

        images.push(message.images[i].path)
    }

    let recentMessages = []

    message.recentMessages.map(m => {
        recentMessages.push(m._id)
        return 1
    })

    message.recentMessages = recentMessages
    message.socketId = SocketController.getSocketId()

    formData.append('text', message.text)
    formData.append('recentMessages', message.recentMessages)
    formData.append('roomId', message.roomId)
    formData.append('dialogId', message.dialogId)
    formData.append('socketId', SocketController.getSocketId())

    fetch(`${urlApi}/api/room/send-message`, {
            method: "post",
            headers: {
                // 'Accept': 'application/json',
                // 'Content-Type': 'application/json',
                Authorization: `Bearer ${apiToken}`,
            },
            body: formData
        })
        .then(response => response.json())
        .then(messageRes => {
            dispatch({
                type: ROOMS_SUCCESS_MESSAGE,
                payload: {_id: message._id, _newId: messageRes._id}
            })
        })
        .catch(() => {
            dispatch({
                type: ROOMS_ERROR_MESSAGE,
                payload: message._id
            })
        })
}

export const readMessages = ({dialogId, userId, roomId}, apiToken) => (dispatch) => {
    let readMessages = store.getState().rooms.activeRoom.dialog.messages.filter(x => !x.isRead && x.user._id !== userId)

    setTimeout(() => {
        if(!!readMessages.length) {
            dispatch({
                type: ROOMS_READ_MESSAGES,
                payload: userId
            })
        }
    }, 750)

    if(!!readMessages.length) {
        fetch(`${urlApi}/api/room/read-messages`, {
                method: "post",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiToken}`,
                },
                body: JSON.stringify({
                    dialogId,
                    roomId
                })
            })
            .then()
            .catch(() => {
                
            })
    }
}

export const loadMessages = ({dialogId, userId, roomId}, apiToken) => (dispatch) => {
    let lastMessage = store.getState().rooms.activeRoom.dialog.messages[0]

    dispatch({
        type: ROOMS_SET_LOADING
    })

    dispatch({
        type: ROOMS_LOAD_MESSAGES,
        payload: {messages: [], canLoad: false}
    })

    fetch(`${urlApi}/api/room/load-messages`, {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiToken}`,
            },
            body: JSON.stringify({
                dialogId,
                lastMessageId: lastMessage._id
            })
        })
        .then(response => response.json())
        .then(messages => {
            dispatch({
                type: ROOMS_LOAD_MESSAGES,
                payload: {messages: messages.reverse(), canLoad: messages.length  === 50}
            })
        })
        .catch(() => {
            
        })
}