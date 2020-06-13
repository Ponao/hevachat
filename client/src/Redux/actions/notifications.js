import { 
    NOTIFICATIONS_GET,
    NOTIFICATIONS_READ,
} from '../constants'
import {urlApi} from '../../config'
import SocketController from '../../Controllers/SocketController';

export const notificationsGet = (apiToken) => (dispatch) => {
    fetch(`${urlApi}/api/notification/get-all`, {
        method: "post",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiToken}`,
        }
    })
    .then((response) => response.json())
    .then((notifications) => {
        dispatch({
            type: NOTIFICATIONS_GET,
            payload: notifications
        })
    });
}

export const notificationRead = (id, apiToken) => (dispatch) => {
    dispatch({
        type: NOTIFICATIONS_READ,
        payload: id
    })

    fetch(`${urlApi}/api/notification/read`, {
        method: "post",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({
            id,
            socketId: SocketController.getSocketId()
        })
    })
}