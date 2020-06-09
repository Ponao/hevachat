import { 
    MEDIA_TOGGLE_MICROPHONE,
    MEDIA_TOGGLE_MUSIC
} from '../constants'

const INITIAL_STATE = {
    micOn: false,
    musicOn: true
}

const media = (state = INITIAL_STATE, action) => {
    switch(action.type) {
        case MEDIA_TOGGLE_MICROPHONE: {
            return { ...state, micOn: action.payload }
        }
        case MEDIA_TOGGLE_MUSIC: {
            return { ...state, musicOn: action.payload }
        }
        default: 
            return state
    }
}

export default media