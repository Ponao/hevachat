import { createStore, applyMiddleware } from 'redux'

import rootReducer from './reducers'
import ReduxThunk from 'redux-thunk'

export default createStore(rootReducer, applyMiddleware(ReduxThunk))