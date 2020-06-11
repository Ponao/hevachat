// App
import React from 'react'

import Avatar from '../User/Avatar'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { CSSTransitionGroup } from 'react-transition-group';
import '../../Css/Partials/RoomItem.css'
import { NavLink, withRouter } from 'react-router-dom';

// Material
import { connect } from 'react-redux';

import * as dialogsActions from '../../Redux/actions/dialogs'
import { bindActionCreators } from 'redux'

import { randomInteger } from '../../Controllers/FunctionsController';
import { Button } from '@material-ui/core';
import { LastMessageDate } from '../../Controllers/TimeController';

class NotificationItem extends React.Component {
    state = {
        randomId: randomInteger(0, 100000)
    }

    render() {
        return (
            <Button className={`dialog-item`} onClick={() => {
                if(this.props.notification.type === 'invite')
                    this.props.history.push(`/rooms/${this.props.notification.data.roomId}`)
            }}>
                <Avatar online={this.props.notification.user.online} style={{width: 40, height: 40, fontSize: 14, fontWeight: 600, backgroundColor: `rgb(${this.props.notification.user.color})`}} name={this.props.notification.user.name.first.charAt(0) + this.props.notification.user.name.last.charAt(0)} />

                <div>
                    <p className="user-name">{`${this.props.notification.user.name.first} ${this.props.notification.user.name.last}`}</p>
                    
                    {this.props.notification.type === 'invite' && <p className="last-message">Invited you to the room&nbsp;<span style={{color: '#008FF7'}}>{this.props.notification.data.title}</span></p>}
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
        myUser: state.user,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        dialogsActions: bindActionCreators(dialogsActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(NotificationItem))