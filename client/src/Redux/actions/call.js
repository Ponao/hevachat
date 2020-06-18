import { CALL_SET_USER, CALL_SET_STATUS } from "../constants"
import { urlApi } from "../../config"
import SocketController from "../../Controllers/SocketController"
import WebRtcController from "../../Controllers/WebRtcController"
import store from "../store"

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

export const accept = (apiToken) => (dispatch) => {
    dispatch({
        type: CALL_SET_STATUS,
        payload: 'active'
    })
    WebRtcController.call(store.getState().call.user._id)

    fetch(`${urlApi}/api/call/accept`, {
        method: "post",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({
            userId: store.getState().call.user._id,
            socketId: SocketController.getSocketId()
        })
    })
    // .then((response) => response.json())
    .then((call) => {
        // console.log(call)
    })
}

export const stop = (user, apiToken) => (dispatch) => {
    WebRtcController.stopCall()

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