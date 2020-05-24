import React from 'react'

class Avatar extends React.Component {
    render() {
        return (
            <div className="user-avatar" style={this.props.style}>
                <span>{this.props.name.toUpperCase()}</span>
            </div>
        )
    }
}

export default Avatar