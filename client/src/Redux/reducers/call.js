import { 
    CALL_SET_USER,
    CALL_SET_STATUS
} from '../constants'

const INITIAL_STATE = {
    user: false,
    status: 'none', // none, outcoming, incoming, busy, active, canceled

}

const call = (state = INITIAL_STATE, action) => {
    switch(action.type) {
        case CALL_SET_USER:
            return { ...state, user: action.payload.user, status: action.payload.status }
        case CALL_SET_STATUS:
            return { ...state, status: action.payload }
        default:    
            return state
    }
}

export default call