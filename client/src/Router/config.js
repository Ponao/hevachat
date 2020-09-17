import React from 'react'

import Login from '../Pages/Auth/Login'
import Register from '../Pages/Auth/Register'

import Languages from '../Sidebar/Languages'
import Room from '../Pages/User/Room';
import Main from '../Pages/User/Main';
import Dialog from '../Pages/User/Dialog';
import Payment from '../Pages/User/Payment';
import Ban from '../Pages/User/Ban';
import AuthSocial from '../Pages/Auth/AuthSocial';
import Politice from '../Pages/Politice';


const routes = [
    {
        path: '/politice',
        exact: true,
        type: 'all',
        title: 'Politice',
        component: () => <Politice />
    },
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
        path: '/auth_social',
        exact: true,
        type: 'auth',
        title: 'Loading...',
        component: () => <AuthSocial />
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
        component: () => <Room key={window.location.pathname} />
    },
    {
        path: '/payment',
        exact: true,
        type: 'user',
        title: '',
        component: () => <Payment />
    },
    {
        path: '/ban',
        exact: true,
        type: 'ban',
        title: '',
        component: () => <Ban />
    },
]

export default routes