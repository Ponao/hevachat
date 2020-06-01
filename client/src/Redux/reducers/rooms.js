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
    ROOMS_DELETE_MESSAGE,
    ROOMS_READ_MESSAGES,
    ROOMS_ADD_TYPER,
    ROOMS_REMOVE_TYPER,
    ROOMS_LOAD_MESSAGES,
    ROOMS_SET_LOADING,
    ROOMS_SET_REMOTE_STREAM,
    ROOMS_SET_SPEAKING_STATUS,
    ROOMS_USER_LEAVE_IN_ROOM,
    ROOMS_USER_JOIN_IN_ROOM
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
            return { ...state, activeRoom: {...action.payload.room, typers: [], canLoad: action.payload.canLoad, isLoading: false, remoteStream: false} }
        case ROOMS_JOIN_ERROR:
            return { ...state, activeRoom: { error: action.payload } }
        case ROOMS_USER_LEAVE_IN_ROOM:
            return { ...state, activeRoom: { ...state.activeRoom, users: [
                ...state.activeRoom.users.filter(user => {                        
                    return user._id !== action.payload
                })
            ] } }
        case ROOMS_USER_JOIN_IN_ROOM:
            return { ...state, activeRoom: { ...state.activeRoom, users: [ ...state.activeRoom.users, action.payload ] } }
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
                { ...message, ...action.payload, isEdit: true } :
                message
            ) } } }
        case ROOMS_DELETE_MESSAGE:
            return { ...state, activeRoom: { ...state.activeRoom, dialog: { ...state.activeRoom.dialog, messages: [
                ...state.activeRoom.dialog.messages.filter(message => {        
                    return !action.payload.find(x => x === message._id)
                })
            ]
            } } }
        case ROOMS_READ_MESSAGE:
            return { ...state, activeRoom: { ...state.activeRoom, dialog: { ...state.activeRoom.dialog, messages: state.activeRoom.dialog.messages.map(message => 
                !message.isRead && message.user._id === action.payload ? 
                { ...message, isRead: true } :
                message
            ) } } }
        case ROOMS_READ_MESSAGES:
            return { ...state, activeRoom: { ...state.activeRoom, dialog: { ...state.activeRoom.dialog, messages: state.activeRoom.dialog.messages.map(message => 
                !message.isRead && message.user._id !== action.payload ? 
                { ...message, isRead: true } :
                message
            ) } } }
        case ROOMS_SET_REMOTE_STREAM:
            return { ...state, activeRoom: { ...state.activeRoom, remoteStream: action.payload } }
        case ROOMS_SET_LOADING:
            return { ...state, activeRoom: { ...state.activeRoom, canLoad: false, isLoading: true } }
        case ROOMS_LOAD_MESSAGES:
            return { ...state, activeRoom: { ...state.activeRoom, isLoading: false, canLoad: action.payload.canLoad, dialog: { ...state.activeRoom.dialog, messages: [...action.payload.messages, ...state.activeRoom.dialog.messages] } } }
        case ROOMS_ADD_TYPER: 
            return { ...state, activeRoom: { ...state.activeRoom, typers: [ action.payload, ...state.activeRoom.typers ] } }
        case ROOMS_REMOVE_TYPER: 
            return { ...state, activeRoom: { ...state.activeRoom, typers: [ ...state.activeRoom.typers.filter(user => {        
                return user._id !== action.payload
            }) ] } }
        case ROOMS_SET_SPEAKING_STATUS: 
            return { ...state, activeRoom: { ...state.activeRoom, users: state.activeRoom.users.map(user => 
                user._id === action.payload.userId ?
                { ...user, speaking: action.payload.speaking } :
                user
            ) } }
        default: 
            return state
    }
}

export default rooms