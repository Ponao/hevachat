import { 
    DIALOGS_ADD,
    DIALOGS_GET,
    DIALOGS_ADD_MESSAGE,
    DIALOGS_SUCCESS_MESSAGE,
    DIALOGS_ERROR_MESSAGE,
    DIALOGS_READ_MESSAGES,
    DIALOGS_LOAD,
    DIALOGS_SET_TYPER,
    DIALOGS_EDIT_MESSAGE,
    DIALOGS_DELETE_MESSAGE,
    DIALOGS_SET_LOADING,
    DIALOGS_LOAD_MESSAGES,
    DIALOGS_UPDATE_ONLINE,
    DIALOGS_SET_FORWARD
} from '../constants'

const INITIAL_STATE = {
    isFetching: true,
    dialogs: [],
    forwardMessages: []
}

const dialogs = (state = INITIAL_STATE, action) => {
    switch(action.type) {
        case DIALOGS_GET: {
            return { ...state, dialogs: action.payload.dialogs, isFetching: false, noReadCount: action.payload.noReadCount }
        }
        case DIALOGS_ADD:
            return { ...state, dialogs: [ action.payload, ...state.dialogs ]  }
        case DIALOGS_LOAD:
            return { ...state, dialogs: state.dialogs.map(dialog => 
                action.payload.dialogId === dialog._id ? 
                { ...dialog, messages: action.payload.messages, getted: true, canLoad: action.payload.canLoad } :
                dialog
            ) }
        case DIALOGS_ADD_MESSAGE:
            return { ...state, dialogs: state.dialogs.map(dialog => 
                action.payload.dialogId === dialog._id ? 
                { ...dialog, messages: [
                        ...dialog.messages,
                        action.payload.message
                    ],
                    lastMessage: action.payload.message,
                    noRead: action.payload.noRead ? dialog.noRead + 1 : dialog.noRead,
                } :
                dialog
            ).sort((a, b) => {
                if(!(a.lastMessage && b.lastMessage))
                    return 0

                a = new Date(a.lastMessage.createdAt);
                b = new Date(b.lastMessage.createdAt);
                
                return a>b ? -1 : a<b ? 1 : 0;
            }), noReadCount: action.payload.noReadCount ? state.noReadCount+1 : state.noReadCount }
        case DIALOGS_SUCCESS_MESSAGE: 
            return { ...state, dialogs: state.dialogs.map(dialog => 
                action.payload.dialogId === dialog._id ? 
                { ...dialog, messages: dialog.messages.map(message => 
                        action.payload._id === message._id ? 
                        { ...message, isLoading: false, _id: action.payload._newId } :
                        message
                    ),
                    lastMessage: { ...dialog.lastMessage, isLoading: false }
                } :
                dialog
            ) }
        case DIALOGS_ERROR_MESSAGE: 
            return { ...state, dialogs: state.dialogs.map(dialog => 
                action.payload.dialogId === dialog._id ? 
                { ...dialog, messages: dialog.messages.map(message => 
                        action.payload._id === message._id ? 
                        { ...message, isLoading: false, isError: true } :
                        message
                    ),
                    lastMessage: { ...dialog.lastMessage, isLoading: false, isError: true }
                } :
                dialog
            ) }
        case DIALOGS_UPDATE_ONLINE:
            return { ...state, dialogs: state.dialogs.map(dialog => 
                action.payload.userId === dialog.user._id ? 
                { ...dialog, user: { ...dialog.user, online: action.payload.online, onlineAt: action.payload.onlineAt } } :
                dialog
            ) }
        case DIALOGS_READ_MESSAGES:
            return { ...state, dialogs: state.dialogs.map(dialog => 
                action.payload.dialogId === dialog._id ? 
                { ...dialog, messages: dialog.messages.map(message => 
                        !message.isRead && message.user._id === action.payload.userId ? 
                        { ...message, isRead: true } :
                        message
                    ),
                    noRead: action.payload.noRead ? 0 : dialog.noRead,
                    lastMessage: { ...dialog.lastMessage, isRead: true }
                } :
                dialog
            ), noReadCount: action.payload.noReadCount ? state.noReadCount-1 : state.noReadCount }
        case DIALOGS_EDIT_MESSAGE:
            return { ...state, dialogs: state.dialogs.map(dialog => 
                action.payload.dialogId === dialog._id ? 
                    { ...dialog, messages: dialog.messages.map(message => 
                        action.payload.message._id === message._id ? 
                        { ...message, ...action.payload.message, isEdit: true } :
                        message
                    ),
                    lastMessage: action.payload.editLast ? { ...dialog.lastMessage, ...action.payload.message } : dialog.lastMessage
                } :
                dialog
            ) }
        case DIALOGS_DELETE_MESSAGE:
            return { ...state, dialogs: state.dialogs.map(dialog => 
                action.payload.dialogId === dialog._id ? 
                    { ...dialog, messages: [ ...dialog.messages.filter(message => {        
                        return !action.payload.messageIds.find(x => x === message._id)
                    })],
                    lastMessage: action.payload.lastMessage, 
                    noRead: action.payload.noRead || action.payload.noRead === 0 ? action.payload.noRead : dialog.noRead
                } :
                dialog
            ).sort((a, b) => {
                if(!(a.lastMessage && b.lastMessage))
                    return 0

                a = new Date(a.lastMessage.createdAt);
                b = new Date(b.lastMessage.createdAt);
                
                return a>b ? -1 : a<b ? 1 : 0;
            }), noReadCount: action.payload.noReadCount || action.payload.noReadCount === 0 ? action.payload.noReadCount : state.noReadCount }
        case DIALOGS_SET_LOADING:
            return { ...state, dialogs: state.dialogs.map(dialog => 
                action.payload === dialog._id ? 
                    { ...dialog, canLoad: false, isLoading: true } :
                dialog
            )
            }
        case DIALOGS_LOAD_MESSAGES:
            return { ...state, dialogs: state.dialogs.map(dialog => 
                action.payload.dialogId === dialog._id ? 
                    { ...dialog,  isLoading: false, canLoad: action.payload.canLoad, messages: [...action.payload.messages, ...dialog.messages] } :
                dialog
            )
            }
        case DIALOGS_SET_TYPER: 
            return { ...state, dialogs: state.dialogs.map(dialog => 
                action.payload.userId === dialog.user._id ? 
                { ...dialog, typing: action.payload.typing } :
                dialog
            ) }
        case DIALOGS_SET_FORWARD: 
            return { ...state, forwardMessages: action.payload }
        default: 
            return state
    }
}

export default dialogs