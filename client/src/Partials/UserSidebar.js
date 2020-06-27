import React from 'react'
import Avatar from './User/Avatar'

import '../Css/Partials/UserSidebar.css'

// Icons
import ChatBubbleOutlineIcon from '@material-ui/icons/ChatBubbleOutline';
import NotificationsNoneIcon from '@material-ui/icons/NotificationsNone';
import LanguageIcon from '@material-ui/icons/Language';
import AppsIcon from '@material-ui/icons/Apps';
import Messages from '../Sidebar/Messages';
import Rooms from '../Sidebar/Rooms';
import Notifications from '../Sidebar/Notifications';
import Languages from '../Sidebar/Languages';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

class UserSidebar extends React.Component {
    state = {
        activeTab: this.props.history.location.pathname.substring(1,5) === 'chat' ? 'messages' : this.props.user.roomLang ? 'rooms' : 'languages'
    }

    render() {
        return this.props.show && (
            <>
                <div className="col-xl-3 col-lg-6 col-md-6 user-header">
                    <ul>
                        <li onClick={() => {
                            this.props.history.push({
                                search: `?user=${this.props.user._id}`
                            })
                        }}><Avatar avatar={this.props.user.avatar ? this.props.user.avatar : false} style={{width: 32, height: 32, fontSize: 14, fontWeight: 600, backgroundColor: `rgb(${this.props.user.color})`}} name={this.props.user.name.first.charAt(0) + this.props.user.name.last.charAt(0)} /></li>
                        <li style={{position: 'relative'}} className={`${this.state.activeTab === 'messages' ? 'active' : ''}`} onClick={() => {this.setState({activeTab: 'messages'})}}>
                            <ChatBubbleOutlineIcon style={{color: '#CCD1D6'}} />
                            {!!this.props.dialogs.noReadCount && <span 
                                className="unread-messages-count"
                                style={{
                                    top: 11,
                                    right: '40%',
                                    transform: 'translateX(50%)',
                                    backgroundColor: '#FF3333'
                                }}
                            >{this.props.dialogs.noReadCount}</span>}
                        </li>
                        <li className={`${this.state.activeTab === 'rooms' ? 'active' : ''}`} onClick={() => {this.setState({activeTab: 'rooms'})}}><AppsIcon style={{color: '#CCD1D6'}} /></li>
                        <li style={{position: 'relative'}} className={`${this.state.activeTab === 'notifications' ? 'active' : ''}`} onClick={() => {this.setState({activeTab: 'notifications'})}}>
                            <NotificationsNoneIcon style={{color: '#CCD1D6'}} />
                            {!!this.props.notifications.noRead && <span 
                                className="unread-messages-count"
                                style={{
                                    top: 11,
                                    right: '44%',
                                    transform: 'translateX(50%)',
                                    backgroundColor: '#FF3333'
                                }}
                            >{this.props.notifications.noRead}</span>}
                        </li>
                        <li className={`${this.state.activeTab === 'languages' ? 'active' : ''}`} onClick={() => {this.setState({activeTab: 'languages'})}}><LanguageIcon style={{color: '#CCD1D6'}} /></li>
                    </ul>
                </div>

                {this.state.activeTab === 'messages' && <Messages />}
                {this.state.activeTab === 'rooms' && <Rooms />}
                {this.state.activeTab === 'notifications' && <Notifications />}
                {this.state.activeTab === 'languages' && <Languages />}
            </>
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.user,
        dialogs: state.dialogs,
        notifications: state.notifications
    }
}

export default connect(mapStateToProps)(withRouter(UserSidebar))