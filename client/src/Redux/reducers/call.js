import { 
    CALL_SET_USER,
    CALL_SET_STATUS,
    CALL_SET_REMOTE_STREAM,
    CALL_SET_MEDIA
} from '../constants'

const INITIAL_STATE = {
    user: false,
    status: 'none', // none, outcoming, incoming, busy, active, canceled
    remoteStream: false,
    media: 'audio'
}

const call = (state = INITIAL_STATE, action) => {
    switch(action.type) {
        case CALL_SET_USER:
            return { ...state, user: action.payload.user, status: action.payload.status }
        case CALL_SET_STATUS:
            return { ...state, status: action.payload }
        case CALL_SET_REMOTE_STREAM:
            return { ...state, remoteStream: action.payload }
        case CALL_SET_MEDIA:
            return { ...state, media: action.payload }
        default:    
            return state
    }
}

export default call