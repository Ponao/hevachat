import React from 'react'

class Avatar extends React.Component {
    render() {
        return (
            <div className="user-avatar" style={this.props.style}>
                <span>{this.props.name.toUpperCase()}</span>
                {this.props.online && <span className="online-status"></span>}
            </div>
        )
    }
}

export default Avatar