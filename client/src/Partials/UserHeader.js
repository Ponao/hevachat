import React from 'react'
import Avatar from './User/Avatar'

import '../Css/Partials/UserHeader.css'

// Icons
import ChatBubbleOutlineIcon from '@material-ui/icons/ChatBubbleOutline';
import NotificationsNoneIcon from '@material-ui/icons/NotificationsNone';
import LanguageIcon from '@material-ui/icons/Language';
import AppsIcon from '@material-ui/icons/Apps';
import { NavLink } from 'react-router-dom';

class UserHeader extends React.Component {
    render() {
        return (
            <div className="col-md-3 user-header">
                <ul>
                    <li><Avatar /></li>
                    <li><NavLink to="/messages"><ChatBubbleOutlineIcon style={{color: '#CCD1D6'}} /></NavLink></li>
                    <li><NavLink to="/rooms"><AppsIcon style={{color: '#CCD1D6'}} /></NavLink></li>
                    <li><NavLink to="/notifications"><NotificationsNoneIcon style={{color: '#CCD1D6'}} /></NavLink></li>
                    <li><NavLink to="/languages"><LanguageIcon style={{color: '#CCD1D6'}} /></NavLink></li>
                </ul>
            </div>
        )
    }
}

export default UserHeader