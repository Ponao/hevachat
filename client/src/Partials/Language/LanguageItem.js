// App
import React from 'react'

import Avatar from '../User/Avatar'

// Material
import Button from '@material-ui/core/Button';

class RoomItem extends React.Component {
    render() {
        return (
            <span style={{textDecoration: 'none'}} onClick={() => {this.props.onClick()}}>
                <Button className="room-item">
                    <Avatar style={{minWidth: 40, maxWidth: 40, height: 40, fontSize: 14, fontWeight: 600}} name={this.props.title.charAt(0)} />
                    <div style={{
                        flexGrow: 1,
                        minWidth: 0,
                        maxWidth: '100%',
                        paddingRight: 10
                    }}>
                        <p><span>{this.props.title}</span></p>
                    </div>
                </Button>
            </span>
        )
    }
}

export default RoomItem