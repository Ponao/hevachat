import { 
    USER_LOGIN,
    USER_LOGOUT,
    USER_UPDATE_ROOM_LANG
} from '../constants'


export const loginUser = (user, apiToken) => (dispatch) => {
    user.apiToken = apiToken
    dispatch({
        type: USER_LOGIN,
        payload: user
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