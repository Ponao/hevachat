// App
import React from 'react'

import { withRouter } from 'react-router-dom';
import { withLang } from 'react-multi-language';
import languages from '../languages';
import store from '../Redux/store';
import { TOASTS_REMOVE, TOAST_SET_FORCE } from '../Redux/constants';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';

class Toast extends React.Component {
    render() {
        return <div className="bell-toast" onClick={() => {
            if(this.props.toast.toastType === 'notification') {
                if(this.props.toast.type === 'invite') {
                    if(store.getState().rooms.activeRoom) {
                        store.dispatch({
                            type: TOAST_SET_FORCE,
                            payload: {id: this.props.toast.room._id, type: 'invite'}
                        })
                    } else {
                        this.props.history.push(`/rooms/${this.props.toast.room._id}`)
                    }
                }

                if(this.props.toast.type === 'accept' || this.props.toast.type === 'request') {
                    this.props.history.push({
                        search: `?user=${this.props.toast.user._id}`
                    })
                }
            }

            if(this.props.toast.toastType === 'message') {
                if(`/chats/${this.props.toast.user._id}` !== this.props.history.location.pathname) {
                    if(store.getState().rooms.activeRoom) {
                        store.dispatch({
                            type: TOAST_SET_FORCE,
                            payload: {id: this.props.toast.user._id, type: 'message'}
                        })
                    } else {
                        this.props.history.push(`/chats/${this.props.toast.user._id}`)
                    }
                }
            }

            store.dispatch({
                type: TOASTS_REMOVE,
                payload: this.props.toast._id
            })
        }}>
            <span className="bell-close" onClick={(e) => {
                e.stopPropagation()
                store.dispatch({
                    type: TOASTS_REMOVE,
                    payload: this.props.toast._id
                })
            }}>
                <CloseOutlinedIcon style={{color: '#99AABB'}} />
            </span>

            <p className='name'>{this.props.toast.user.name.first} {this.props.toast.user.name.last}</p>
            {this.props.toast.toastType === 'message' && <p className="text">New message!</p>}
            {this.props.toast.toastType === 'notification' && <>
                {this.props.toast.type === 'invite' && <p className="text">{this.props.langProps.invited_you_to_the_room}&nbsp;<span style={{color: '#008FF7'}}>{this.props.toast.room.title}</span></p>}
                {this.props.toast.type === 'accept' && <p className="text">{this.props.langProps.accept_your_friend_request}</p>}
                {this.props.toast.type === 'request' && <p className="text">{this.props.langProps.send_you_friend_request}&nbsp;<span style={{color: '#008FF7'}}>23232323</span></p>}
            </>}
        </div>
    }
}

export default withLang(languages)(withRouter(Toast))