import { 
    USER_LOGIN,
    USER_LOGOUT,
    USER_UPDATE_ROOM_LANG,
    DIALOGS_GET,
    NOTIFICATIONS_SET_NO_READ
} from '../constants'
import store from '../store'


export const loginUser = (user, dialogs, noReadCount, noReadNotifications, apiToken) => (dispatch) => {
    user.apiToken = apiToken
    
    dispatch({
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