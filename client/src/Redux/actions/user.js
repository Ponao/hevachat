import { 
    USER_LOGIN,
    USER_LOGOUT,
    USER_UPDATE_ROOM_LANG,
    DIALOGS_GET,
    NOTIFICATIONS_SET_NO_READ,
    USER_SET_AVATAR
} from '../constants'
import store from '../store'
import { toast } from 'react-toastify'
import { urlApi } from '../../config'


export const loginUser = (user, dialogs, noReadCount, noReadNotifications, apiToken) => (dispatch) => {
    user.apiToken = apiToken
    
    dispatch({
        type: USER_LOGIN,
        payload: user
    })

    for (let i = 0; i < dialogs.length; i++) {
        dialogs[i].user = dialogs[i].users.find(userN => userN._id !== user._id)

        if(!dialogs[i].user)
            dialogs[i].user = dialogs[i].users[0]

        dialogs[i].typing = false
        dialogs[i].getted = false
        dialogs[i].isLoading = false

        if(dialogs[i].lastMessage) {
            dialogs[i].lastMessage.isLoading = false
            dialogs[i].lastMessage.isError = false
        }

        if(dialogs[i].lastMessage && dialogs[i].lastMessage.user._id === user._id)
            dialogs[i].noRead = 0
    }

    dispatch({
        type: DIALOGS_GET,
        payload: {dialogs, noReadCount}
    })

    dispatch({
        type: NOTIFICATIONS_SET_NO_READ,
        payload: noReadNotifications
    })
}

export const logoutUser = () => (dispatch) => {
    dispatch({
        type: USER_LOGOUT
    })
}

export const updateRoomLang = (lang) => (dispatch) => {
    dispatch({
        type: USER_UPDATE_ROOM_LANG,
        payload: lang
    })
}

export const uploadAvatar = (e, apiToken) => (dispatch) => {
    if(e.target.files[0]) {
        let file = {
            path: (window.URL || window.webkitURL).createObjectURL(new Blob([e.target.files[0]], {type: e.target.files[0].type})), 
            file: e.target.files[0], 
            name: e.target.files[0].name, 
            type: e.target.files[0].name.split('.').pop(),
            size: e.target.files[0].size / 1000
        }

        let formData = new FormData()
        formData.append('avatar', file.file)

        fetch(`${urlApi}/api/user/upload-avatar`, {
            method: "post",
            headers: {
                // 'Accept': 'application/json',
                // 'Content-Type': 'application/json',
                Authorization: `Bearer ${apiToken}`,
            },
            body: formData
        })
        .then(response => response.json())
        .then(res => {
            if(res.error) {
                if(res.errors[0].msg === 'max_size') {
                    toast.error("Max file size upload 10 Mb.", {
                        position: toast.POSITION.TOP_CENTER
                    });
                }
            }
            dispatch({
                type: USER_SET_AVATAR,
                payload: {original: file.path, min: file.path}
            })
        })
        .catch(() => {
            toast.error("Something goes worng", {
                position: toast.POSITION.TOP_CENTER
            });
        })
    }
}