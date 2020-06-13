import { 
    NOTIFICATIONS_GET,
    NOTIFICATIONS_ADD,
    NOTIFICATIONS_READ,
    NOTIFICATIONS_SET_NO_READ,
    NOTIFICATIONS_REMOVE
} from '../constants'

const INITIAL_STATE = {
    isFetching: true,
    getted: false,
    activeRoom: false,
    isError: false,
    notifications: [],
    noRead: 0
}

const rooms = (state = INITIAL_STATE, action) => {
    switch(action.type) {
        case NOTIFICATIONS_GET: {
            return { ...state, notifications: action.payload, isFetching: false, getted: true }
        }
        case NOTIFICATIONS_ADD:
            return { ...state, notifications: [ action.payload, ...state.notifications ], noRead: state.noRead+1 }
        case NOTIFICATIONS_READ:
            return { ...state, notifications: state.notifications.map(notification => 
                action.payload === notification._id ?
                { ...notification, isRead: true } :
                notification
            ), noRead: state.noRead - 1 }
        case NOTIFICATIONS_SET_NO_READ:
            return { ...state, noRead: action.payload }
        case NOTIFICATIONS_REMOVE:
            return { ...state, notifications: [...state.notifications.filter(notification => notification._id !== action.payload)] }
        default: 
            return state
    }
}

export default rooms