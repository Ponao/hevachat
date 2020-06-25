import { 
    SLIDER_SET
} from '../constants'

const INITIAL_STATE = {
    images: [],
    index: 0
}

const user = (state = INITIAL_STATE, action) => {
    switch(action.type) {
        case SLIDER_SET: {
            return { ...state, images: action.payload.images, index: action.payload.index }
        }
        default: 
            return state
    }
}

export default user