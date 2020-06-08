import { 
    USERS_GET,
    USERS_ADD,
    USERS_SET_ACTIVE_USER_ID,
    USERS_SET_FRIEND_STATUS,
    USERS_SET
} from '../constants'

const INITIAL_STATE = {
    isFetching: true,
    getted: false,
    activeUserId: false,
    isError: false,
    canLoad: false,
    users: []
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
        default: 
            return state
    }
}

export default rooms