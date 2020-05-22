import { 
    ROOMS_GET,
    ROOMS_ADD,
    ROOMS_JOIN_ROOM,
    ROOMS_LEAVE_ROOM
} from '../constants'
import SocketController from '../../Controllers/SocketController';

export const roomsGet = (apiToken, lang) => (dispatch) => {
    fetch(`http://localhost:8000/api/room/get-all`, {
        method: "post",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({
            lang
        })
    })
    .then((response) => response.json())
    .then((rooms) => {
        dispatch({
            type: ROOMS_GET,
            payload: rooms
        })
    });
}

export const roomsAdd = (room) => (dispatch) => {
    dispatch({
        type: ROOMS_ADD,
        payload: room
    })
}

export const joinRoom = (room) => (dispatch) => {
    SocketController.joinRoom({roomId: room._id, lang: room.lang})
    dispatch({
        type: ROOMS_JOIN_ROOM,
        payload: room
    })
}

export const leaveRoom = (roomId, lang) => (dispatch) => {
    SocketController.leaveRoom({roomId, lang})
    dispatch({
        type: ROOMS_LEAVE_ROOM
    })
}