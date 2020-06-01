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

class UserSidebar extends React.Component {
    state = {
        activeTab: 'languages'
    }

    render() {
        return (
            <>
                <div className="col-md-3 user-header">
                    <ul>
                        <li><Avatar name="RS" /></li>
                        <li onClick={() => {this.setState({activeTab: 'messages'})}}><ChatBubbleOutlineIcon style={{color: '#CCD1D6'}} /></li>
                        <li onClick={() => {this.setState({activeTab: 'rooms'})}}><AppsIcon style={{color: '#CCD1D6'}} /></li>
                        <li onClick={() => {this.setState({activeTab: 'notifications'})}}><NotificationsNoneIcon style={{color: '#CCD1D6'}} /></li>
                        <li onClick={() => {this.setState({activeTab: 'languages'})}}><LanguageIcon style={{color: '#CCD1D6'}} /></li>
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

export default UserSidebar