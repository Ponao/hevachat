import { 
    ROOMS_GET,
    ROOMS_ADD,
    ROOMS_DELETE,
    ROOMS_EDIT,
    ROOMS_JOIN_ROOM,
    ROOMS_LEAVE_ROOM,
    ROOMS_USER_JOIN_ROOM,
    ROOMS_USER_LEAVE_ROOM,
    ROOMS_ADD_MESSAGE,
    ROOMS_SUCCESS_MESSAGE,
    ROOMS_ERROR_MESSAGE,
    ROOMS_EDIT_MESSAGE,
    ROOMS_READ_MESSAGE,
    ROOMS_JOIN_ERROR,
    ROOMS_DELETE_MESSAGE
} from '../constants'

const INITIAL_STATE = {
    isFetching: true,
    getted: false,
    activeRoom: false,
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
        case ROOMS_JOIN_ERROR:
            return { ...state, activeRoom: { error: action.payload } }
        case ROOMS_LEAVE_ROOM:
            return { ...state, activeRoom: false }
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
        case ROOMS_ADD_MESSAGE: 
            return { ...state, activeRoom: { ...state.activeRoom, dialog: { ...state.activeRoom.dialog, messages: [ ...state.activeRoom.dialog.messages, action.payload ] } } }
        case ROOMS_SUCCESS_MESSAGE: 
            return { ...state, activeRoom: { ...state.activeRoom, dialog: { ...state.activeRoom.dialog, messages: state.activeRoom.dialog.messages.map(message => 
                action.payload._id === message._id ? 
                { ...message, isLoading: false, _id: action.payload._newId } :
                message
            ) } } }
        case ROOMS_ERROR_MESSAGE: 
            return { ...state, activeRoom: { ...state.activeRoom, dialog: { ...state.activeRoom.dialog, messages: state.activeRoom.dialog.messages.map(message => 
                action.payload === message._id ? 
                { ...message, isLoading: false, isError: true } :
                message
            ) } } }
        case ROOMS_EDIT_MESSAGE: 
            return { ...state, activeRoom: { ...state.activeRoom, dialog: { ...state.activeRoom.dialog, messages: state.activeRoom.dialog.messages.map(message => 
                action.payload._id === message._id ? 
                { ...message, ...action.payload } :
                message
            ) } } }
        case ROOMS_DELETE_MESSAGE:
            return { ...state, activeRoom: { ...state.activeRoom, dialog: { ...state.activeRoom.dialog, messages: [
                ...state.activeRoom.dialog.messages.filter(message => {        
                    return !action.payload.find(x => x === message._id)
                })
            ]
            } } }
        default: 
            return state
    }
}

export default rooms