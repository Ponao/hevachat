import { 
    USER_LOGIN,
    USER_LOGOUT,
    USER_UPDATE_ROOM_LANG,
    USER_SET_AVATAR
} from '../constants'

const INITIAL_STATE = {
    isAuth: false
}

const user = (state = INITIAL_STATE, action) => {
    switch(action.type) {
        case USER_LOGIN: {
            return { ...state, ...action.payload, isAuth: true }
        }
        case USER_LOGOUT:
            return { isAuth: false }
        case USER_UPDATE_ROOM_LANG:
            return { ...state, roomLang: action.payload }
        case USER_SET_AVATAR:
            return { ...state, avatar: action.payload }
        default: 
            return state
    }
}

export default user