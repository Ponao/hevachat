import React from 'react'
import { Redirect } from "react-router-dom";

import Login from '../Pages/Auth/Login'
import Register from '../Pages/Auth/Register'

import Languages from '../Pages/User/Languages'
import Rooms from '../Pages/User/Rooms';
import Room from '../Pages/User/Room';
import Messages from '../Pages/User/Messages';
import Notifications from '../Pages/User/Notifications';

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
        component: () => <Redirect to="/languages" />
    },
    {
        path: '/languages',
        exact: true,
        type: 'user',
        title: 'Languages',
        component: () => <Languages />
    },
    {
        path: '/rooms',
        exact: true,
        type: 'user',
        title: 'Rooms',
        component: () => <Rooms />
    },
    {
        path: '/rooms/:id',
        exact: true,
        type: 'user',
        title: '',
        component: () => <Room />
    },
    {
        path: '/messages',
        exact: true,
        type: 'user',
        title: 'Messages',
        component: () => <Messages />
    },
    {
        path: '/notifications',
        exact: true,
        type: 'user',
        title: 'Notifications',
        component: () => <Notifications />
    },
]

export default routes