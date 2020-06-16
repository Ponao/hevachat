import { CALL_SET_USER, CALL_SET_STATUS } from "../constants"
import { urlApi } from "../../config"
import SocketController from "../../Controllers/SocketController"

export const call = (user, apiToken) => (dispatch) => {
    dispatch({
        type: CALL_SET_USER,
        payload: {user, status: 'outcoming'}
    })

    fetch(`${urlApi}/api/call/call`, {
        method: "post",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({
            id: user._id,
            socketId: SocketController.getSocketId()
        })
    })
    .then((response) => response.json())
    .then((call) => {
        if(call.error) {
            dispatch({
                type: CALL_SET_STATUS,
                payload: call.error
            })
        }
    })
}

export const stop = (user, apiToken) => (dispatch) => {
    dispatch({
        type: CALL_SET_USER,
        payload: {user: false, status: 'none'}
    })

    fetch(`${urlApi}/api/call/stop`, {
        method: "post",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({
            socketId: SocketController.getSocketId()
        })
    })
    // .then((response) => response.json())
    .then((call) => {
        // console.log(call)
    })
}

export const clear = () => (dispatch) => {
    dispatch({
        type: CALL_SET_USER,
        payload: {user: false, status: 'none'}
    })
}