import { 
    NOTIFICATIONS_GET,
    NOTIFICATIONS_ADD,
} from '../constants'

const INITIAL_STATE = {
    isFetching: true,
    getted: false,
    activeRoom: false,
    isError: false,
    notifications: []
}

const rooms = (state = INITIAL_STATE, action) => {
    switch(action.type) {
        case NOTIFICATIONS_GET: {
            return { ...state, notifications: action.payload, isFetching: false, getted: true }
        }
        case NOTIFICATIONS_ADD:
            return { ...state, notifications: [ action.payload, ...state.notifications ]  }
        default: 
            return state
    }
}

export default rooms