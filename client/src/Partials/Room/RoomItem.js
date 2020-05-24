// App
import React from 'react'

import Avatar from '../User/Avatar'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';

import '../../Css/Partials/RoomItem.css'
import { Link } from 'react-router-dom';

class RoomItem extends React.Component {
    render() {
        return (
            <Link style={{textDecoration: 'none'}} to={`/rooms/${this.props.room._id}`}><div className="room-item" title={`Room ${this.props.room.title}`}>
                <Avatar style={{width: 40, height: 40, backgroundColor: `rgb(${this.props.room.color})`}} name={this.props.room.title.charAt(0)} />
                <div>
                    <p>{this.props.room.isPrivate && <LockOutlinedIcon />}{this.props.room.title}</p>
                    <div className="users">
                        {this.props.room.users.map(user => {
                            return <Avatar style={{width: 16, height: 16, fontSize: 8,backgroundColor: `rgb(${user.color})`}} name={user.name.first.charAt(0)+user.name.last.charAt(0)} />
                        })}
                    </div>
                </div>
            </div></Link>
        )
    }
}

export default RoomItem