import { 
    DIALOGS_ADD,
    DIALOGS_GET
} from '../constants'

const INITIAL_STATE = {
    isFetching: true,
    getted: false,
    dialogs: []
}

const dialogs = (state = INITIAL_STATE, action) => {
    switch(action.type) {
        case DIALOGS_GET: {
            return { ...state, dialogs: action.payload, isFetching: false, getted: true }
        }
        case DIALOGS_ADD:
            return { ...state, dialogs: [ action.payload, ...state.dialogs ]  }
        default: 
            return state
    }
}

export default dialogs