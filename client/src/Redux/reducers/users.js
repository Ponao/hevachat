import { 
    USERS_GET,
    USERS_ADD,
    USERS_SET_ACTIVE_USER_ID,
    USERS_SET_FRIEND_STATUS,
    USERS_SET,
    USERS_FRIENDS_GET,
    USERS_REQUESTED_GET,
    USERS_PENDING_GET,
    USERS_FRIENDS_REMOVE,
    USERS_REQUESTED_REMOVE,
    USERS_PENDING_REMOVE,
    USERS_FRIENDS_ADD,
    USERS_REQUESTED_ADD,
    USERS_PENDING_ADD
} from '../constants'

const INITIAL_STATE = {
    isFetching: true,
    getted: false,
    activeUserId: false,
    isError: false,
    canLoad: false,
    users: [],
    friends: {
        users: [],
        getted: false,
        canLoad: false,
        isFetching: true,
    },
    requested: {
        users: [],
        getted: false,
        canLoad: false,
        isFetching: true,
    },
    pending: {
        users: [],
        getted: false,
        canLoad: false,
        isFetching: true,
    },
}

const rooms = (state = INITIAL_STATE, action) => {
    switch(action.type) {
        case USERS_SET: {
            return { ...state, users: action.payload.friends, canLoad: action.payload.canLoad, isFetching: false, getted: true }
        }
        case USERS_ADD:
            return { ...state, users: [ action.payload, ...state.users ]  }
        case USERS_SET_ACTIVE_USER_ID:
            return {...state, activeUserId: action.payload}
        case USERS_SET_FRIEND_STATUS:
            return { ...state, users: state.users.map(user => 
                action.payload.userId === user._id ? 
                { ...user, friendStatus: action.payload.friendStatus
                } :
                user
            ) }
        case USERS_FRIENDS_GET:
            return { ...state, friends: { ...state.friends, users: action.payload.users, canLoad: action.payload.canLoad, isFetching: false, getted: true } }
        case USERS_REQUESTED_GET:
            return { ...state, requested: { ...state.requested, users: action.payload.users, canLoad: action.payload.canLoad, isFetching: false, getted: true } }
        case USERS_PENDING_GET:
            return { ...state, pending: { ...state.pending, users: action.payload.users, canLoad: action.payload.canLoad, isFetching: false, getted: true } }
        case USERS_FRIENDS_REMOVE:
            return { ...state, friends: { ...state.friends, users: [ ...state.friends.users.filter(user => {        
                return action.payload.userId !== user._id
            })] } }
        case USERS_REQUESTED_REMOVE:
            return { ...state, requested: { ...state.requested, users: [ ...state.requested.users.filter(user => {        
                return action.payload.userId !== user._id
            })] } }
        case USERS_PENDING_REMOVE:
            return { ...state, pending: { ...state.pending, users: [ ...state.pending.users.filter(user => {        
                return action.payload.userId !== user._id
            })] } }
        case USERS_FRIENDS_ADD:
            return { ...state, friends: { ...state.friends, users: [ action.payload.user, ...state.friends.users] } }
        case USERS_REQUESTED_ADD:
            return { ...state, requested: { ...state.requested, users: [ action.payload.user, ...state.requested.users] } }
        case USERS_PENDING_ADD:
            return { ...state, pending: { ...state.pending, users: [ action.payload.user, ...state.pending.users] } }
        default: 
            return state
    }
}

export default rooms