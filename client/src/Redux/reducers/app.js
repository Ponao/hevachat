import { 
    APP_SET_STATUS_NETWORK
} from '../constants'

const INITIAL_STATE = {
    connecting: false
}

const app = (state = INITIAL_STATE, action) => {
    switch(action.type) {
        case APP_SET_STATUS_NETWORK:
            return { ...state, connecting: action.payload }
        default:    
            return state
    }
}

export default app