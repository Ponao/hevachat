import { 
    ROOMS_GET,
    ROOMS_ADD,
    ROOMS_JOIN_ROOM,
    ROOMS_LEAVE_ROOM,
    ROOMS_ADD_MESSAGE,
    ROOMS_SUCCESS_MESSAGE,
    ROOMS_ERROR_MESSAGE,
    ROOMS_EDIT_MESSAGE,
    ROOMS_READ_MESSAGE,
    ROOMS_JOIN_ERROR,
    ROOMS_DELETE_MESSAGE
} from '../constants'
import SocketController from '../../Controllers/SocketController';
import store from '../store';
import { randomInteger } from '../../Controllers/FunctionsController';

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

export const roomsAdd = room => (dispatch) => {
    dispatch({
        type: ROOMS_ADD,
        payload: room
    })
}

export const joinRoom = ({id, apiToken}) => (dispatch) => {
    fetch(`http://localhost:8000/api/room/get`, {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiToken}`,
            },
            body: JSON.stringify({
                id
            })
        })
        .then(response => response.json())
        .then(room => {
            if(room.error) {
                dispatch({
                    type: ROOMS_JOIN_ERROR,
                    payload: room.errors[0]
                })
                
                return
            }
            SocketController.joinRoom({roomId: room._id, lang: room.lang})
            dispatch({
                type: ROOMS_JOIN_ROOM,
                payload: room
            })
        })
        .catch((err) => {
            dispatch({
                type: ROOMS_JOIN_ERROR,
                payload: {param: 'all', msg: 'something_goes_wrong'}
            })
        })
}

export const leaveRoom = (roomId, lang) => (dispatch) => {
    SocketController.leaveRoom({roomId, lang})
    dispatch({
        type: ROOMS_LEAVE_ROOM
    })
}

export const sendMessage = (message, apiToken) => (dispatch) => {
    let _id = randomInteger(0, 1000000)
    let localMessage = {
        _id,
        user: store.getState().user,
        text: message.text,
        images: [],
        sounds: [],
        files: [],
        isLoading: true,
        isError: false,
        isRead: false,
        recentMessages: message.recentMessages,
        createdAt: Date.now(),
    }
    
    dispatch({
        type: ROOMS_ADD_MESSAGE,
        payload: localMessage
    })

    let recentMessages = []

    message.recentMessages.map(m => {
        recentMessages.push(m._id)
    })

    message.recentMessages = recentMessages
    message.socketId = SocketController.getSocketId()
    message.roomId = store.getState().rooms.activeRoom._id

    fetch(`http://localhost:8000/api/room/send-message`, {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiToken}`,
            },
            body: JSON.stringify(message)
        })
        .then(response => response.json())
        .then(messageRes => {
            dispatch({
                type: ROOMS_SUCCESS_MESSAGE,
                payload: {_id, _newId: messageRes._id}
            })
        })
        .catch(() => {
            dispatch({
                type: ROOMS_ERROR_MESSAGE,
                payload: _id
            })
        })
}

export const deleteMessage = ({roomId, deleteMessages}, apiToken) => (dispatch) => {
    let messageIds = []
    deleteMessages.map(m => {
        messageIds.push(m._id)
    })

    dispatch({
        type: ROOMS_DELETE_MESSAGE,
        payload: messageIds
    })

    fetch(`http://localhost:8000/api/room/delete-message`, {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiToken}`,
            },
            body: JSON.stringify({
                roomId,
                messageIds,
                socketId: SocketController.getSocketId()
            })
        })
        .then()
        .catch(() => {
            
        })
}