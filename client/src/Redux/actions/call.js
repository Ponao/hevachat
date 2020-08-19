import { CALL_SET_USER, CALL_SET_STATUS, CALL_SET_FORCE } from "../constants"
import { urlApi } from "../../config"
import SocketController from "../../Controllers/SocketController"
import WebRtcController from "../../Controllers/WebRtcController"
import store from "../store"
import { playBeep, stopBeep, stopRington } from "../../Controllers/SoundController"

export const call = (user, apiToken) => (dispatch) => {
    if(store.getState().rooms.activeRoom) {
        dispatch({
            type: CALL_SET_FORCE,
            payload: {user, status: 'force-call'}
        })
    } else {
        dispatch({
            type: CALL_SET_USER,
            payload: {user, status: 'outcoming'}
        })

        playBeep()

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
                stopBeep()
                dispatch({
                    type: CALL_SET_STATUS,
                    payload: call.error
                })
            }
        })
    }
}

export const accept = (apiToken) => (dispatch) => {
    if(store.getState().rooms.activeRoom) {
        dispatch({
            type: CALL_SET_FORCE,
            payload: {user: store.getState().call.user, status: 'force-accept'}
        })
    } else {
        dispatch({
            type: CALL_SET_STATUS,
            payload: 'active'
        })

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
        .then((response) => response.json())
        .then((call) => {
            if(call.error) {
                dispatch({
                    type: CALL_SET_STATUS,
                    payload: call.error
                })
                WebRtcController.stopCall()

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
            } else {
                stopRington()
                WebRtcController.call(store.getState().call.user._id)
            }
        })
    }
}

export const stop = (user, apiToken) => (dispatch) => {
    stopBeep()
    stopRington()
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