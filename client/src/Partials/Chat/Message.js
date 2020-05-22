// App
import React from 'react'
import Avatar from '../User/Avatar'
import { getHM } from '../../Controllers/TimeController'

import Linkify from 'react-linkify'

const componentDecorator = (href, text, key) => (
    <a href={href} key={key} target="_blank" rel="noopener noreferrer">
      {text}
    </a>
);

class Message extends React.Component {
    render() {
        return (
            <div className="message">
                <Avatar style={{width: 32, height: 32}} name={this.props.message.user.email} />
                
                <div className="content col">
                    <h3 className="user-name">{this.props.message.user.email} <span className="time-at">{getHM(this.props.message.createdAt)}</span></h3>

                    {this.props.message.text && <p className="message-text">
                        <Linkify componentDecorator={componentDecorator}>{this.props.message.text}</Linkify>
                    </p>}

                    {!!this.props.message.images.length && <div className="message-images" style={{
                        // gridTemplateColumns: `repeat(${this.props.message.images.length}, 1fr)`, 
                        // gridTemplateRows: `repeat(${this.props.message.images.length}, 1vw)`,
                    }}>
                        {this.props.message.images.map((image, index) => {
                            return <img key={index} src={image} />
                        })}
                    </div>}

                    {!!this.props.message.recentMessages.length && <div className="message-recent">
                        {this.props.message.recentMessages.map((message, index) => {
                            return <Message key={index} message={message} />
                        })}
                    </div>}
                </div>
                
            </div>
        )
    }
}

export default Message