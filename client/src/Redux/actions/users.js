import { 
    USERS_ADD,
    USERS_GET,
    USERS_SET_ACTIVE_USER_ID,
    USERS_SET_FRIEND_STATUS,
    USERS_SET,
    USERS_FRIENDS_GET,
    USERS_REQUESTED_GET,
    USERS_PENDING_GET,
    USERS_FRIENDS_REMOVE,
    USERS_REQUESTED_REMOVE,
    USERS_PENDING_REMOVE,
    USERS_FRIENDS_ADD,
    USERS_REQUESTED_ADD,
    USERS_PENDING_ADD
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
            payload: {users, canLoad: users.length === 15}
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
            payload: {users, canLoad: users.length === 15}
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
            payload: {users, canLoad: users.length === 15}
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

        if(store.getState().users.pending.getted) {
            if(store.getState().users.users.find(x => x._id === userId)) {
                dispatch({
                    type: USERS_PENDING_ADD,
                    payload: {user: store.getState().users.users.find(x => x._id === userId)}
                })
            } else {
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
                    dispatch({
                        type: USERS_PENDING_ADD,
                        payload: {user}
                    })
                });
            }
        }
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

        if(store.getState().users.requested.getted) {
            dispatch({
                type: USERS_REQUESTED_REMOVE,
                payload: {userId}
            })
        }

        if(store.getState().users.friends.getted) {
            if(store.getState().users.users.find(x => x._id === userId)) {
                dispatch({
                    type: USERS_FRIENDS_ADD,
                    payload: {user: store.getState().users.users.find(x => x._id === userId)}
                })
            } else {
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
                    dispatch({
                        type: USERS_FRIENDS_ADD,
                        payload: {user}
                    })
                });
            }
        }
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

        if(store.getState().users.friends.getted) {
            if(friendStatus === 2) {
                dispatch({
                    type: USERS_FRIENDS_REMOVE,
                    payload: {userId}
                })

                if(store.getState().users.requested.getted) {
                    if(store.getState().users.users.find(x => x._id === userId)) {
                        dispatch({
                            type: USERS_REQUESTED_ADD,
                            payload: {user: store.getState().users.users.find(x => x._id === userId)}
                        })
                    } else {
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
                            dispatch({
                                type: USERS_REQUESTED_ADD,
                                payload: {user}
                            })
                        });
                    }
                }
            }
        }

        if(store.getState().users.pending.getted && friendStatus === 0) {
            dispatch({
                type: USERS_PENDING_REMOVE,
                payload: {userId}
            })
        }

        if(store.getState().users.requested.getted && friendStatus === 0) {
            dispatch({
                type: USERS_REQUESTED_REMOVE,
                payload: {userId}
            })
        }
    })
}