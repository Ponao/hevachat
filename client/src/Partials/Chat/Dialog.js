// App
import React from 'react'
import Message from './Message'

// Material
import SendIcon from '@material-ui/icons/Send';

class Dialog extends React.Component {
    scrollToBottom() {
        this.messagesEnd.scrollIntoView({ behavior: "smooth" });
    }
    
    componentDidMount() {
        this.scrollToBottom();
    }
    
    render() {
        return (
            <div className="dialog-wrap">
                <div className="dialog">
                    {this.props.messages.map((message, index, messages) => {
                        return <Message 
                            countRecent={0}
                            isRecent={false}
                            openSlider={(sliderImages) => {this.props.openSlider(sliderImages)}}
                            selected={this.props.recentMessages.find(x => x._id === message._id)}
                            canSelect={!!this.props.recentMessages.length}
                            key={index} 
                            index={index}
                            message={message} 
                            messages={messages} 
                            onSelect={(message) => {this.props.onSelect(message)}} 
                            unSelect={(id) => {this.props.unSelect(id)}}
                        />
                    })}

                    <div style={{ float:"left", clear: "both" }} ref={(el) => { this.messagesEnd = el; }}>
                    </div>
                </div>   

                {!this.props.messages.length && <div className="dialog-empty">
                    <SendIcon style={{color: '#B8C3CF', fontSize: 54, margin: '0 auto', display: 'block'}} />

                    <p>Write your first message to {this.props.to}</p>
                </div>}
            </div>  
        )
    }
}

export default Dialog