// App
import React from 'react'

import Avatar from '../User/Avatar'
import { CSSTransitionGroup } from 'react-transition-group';
import '../../Css/Partials/RoomItem.css'
import { withRouter } from 'react-router-dom';

// Material
import { connect } from 'react-redux';

import * as notificationsActions from '../../Redux/actions/notifications'
import { bindActionCreators } from 'redux'

import { randomInteger } from '../../Controllers/FunctionsController';
import { Button } from '@material-ui/core';
import { LastMessageDate } from '../../Controllers/TimeController';
import { withLang } from 'react-multi-language';
import languages from '../../languages';
import store from '../../Redux/store';
import { ROOMS_SET_FORCE } from '../../Redux/constants';

class NotificationItem extends React.Component {
    state = {
        randomId: randomInteger(0, 100000)
    }

    render() {
        return (
            <Button className={`dialog-item`} onClick={() => {
                if(!this.props.notification.isRead)
                    this.props.notificationsActions.notificationRead(this.props.notification._id, this.props.user.apiToken)

                if(this.props.notification.type === 'invite') {
                    if(this.props.call.user) {
                        store.dispatch({
                            type: ROOMS_SET_FORCE,
                            payload: this.props.notification.room._id
                        })
                    } else {
                        this.props.history.push(`/rooms/${this.props.notification.room._id}`)
                    }
                }
                if(this.props.notification.type === 'accept' || this.props.notification.type === 'request')
                    this.props.history.push({
                        search: `?user=${this.props.notification.user._id}`
                    })
            }}>
                <Avatar 
                avatar={this.props.notification.user.avatar ? this.props.notification.user.avatar : false}
                status={this.props.notification.type} 
                style={{minWidth: 40, maxWidth: 40, height: 40, fontSize: 14, fontWeight: 600, backgroundColor: `rgb(${this.props.notification.user.color})`}} 
                name={this.props.notification.user.name.first.charAt(0) + this.props.notification.user.name.last.charAt(0)} />

                <div style={{
                        flexGrow: 1,
                        minWidth: 0,
                        maxWidth: '100%',
                        paddingRight: 10
                    }}>
                    <p className="user-name"><span>{`${this.props.notification.user.name.first} ${this.props.notification.user.name.last}`}</span></p>
                    
                    {this.props.notification.type === 'invite' && <p className="last-message"><span className="notif-content">{this.props.langProps.invited_you_to_the_room}&nbsp;<span style={{color: '#008FF7'}}>{this.props.notification.room.title}</span></span></p>}
                    {this.props.notification.type === 'accept' && <p className="last-message"><span className="notif-content">{this.props.langProps.accept_your_friend_request}</span></p>}
                    {this.props.notification.type === 'request' && <p className="last-message"><span className="notif-content">{this.props.langProps.send_you_friend_request}</span></p>}
                </div>
                <div className="dialog-info">
                    <span className="time-at">{LastMessageDate(this.props.notification.createdAt)}</span>
                    <CSSTransitionGroup 
                        transitionName="message-status-transition"
                        transitionEnterTimeout={100}
                        transitionLeaveTimeout={100}>
                            {!this.props.notification.isRead && <span style={{background: '#FF3333',minWidth: 10,height: 10, marginTop: 5}} className="unread-messages-count"></span>}
                    </CSSTransitionGroup>
                </div>
            </Button>
        )
    }
}

const mapStateToProps = state => {
    return {
        call: state.call,
        user: state.user,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        notificationsActions: bindActionCreators(notificationsActions, dispatch)
    }
}

export default withLang(languages)(connect(mapStateToProps, mapDispatchToProps)(withRouter(NotificationItem)))