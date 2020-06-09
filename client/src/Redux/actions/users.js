import { 
    USERS_ADD,
    USERS_GET,
    USERS_SET_ACTIVE_USER_ID,
    USERS_SET_FRIEND_STATUS,
    USERS_SET,
    USERS_FRIENDS_GET,
    USERS_REQUESTED_GET,
    USERS_PENDING_GET
} from '../constants'
import store from '../store'
import {urlApi} from '../../config'

export const userGet = (userId, apiToken) => (dispatch) => {
    fetch(`${urlApi}/api/user/get`, {
        method: "post",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({
            userId: userId
        })
    })
    .then((response) => response.json())
    .then(({user, friendStatus}) => {
        user.friendStatus = friendStatus
        dispatch({
            type: USERS_ADD,
            payload: user
        })
    });
}

export const friendsGet = (apiToken) => (dispatch) => {
    fetch(`${urlApi}/api/user/get-friends`, {
        method: "get",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiToken}`,
        }
    })
    .then((response) => response.json())
    .then((friends) => {
        let users = []
        
        friends.map(user => {
            users.push(user.recipient)
        })

        dispatch({
            type: USERS_FRIENDS_GET,
            payload: users
        })
    });
}

export const requestedGet = (apiToken) => (dispatch) => {
    fetch(`${urlApi}/api/user/get-requested`, {
        method: "get",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiToken}`,
        }
    })
    .then((response) => response.json())
    .then((friends) => {
        let users = []
        
        friends.map(user => {
            users.push(user.recipient)
        })

        dispatch({
            type: USERS_REQUESTED_GET,
            payload: users
        })
    });
}

export const pendingGet = (apiToken) => (dispatch) => {
    fetch(`${urlApi}/api/user/get-pending`, {
        method: "get",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiToken}`,
        }
    })
    .then((response) => response.json())
    .then((friends) => {
        let users = []
        
        friends.map(user => {
            users.push(user.recipient)
        })

        dispatch({
            type: USERS_PENDING_GET,
            payload: users
        })
    });
}

export const setUsers = (friends) => (dispatch) => {
    let setFriends = []
    for (let i = 0; i < friends.length; i++) {
        let user = friends[i].recipient

        user.friendStatus = friends[i].status

        setFriends.push(user)
    }

    dispatch({
        type: USERS_SET,
        payload: {friends: setFriends, canLoad: setFriends.length === 10}
    })
}

export const setActiveUserId = (userId) => (dispatch) => {
    dispatch({
        type: USERS_SET_ACTIVE_USER_ID,
        payload: userId
    })
}

export const sendRequest = (userId, apiToken) => (dispatch) => {
    fetch(`${urlApi}/api/user/request`, {
        method: "post",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({
            userId
        })
    })
    .then((response) => response.json())
    .then((friendStatus) => {
        dispatch({
            type: USERS_SET_FRIEND_STATUS,
            payload: {userId, friendStatus}
        })
    })
}

export const acceptRequest = (userId, apiToken) => (dispatch) => {
    fetch(`${urlApi}/api/user/accept-request`, {
        method: "post",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({
            userId
        })
    })
    .then((response) => response.json())
    .then((friendStatus) => {
        dispatch({
            type: USERS_SET_FRIEND_STATUS,
            payload: {userId, friendStatus}
        })
    })
}

export const removeRequest = (userId, apiToken) => (dispatch) => {
    fetch(`${urlApi}/api/user/remove-request`, {
        method: "post",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({
            userId
        })
    })
    .then((response) => response.json())
    .then((friendStatus) => {
        dispatch({
            type: USERS_SET_FRIEND_STATUS,
            payload: {userId, friendStatus}
        })
    })
}