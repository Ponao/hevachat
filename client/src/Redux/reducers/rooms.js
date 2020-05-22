import { 
    ROOMS_GET,
    ROOMS_ADD,
    ROOMS_DELETE,
    ROOMS_EDIT,
    ROOMS_JOIN_ROOM,
    ROOMS_LEAVE_ROOM,
    ROOMS_USER_JOIN_ROOM,
    ROOMS_USER_LEAVE_ROOM
} from '../constants'

const INITIAL_STATE = {
    isFetching: true,
    getted: false,
    activeRoom: {},
    rooms: []
}

const rooms = (state = INITIAL_STATE, action) => {
    switch(action.type) {
        case ROOMS_GET: {
            return { ...state, rooms: action.payload, isFetching: false, getted: true }
        }
        case ROOMS_ADD:
            return { ...state, rooms: [ action.payload, ...state.rooms ]  }
        case ROOMS_JOIN_ROOM:
            return { ...state, activeRoom: action.payload }
        case ROOMS_LEAVE_ROOM:
            return { ...state, activeRoom: {} }
        case ROOMS_USER_JOIN_ROOM:
            return { ...state, rooms: state.rooms.map(room => 
                action.payload.roomId === room._id ? 
                { ...room, users: [ action.payload.user, ...room.users ] } :
                room
            ) }
        case ROOMS_USER_LEAVE_ROOM:
            return { ...state, rooms: state.rooms.map(room => 
                action.payload.roomId === room._id ? 
                { ...room, users: [
                        ...room.users.filter(user => {                        
                            return user._id !== action.payload.userId
                        })
                    ]
                } :
                room
            ) }
        default: 
            return state
    }
}

export default rooms