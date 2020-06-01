import { 
    DIALOGS_GET
} from '../constants'
import store from '../store';

export const dialogsGet = (apiToken) => (dispatch) => {
    fetch(`http://localhost:8000/api/dialog/get-all`, {
        method: "post",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiToken}`,
        }
    })
    .then((response) => response.json())
    .then((dialogs) => {
        dialogs.map(dialog => {
            dialog.user = dialog.users.find(user => user._id !== store.getState().user._id)
            dialog.typers = []
        })

        dispatch({
            type: DIALOGS_GET,
            payload: dialogs
        })
    });
}