import React from 'react'
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import AddIcon from '@material-ui/icons/Add';

class Avatar extends React.Component {
    render() {
        return (
            <div className="user-avatar" style={this.props.style}>
                <span>{this.props.name.toUpperCase()}</span>
                {this.props.online && <span className="online-status"></span>}

                {this.props.status && <>
                    {this.props.status === 'accept' && <span className="notification-status"><PersonAddIcon style={{color: '#fff', fontSize: 14}} /></span>}
                    {this.props.status === 'invite' && <span className="notification-status"><GroupAddIcon style={{color: '#fff', fontSize: 14}} /></span>}
                    {this.props.status === 'request' && <span className="notification-status"><AddIcon style={{color: '#fff', fontSize: 14}} /></span>}
                </>}
            </div>
        )
    }
}

export default Avatar