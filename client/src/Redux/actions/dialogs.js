import { 
    DIALOGS_GET,
    DIALOGS_ADD,
    DIALOGS_ADD_MESSAGE,
    DIALOGS_SUCCESS_MESSAGE,
    DIALOGS_ERROR_MESSAGE,
    DIALOGS_READ_MESSAGES,
    DIALOGS_LOAD,
    DIALOGS_EDIT_MESSAGE,
    DIALOGS_DELETE_MESSAGE,
    DIALOGS_SET_LOADING,
    DIALOGS_LOAD_MESSAGES,
    DIALOGS_UPDATE_ONLINE,
    DIALOGS_SET_FORWARD,
    DIALOGS_PRELOAD
} from '../constants'
import store from '../store';
import { randomInteger } from '../../Controllers/FunctionsController';
import SocketController from '../../Controllers/SocketController';
import { toast } from 'react-toastify';
import {urlApi} from '../../config'

export const dialogsGet = (apiToken) => (dispatch) => {
    fetch(`${urlApi}/api/dialog/get-all`, {
        method: "post",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiToken}`,
        }
    })
    .then((response) => response.json())
    .then((dialogs) => {
        for (let i = 0; i < dialogs.length; i++) {
            let existDialog = store.getState().dialogs.dialogs.find(x => x._id === dialogs[i]._id)
            
            if(existDialog) {
                dialogs[i] = existDialog
            } else {
                dialogs[i].user = dialogs[i].users.find(user => user._id !== store.getState().user._id)

                if(!dialogs[i].user)
                    dialogs[i].user = dialogs[i].users[0]

                dialogs[i].typers = []
            }
        }

        dispatch({
            type: DIALOGS_GET,
            payload: dialogs
        })
    });
}

export const dialogsLoad = (apiToken) => (dispatch) => {
    if(store.getState().dialogs.canLoad) {
        dispatch({
            type: DIALOGS_PRELOAD,
            payload: []
        })

        fetch(`${urlApi}/api/dialog/load`, {
            method: "post",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiToken}`,
            },
            body: JSON.stringify({
                lastDialogId: store.getState().dialogs.dialogs[store.getState().dialogs.dialogs.length-1]._id,
                firstDialogId: store.getState().dialogs.dialogs[0]._id
            })
        })
        .then((response) => response.json())
        .then((dialogs) => {
            for (let i = 0; i < dialogs.length; i++) {
                let existDialog = store.getState().dialogs.dialogs.find(x => x._id === dialogs[i]._id)
                
                if(existDialog) {
                    dialogs[i] = existDialog
                } else {
                    dialogs[i].user = dialogs[i].users.find(user => user._id !== store.getState().user._id)
    
                    if(!dialogs[i].user)
                        dialogs[i].user = dialogs[i].users[0]
    
                    dialogs[i].typers = []
                }
            }
            
            dispatch({
                type: DIALOGS_PRELOAD,
                payload: dialogs
            })
        })
    }
}

export const dialogGet = (userId, apiToken) => (dispatch) => {
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

            dispatch({
                type: DIALOGS_ADD,
                payload: {dialog}
            })
        } else {
            let dialog = {
                getted: true,
                isNotFound: true,
                user: {_id: userId}
            }

            dispatch({
                type: DIALOGS_ADD,
                payload: {dialog}
            })
        }
    });
}

export const dialogLoad = (userId, apiToken) => (dispatch) => {
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
        dialog.messages = messages.reverse()

        dispatch({
            type: DIALOGS_LOAD,
            payload: {dialogId: dialog._id, messages: dialog.messages, canLoad: messages.length === 50}
        })
    });
}

