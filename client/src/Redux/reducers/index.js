import { combineReducers } from 'redux'

import user from './user'
import rooms from './rooms'
import media from './media'
import dialogs from './dialogs'
import users from './users'
import notifications from './notifications'
import call from './call'
import slider from './slider'
import ban from './ban'
import toasts from './toasts'
import app from './app'

export default combineReducers({
    user,
    rooms,
    media,
    dialogs,
    users,
    notifications,
    call,
    slider,
    ban,
    toasts,
    app
})