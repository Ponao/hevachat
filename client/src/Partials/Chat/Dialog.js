// App
import React from 'react'
import Message from './Message'

class Dialog extends React.Component {
    render() {
        return (
            <div className="dialog-container">
                <div className="dialog-wrap">
                    <div className="dialog">
                        {this.props.messages.map((message, index) => {
                            return <Message key={index} message={message} />
                        })}
                    </div>   
                </div>             
            </div>
        )
    }
}

export default Dialog