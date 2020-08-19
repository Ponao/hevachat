import { 
    TOASTS_ADD,
    TOASTS_REMOVE
} from '../constants'

const INITIAL_STATE = {
    toasts: []
}

const toasts = (state = INITIAL_STATE, action) => {
    switch(action.type) {
        case TOASTS_ADD:
            return { ...state, toasts: [ {...action.payload.toast, toastType: action.payload.toastType}, ...state.toasts ] }
        case TOASTS_REMOVE:
            return { ...state, toasts: [...state.toasts.filter(toast => toast._id !== action.payload)] }
        default: 
            return state
    }
}

export default toasts