import { 
    ROOMS_GET,
    ROOMS_ADD,
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
    ROOMS_USER_JOIN_IN_ROOM,
    ROOMS_SET_GET,
    ROOMS_GET_ERROR,
    ROOMS_EDIT_ROOM,
    ROOMS_EDIT_IN_ROOM,
    ROOMS_DELETE_ROOM,
    ROOMS_PRELOAD,
    ROOMS_SET_MUTED,
    ROOMS_SET_FORCE
} from '../constants'

const INITIAL_STATE = {
    isFetching: true,
    getted: false,
    activeRoom: false,
    isError: false,
    rooms: [],
    canLoad: false,
    force: false
}

const rooms = (state = INITIAL_STATE, action) => {
    switch(action.type) {
        case ROOMS_GET: {
            return { ...state, rooms: action.payload, isFetching: false, getted: true, canLoad: action.payload.length === 20 }
        }
        case ROOMS_PRELOAD:
            return { ...state, rooms: [ ...state.rooms, ...action.payload ], canLoad: action.payload.length === 20 }
        case ROOMS_SET_GET: {
            return { ...state, isFetching: true, getted: false, isError: false }
        }
        case ROOMS_GET_ERROR: {
            return { ...state, isFetching: false, getted: true, isError: true }
        }
        case ROOMS_ADD:
            return { ...state, rooms: [ action.payload, ...state.rooms ]  }
        case ROOMS_EDIT_ROOM:
            return { ...state, rooms: state.rooms.map(room => 
                action.payload._id === room._id ? { ...room, title: action.payload.title, isPrivate: action.payload.isPrivate} : room
            ) }
        case ROOMS_DELETE_ROOM:
            return { ...state, rooms: [...state.rooms.filter(room => room._id !== action.payload)] }
        case ROOMS_JOIN_ROOM:
            return { ...state, activeRoom: {...action.payload.room, typers: [], canLoad: action.payload.canLoad, isLoading: false, remoteStream: false, muted: action.payload.muted} }
        case ROOMS_SET_MUTED:
            return { ...state, activeRoom: {...state.activeRoom, muted: action.payload} }
        case ROOMS_JOIN_ERROR:
            return { ...state, activeRoom: { error: action.payload } }
        case ROOMS_USER_LEAVE_IN_ROOM:
            return { ...state, activeRoom: { ...state.activeRoom, users: [
                ...state.activeRoom.users.filter(user => {                        
                    return user._id !== action.payload
                })
            ] } }
        case ROOMS_SET_FORCE:
            return { ...state, force: action.payload }
        case ROOMS_USER_JOIN_IN_ROOM:
            return { ...state, activeRoom: { ...state.activeRoom, users: [ ...state.activeRoom.users, action.payload ] } }
        case ROOMS_EDIT_IN_ROOM:
            return { ...state, activeRoom: { ...state.activeRoom, title: action.payload.title, isPrivate: action.payload.isPrivate } }
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
                { ...message, isLoading: false, _id: action.payload._newId,
                    files: message.files.map(item => {return { ...item, file: false}}),
                    sounds: message.sounds.map(item => {return { ...item, file: false}}),
                    images: message.images.map(item => {return { ...item, file: false}})
                } :
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