// App
import React from 'react'

import Avatar from '../User/Avatar'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';

import '../../Css/Partials/RoomItem.css'
import { Link } from 'react-router-dom';

// Material
import Button from '@material-ui/core/Button';

class RoomItem extends React.Component {
    render() {
        return (
            <Link style={{textDecoration: 'none'}} to={`/rooms/${this.props.room._id}`}>
                <Button className="room-item" title={`Room ${this.props.room.title}`}>
                    <Avatar style={{minWidth: 40, maxWidth: 40, height: 40, fontSize: 14, fontWeight: 600, backgroundColor: `rgb(${this.props.room.color})`}} name={this.props.room.title.charAt(0)} />
                    <div style={{
                        flexGrow: 1,
                        minWidth: 0,
                        maxWidth: '100%',
                        paddingRight: 10
                    }}>
                        <p>{this.props.room.isPrivate && <LockOutlinedIcon />}<span>{this.props.room.title}</span></p>
                        <div className="users" style={{overflow: 'hidden'}}>
                            {this.props.room.users.map((user, index) => 
                                <Avatar key={index} avatar={user.avatar ? user.avatar : false} style={{minWidth: 16, maxWidth: 16, height: 16, fontSize: 8, backgroundColor: `rgb(${user.color})`}} name={user.name.first.charAt(0)+user.name.last.charAt(0)} />
                            )}
                        </div>
                    </div>
                </Button>
            </Link>
        )
    }
}

export default RoomItem