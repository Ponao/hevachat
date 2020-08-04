import { 
    BAN_SET
} from '../constants'

const INITIAL_STATE = {
    ban: false,
    date: '',
    numDate: 0
}

const ban = (state = INITIAL_STATE, action) => {
    switch(action.type) {
        case BAN_SET:
            return { ...state, ban: true, date: action.payload.date, numDate: action.payload.numDate }
        default:    
            return state
    }
}

export default ban