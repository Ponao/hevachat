import { 
    TOASTS_ADD,
    TOASTS_REMOVE,
    TOAST_SET_FORCE
} from '../constants'

const INITIAL_STATE = {
    toasts: [],
    force: {id: false, type: false}
}

const toasts = (state = INITIAL_STATE, action) => {
    switch(action.type) {
        case TOASTS_ADD:
            return { ...state, toasts: [ {...action.payload.toast, toastType: action.payload.toastType}, ...state.toasts ] }
        case TOASTS_REMOVE:
            return { ...state, toasts: [...state.toasts.filter(toast => toast._id !== action.payload)] }
        case TOAST_SET_FORCE:
            return { ...state, force: {id: action.payload.id, type: action.payload.type} }
        default: 
            return state
    }
}

export default toasts