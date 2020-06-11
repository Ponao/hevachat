import { 
    NOTIFICATIONS_GET
} from '../constants'
import {urlApi} from '../../config'

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