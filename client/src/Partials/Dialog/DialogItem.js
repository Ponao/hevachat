// App
import React from 'react'

import Avatar from '../User/Avatar'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';

import '../../Css/Partials/RoomItem.css'
import { Link } from 'react-router-dom';

// Material
import Button from '@material-ui/core/Button';

class DialogItem extends React.Component {
    render() {
        return (
            <Link style={{textDecoration: 'none'}} to={`/chats/${this.props.user._id}`}>
                <Button className="dialog-item">
                    <Avatar style={{width: 40, height: 40, fontSize: 14, fontWeight: 600, backgroundColor: `rgb(${this.props.user.color})`}} name={this.props.user.name.first.charAt(0) + this.props.user.name.last.charAt(0)} />
                    <div>
                        <p className="user-name">{`${this.props.user.name.first} ${this.props.user.name.last}`}</p>
                        <p className="last-message">Last message</p>
                    </div>
                    <div className="dialog-info">
                         
                    </div>
                </Button>
            </Link>
        )
    }
}

export default DialogItem