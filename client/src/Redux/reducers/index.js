import { combineReducers } from 'redux'

import user from './user'
import rooms from './rooms'
import media from './media'
import dialogs from './dialogs'
import users from './users'

export default combineReducers({
    user,
    rooms,
    media,
    dialogs,
    users
})