export const updateOnline = (userId, apiToken) => (dispatch) => {
    fetch(`${urlApi}/api/user/get-online`, {
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
    .then(({online, onlineAt}) => {
        dispatch({
            type: DIALOGS_UPDATE_ONLINE,
            payload: {userId, online, onlineAt}
        })
    });
}

export const setForward = (messages) => (dispatch) => {
    dispatch({
        type: DIALOGS_SET_FORWARD,
        payload: messages
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
        images.push(message.images[i])
    }

    for (let i = 0; i < message.files.length; i++) {
        formData.append('files'+i, message.files[i].file)
        files.push(message.files[i])
    }

    for (let i = 0; i < message.sounds.length; i++) {
        formData.append('sounds'+i, message.sounds[i].file)
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
        type: DIALOGS_ADD_MESSAGE,
        payload: {message: localMessage, dialogId: message.dialogId}
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
    formData.append('dialogId', message.dialogId)
    formData.append('userId', message.userId)
    formData.append('socketId', SocketController.getSocketId())

    fetch(`${urlApi}/api/dialog/send-message`, {
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
                    type: DIALOGS_ERROR_MESSAGE,
                    payload: {_id, dialogId: message.dialogId}
                })
            }
            dispatch({
                type: DIALOGS_SUCCESS_MESSAGE,
                payload: {_id, _newId: messageRes._id, dialogId: message.dialogId}
            })
        })
        .catch(() => {
            dispatch({
                type: DIALOGS_ERROR_MESSAGE,
                payload: {_id, dialogId: message.dialogId}
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

    let last = store.getState().dialogs.dialogs.find(x => x._id === message.dialogId).messages[store.getState().dialogs.dialogs.find(x => x._id === message.dialogId).messages.length-1]
    
    dispatch({
        type: DIALOGS_EDIT_MESSAGE,
        payload: {
            message: localMessage, 
            dialogId: message.dialogId, 
            editLast: last._id === message._id
        }
    })

    let recentMessages = []

    message.recentMessages.map(m => {
        recentMessages.push(m._id)
        return 1
    })

    message.recentMessages = recentMessages
    message.socketId = SocketController.getSocketId()
    
    formData.append('_id', message._id)
    formData.append('text', message.text)
    formData.append('recentMessages', message.recentMessages)
    formData.append('userId', message.userId)
    formData.append('dialogId', message.dialogId)
    formData.append('socketId', SocketController.getSocketId())
    formData.append('oldImages', oldImages)
    formData.append('oldSounds', oldSounds)
    formData.append('oldFiles', oldFiles)

    fetch(`${urlApi}/api/dialog/edit-message`, {
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
                    type: DIALOGS_ERROR_MESSAGE,
                    payload: {_id: message._id, dialogId: message.dialogId}
                })
            }
            dispatch({
                type: DIALOGS_SUCCESS_MESSAGE,
                payload: {_id: message._id, _newId: message._id, dialogId: message.dialogId}
            })
        })
        .catch(() => {
            dispatch({
                type: DIALOGS_ERROR_MESSAGE,
                payload: {_id: message._id, dialogId: message.dialogId}
            })
        })
}

export const readMessages = ({dialogId, userId, otherId}, apiToken) => (dispatch) => {
    let readMessages = store.getState().dialogs.dialogs.find(dialog => dialog._id === dialogId).messages.filter(x => !x.isRead && x.user._id !== userId)

    setTimeout(() => {
        if(!!readMessages.length) {
            dispatch({
                type: DIALOGS_READ_MESSAGES,
                payload: {dialogId, userId: otherId, noRead: true, noReadCount: true}
            })
        }
    }, 1)

    if(!!readMessages.length) {
        fetch(`${urlApi}/api/dialog/read-messages`, {
                method: "post",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiToken}`,
                },
                body: JSON.stringify({
                    dialogId,
                    otherId,
                    socketId: SocketController.getSocketId()
                })
            })
            .then()
            .catch(() => {
                
            })
    }
}

export const retrySendMessage = (message, apiToken) => (dispatch) => {
    let dialogId = message.dialogId
    let formData = new FormData()
    let images = []
    let files = []
    let sounds = []

    for (let i = 0; i < message.images.length; i++) {
        formData.append('images'+i, message.images[i].file)
        images.push(message.images[i])
    }

    for (let i = 0; i < message.files.length; i++) {
        formData.append('files'+i, message.files[i].file)
        files.push(message.files[i])
    }

    for (let i = 0; i < message.sounds.length; i++) {
        formData.append('sounds'+i, message.sounds[i].file)
        sounds.push(message.sounds[i])
    }

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
        type: DIALOGS_DELETE_MESSAGE,
        payload: {dialogId, messageIds: [message._id], lastMessage: false}
    })

    dispatch({
        type: DIALOGS_ADD_MESSAGE,
        payload: {message: localMessage, dialogId: message.dialogId}
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
    formData.append('userId', message.userId)
    formData.append('dialogId', message.dialogId)
    formData.append('socketId', SocketController.getSocketId())

    fetch(`${urlApi}/api/dialog/send-message`, {
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
                return dispatch({
                    type: DIALOGS_ERROR_MESSAGE,
                    payload: {_id: message._id, dialogId: message.dialogId}
                })
            }
            dispatch({
                type: DIALOGS_SUCCESS_MESSAGE,
                payload: {_id: message._id, _newId: messageRes._id, dialogId: message.dialogId}
            })
        })
        .catch(() => {
            dispatch({
                type: DIALOGS_ERROR_MESSAGE,
                payload: {_id: message._id, dialogId: message.dialogId}
            })
        })
}

export const deleteMessage = ({dialogId, otherId, deleteMessages}, apiToken) => (dispatch) => {
    let messageIds = []
    deleteMessages.map(m => {
        messageIds.push(m._id)
        return 1
    })

    let lastMessage

    if(store.getState().dialogs.dialogs.find(x => x._id === dialogId) && !!store.getState().dialogs.dialogs.find(x => x._id === dialogId).messages.length)
        lastMessage = store.getState().dialogs.dialogs.find(x => x._id === dialogId).messages.filter(x => !messageIds.find(y => y === x._id)).pop()
    else 
        lastMessage = false

    dispatch({
        type: DIALOGS_DELETE_MESSAGE,
        payload: {dialogId, messageIds, lastMessage}
    })

    fetch(`${urlApi}/api/dialog/delete-message`, {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiToken}`,
            },
            body: JSON.stringify({
                dialogId,
                otherId,
                messageIds,
                socketId: SocketController.getSocketId()
            })
        })
        .then()
        .catch(() => {
            
        })
}

export const deleteLocalMessage = (_id, dialogId) => (dispatch) => {
    let messageIds = [_id]

    let lastMessage
    if(store.getState().dialogs.dialogs.find(x => x._id === dialogId) && !!store.getState().dialogs.dialogs.find(x => x._id === dialogId).messages.length)
        lastMessage = store.getState().dialogs.dialogs.find(x => x._id === dialogId).messages.filter(x => !messageIds.find(y => y === x._id)).pop()
    else 
        lastMessage = false

    dispatch({
        type: DIALOGS_DELETE_MESSAGE,
        payload: {dialogId, messageIds, lastMessage}
    })
}

export const loadMessages = ({dialogId}, apiToken) => (dispatch) => {
    let lastMessage = store.getState().dialogs.dialogs.find(x => x._id === dialogId).messages[0]

    dispatch({
        type: DIALOGS_SET_LOADING,
        payload: dialogId
    })

    fetch(`${urlApi}/api/dialog/load-messages`, {
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
                type: DIALOGS_LOAD_MESSAGES,
                payload: {dialogId,  messages: messages.reverse(), canLoad: messages.length  === 50}
            })
        })
        .catch(() => {
            
        })
}