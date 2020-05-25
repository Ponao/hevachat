// App
import React from 'react'
import Message from './Message'
import {CSSTransitionGroup} from 'react-transition-group'

// Material
import SendIcon from '@material-ui/icons/Send';
import Fab from '@material-ui/core/Fab';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { withStyles } from '@material-ui/core'
import { randomInteger } from '../../Controllers/FunctionsController';

const fabStyles = theme => ({
    root: {
        backgroundColor: '#fff',
        position: 'absolute',
        color: '#008FF7',
        bottom: 20,
        right: 20,
        zIndex: 2,
        '&:hover': {
            backgroundColor: '#fff',
        }
    }
})

const CustomFab = withStyles(fabStyles)(Fab);

class Dialog extends React.Component {
    state = {
        showFabToBottom: false,
        randomId: randomInteger(0, 100000)
    }

    scrollToBottom() {
        this.messagesEnd.scrollIntoView({ behavior: "smooth" });
    }
    
    componentDidMount() {
        this.scrollToBottom();

        document.getElementById('dialog-'+this.state.randomId).addEventListener('scroll', this.scrollDialog.bind(this));
    }

    componentDidUpdate(prevProps) {
        if(
            prevProps.messages.length < this.props.messages.length && 
            (this.messagesBlock.scrollHeight - this.messagesBlock.offsetHeight - this.messagesBlock.scrollTop) < this.messagesBlock.offsetHeight/3
        ) {
            this.props.readMessages()
            this.scrollToBottom();
        }
    }

    componentWillUnmount() {
        document.getElementById('dialog-'+this.state.randomId).removeEventListener('scroll', this.scrollDialog.bind(this));
    }

    scrollDialog(e) {
        let scrollTop = e.srcElement.scrollTop
        let scrollHeight = e.srcElement.scrollHeight
        let height = e.srcElement.offsetHeight

        if(scrollTop < (scrollHeight - height)) {
            if(!this.state.showFabToBottom)
                this.setState({showFabToBottom: true})
        } else {
            if(this.state.showFabToBottom) {
                this.props.readMessages()
                this.setState({showFabToBottom: false})
            }
        }
    }
    
    render() {
        return (
            <div className="dialog-wrap">
                <div className="dialog" id={"dialog-"+this.state.randomId} ref={(el) => { this.messagesBlock = el; }}>
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

                <CSSTransitionGroup 
                    transitionName="scroll-to-bottom"
                    transitionEnterTimeout={100}
                    transitionLeaveTimeout={100}>
                        {this.state.showFabToBottom && <CustomFab color="primary" size="small" aria-label="add" onClick={() => {this.scrollToBottom()}}>
                            {!!this.props.unRead.length && <span className="unread-messages-count">{this.props.unRead.length}</span>}
                            <ExpandMoreIcon style={{color: '#008FF7'}} />
                        </CustomFab>} 
                </CSSTransitionGroup>

                {!this.props.messages.length && <div className="dialog-empty">
                    <SendIcon style={{color: '#B8C3CF', fontSize: 54, margin: '0 auto', display: 'block'}} />

                    <p>Write your first message to {this.props.to}</p>
                </div>}
            </div>  
        )
    }
}

export default Dialog