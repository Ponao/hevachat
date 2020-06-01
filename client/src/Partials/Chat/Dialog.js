// App
import React from 'react'
import Message from './Message'

import { Scrollbars } from 'react-custom-scrollbars';

// Material
import SendIcon from '@material-ui/icons/Send';
import Fab from '@material-ui/core/Fab';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { withStyles, LinearProgress } from '@material-ui/core'
import { connect } from 'react-redux';

let waitActiveUser = false

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
        activePage: false,
        scrollTop: 0
    }

    scrollToBottom() {
        if(this.messagesBlock) {
            this.messagesBlock.view.scroll({
                top: this.messagesBlock.getScrollHeight(),
                left: 0,
                behavior: 'smooth'
            })
        }
    }

    componentWillUnmount() {
        window.removeEventListener('blur', this.blurPage.bind(this));
        window.removeEventListener('mousemove', this.focusPage.bind(this));
    }

    focusPage() {
        let active
        if(this.messagesBlock && this.messagesBlock.getScrollTop() + this.messagesBlock.getClientHeight() < this.messagesBlock.getScrollHeight()) {
            active = false
        } else {
            active = true
        }

        if(!this.state.activePage && active && !!this.props.unRead.length) {
            if(waitActiveUser)
                clearTimeout(waitActiveUser)

            this.props.readMessages()
            this.setState({activePage: true})

            waitActiveUser = setTimeout(() => {
                this.setState({activePage: false})
            }, 3000)
        } 
    }

    blurPage() {
        this.setState({activePage: false})
    }
    
    componentDidMount() {
        window.addEventListener('blur', this.blurPage.bind(this));
        window.addEventListener('mousemove', this.focusPage.bind(this));

        setTimeout(() => {
            this.scrollToBottom();
        }, 200)
    }

    componentDidUpdate(prevProps) {
        if(
            prevProps.messages.length < this.props.messages.length && 
            JSON.stringify(prevProps.messages[0]) === JSON.stringify(this.props.messages[0]) &&
            ((this.messagesBlock.getScrollHeight() - this.messagesBlock.getClientHeight() - this.messagesBlock.getScrollTop()) < this.messagesBlock.getClientHeight()/3 ||
            prevProps.messages[prevProps.messages.length-1].user._id === this.props.user._id)
        ) {
            if(this.state.activePage) {
                this.props.readMessages()
            }
            
            this.scrollToBottom()

            if(this.state.showFabToBottom)
                this.setState({showFabToBottom: false})
        }

        if(JSON.stringify(prevProps.messages[0]) !== JSON.stringify(this.props.messages[0])) {
            this.messagesBlock.scrollTop(this.messagesBlock.getScrollHeight() - this.state.scrollTop - 4)
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(nextState.scrollTop !== this.state.scrollTop) {
            return false
        }

        return true
    }

    onScroll() {
        this.setState({scrollTop: this.messagesBlock.getScrollHeight() - this.messagesBlock.getScrollTop()})
        if(this.messagesBlock.getScrollTop() + this.messagesBlock.getClientHeight() < this.messagesBlock.getScrollHeight() - 100) {
            if(!this.state.showFabToBottom)
                this.setState({showFabToBottom: true})
        } else {
            if(this.state.showFabToBottom) {
                this.setState({showFabToBottom: false})
                if(!!this.props.unRead.length) {
                    this.props.readMessages()
                }
            }
        }

        if(this.props.rooms.activeRoom.canLoad && this.messagesBlock.getScrollTop() < 100)
            this.props.loadMessages()
    }

    viewTypers() {
        if(this.props.rooms.activeRoom.typers.length === 1) {
            return this.props.rooms.activeRoom.typers[0].name.first
        }

        if(this.props.rooms.activeRoom.typers.length === 2) {
            return `${this.props.rooms.activeRoom.typers[0].name.first} и ${this.props.rooms.activeRoom.typers[1].name.first}`
        }

        return `${this.props.rooms.activeRoom.typers[0].name.first} и ${this.props.rooms.activeRoom.typers.length-1}`
    }
    
    render() {
        return (
            <div className="dialog-wrap">
                <Scrollbars
                    onScroll={() => {this.onScroll()}}
                    ref={(ref) => {this.messagesBlock = ref}}
                    renderTrackVertical={props => <div className="track-vertical"/>}
                    renderThumbVertical={props => <div className="thumb-vertical"/>}
                    className="dialog scroll"
                    autoHide
                >
                    {this.props.rooms.activeRoom.isLoading && <div className="dialog-loading">
                        <LinearProgress style={{backgroundColor: '#EFF4F8'}} />
                    </div>}
                    <div className="offset-top"></div>
                    {this.props.messages.map((message, index, messages) => {
                        return <Message 
                            countRecent={0}
                            isRecent={false}
                            openSlider={(sliderImages) => {this.props.openSlider(sliderImages)}}
                            selected={this.props.recentMessages.find(x => x._id === message._id)}
                            canSelect={!!this.props.recentMessages.length}
                            key={index} 
                            deleteLocalMessage={(_id) => {this.props.deleteLocalMessage(_id)}}
                            retrySendMessage={(message) => {this.props.retrySendMessage(message)}}
                            index={index}
                            message={message} 
                            messages={messages} 
                            onSelect={(message) => {this.props.onSelect(message)}} 
                            unSelect={(id) => {this.props.unSelect(id)}}
                        />
                    })}

                    {this.props.type === 'room' && <div className="dialog-typers">
                        {!!this.props.rooms.activeRoom.typers.length && <p className="typing">{this.viewTypers()} typing</p>}
                        {!this.props.rooms.activeRoom.typers.length && <p style={{height: 18}}></p>}
                    </div>}
                </Scrollbars>

                <CustomFab className={`scroll-to-bottom ${this.state.showFabToBottom ? 'active' : ''}`} color="primary" size="small" aria-label="add" onClick={() => {this.scrollToBottom()}}>
                    {!!this.props.unRead.length && <span className="unread-messages-count">{this.props.unRead.length}</span>}
                    <ExpandMoreIcon style={{color: '#99AABB'}} />
                </CustomFab>

                {!this.props.messages.length && <div className="dialog-empty">
                    <SendIcon style={{color: '#B8C3CF', fontSize: 54, margin: '0 auto', display: 'block'}} />

                    <p>Write your first message to {this.props.to}</p>
                </div>}
            </div>  
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.user,
        rooms: state.rooms
    }
}

export default connect(mapStateToProps)(Dialog)