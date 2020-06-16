import React from 'react'
import { Redirect } from "react-router-dom";

import Login from '../Pages/Auth/Login'
import Register from '../Pages/Auth/Register'

import Languages from '../Sidebar/Languages'
import Rooms from '../Sidebar/Rooms';
import Room from '../Pages/User/Room';
import Messages from '../Sidebar/Messages';
import Notifications from '../Sidebar/Notifications';
import Main from '../Pages/User/Main';
import Dialog from '../Pages/User/Dialog';
import { randomInteger } from '../Controllers/FunctionsController';

const routes = [
    {
        path: '/login',
        exact: true,
        type: 'auth',
        title: 'Авторизация',
        component: () => <Login />
    },
    {
        path: '/register',
        exact: true,
        type: 'auth',
        title: 'Регистрация',
        component: () => <Register />
    },
    {
        path: '/',
        exact: true,
        type: 'user',
        title: 'Home',
        component: () => <Main />
    },
    {
        path: '/languages',
        exact: true,
        type: 'user',
        title: 'Languages',
        component: () => <Languages />
    },
    {
        path: '/chats/:id',
        exact: true,
        type: 'user',
        title: '',
        component: () => <Dialog key={window.location.pathname} />
    },
    {
        path: '/rooms/:id',
        exact: true,
        type: 'user',
        title: '',
        component: () => <Room />
    },
]

export default routes