// App
import React from 'react'
import ReactResizeDetector from 'react-resize-detector'
import {CSSTransitionGroup} from 'react-transition-group'

// Material
import AttachFileIcon from '@material-ui/icons/AttachFile';
import SendIcon from '@material-ui/icons/Send';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

class InputMessage extends React.Component {
    state = {
        inputMessageHeight: 0,
        text: ''
    }

    setText(text) {
        this.setState({text})
    }

    onPaste(event) {
        let items = (event.clipboardData || event.originalEvent.clipboardData).items
        
        for (let index = 0; index < items.length; index++) {
            if (items[index].kind === 'file') {
                let file = items[index].getAsFile()

                this.props.addFile(file, true)
            }
        }
    }

    componentDidUpdate() {
        if(this.props.isEdit) {
            if(!/\S/.test(this.state.text) && !this.props.attachedRecentMessages.length && !this.props.images.length && !this.props.files.length && !this.props.sounds.length) {
                this.props.cancelEditMessage()
            }
        }
    }

    render() {
        return (
            <div className={`dialog-input ${this.props.isShow ? '': 'd-none'}`}>
                <IconButton component={'label'} className="btn-add-files">
                    <AttachFileIcon style={{transform: 'rotate(45deg)', color: '#008FF7'}} />

                    <input 
                        type="file" 
                        multiple 
                        onChange={(e) => {this.props.addFile(e)}}
                        id="uploadFile" 
                        style={{display: 'none'}} 
                        accept="image/jpeg,image/gif,image/jpeg,image/png,application/pdf,text/plain,application/x-zip-compressed,application/zip,application/msword,audio/mpeg" 
                    />
                </IconButton>

                <textarea className="col input-message" id="input-message" onPaste={(e) => {this.onPaste(e)}}
                    onKeyDown={(e) => {
                        if(e.keyCode === 38 && !this.props.isEdit && !this.state.text.length) {
                            this.props.setLastEditMessage()
                        }

                        if (e.keyCode === 13 && !e.shiftKey) {
                            e.preventDefault()
                            if(/\S/.test(this.state.text) || !!this.props.attachedRecentMessages.length  || !!this.props.images.length || !!this.props.files.length || !!this.props.sounds.length) {
                                if(!this.props.isEdit) {
                                    this.props.sendMessage(this.state.text)
                                    this.setState({text: ''})
                                }
                                else {
                                    this.props.sendEditMessage(this.state.text)
                                    this.setState({text: ''})
                                }
                                let inputMessage = document.getElementById('input-message')
                                inputMessage.style.maxHeight = "60px";
                            }
                        }
                    }}
                    onInput={() => {
                        let inputMessage = document.getElementById('input-message')
                        inputMessage.style.height = "5px";
                        inputMessage.style.height = (inputMessage.scrollHeight)+"px";

                        if(inputMessage.scrollHeight > 179) {
                            inputMessage.style.maxHeight = '179px'
                        } else {
                            inputMessage.style.maxHeight = (inputMessage.scrollHeight)+"px";
                        }
                    }}
                    onChange={(e) => {
                        this.props.typing(e.target.value, this.state.text)
                        this.setState({text: e.target.value})
                    }}
                    value={this.state.text}
                ></textarea>

                {!this.state.text && <div className="placeholder">Write message...</div>}

                {!this.props.isEdit && <CSSTransitionGroup 
                    transitionName="btn-send-message"
                    transitionEnterTimeout={100}
                    transitionLeaveTimeout={100}>
                     {(/\S/.test(this.state.text) || !!this.props.files.length || !!this.props.images.length|| !!this.props.sounds.length || !!this.props.attachedRecentMessages.length) && <IconButton onClick={() => {
                            this.props.sendMessage(this.state.text)
                            this.setState({text: ''})
                            let inputMessage = document.getElementById('input-message')
                            inputMessage.style.maxHeight = "60px";
                        }} className="btn-send-message">
                        <SendIcon style={{color: '#008FF7'}} />
                    </IconButton>}
                </CSSTransitionGroup>}

                {this.props.isEdit && <CSSTransitionGroup 
                    transitionName="btn-send-message"
                    transitionEnterTimeout={100}
                    transitionLeaveTimeout={100}>
                     {(
                        JSON.stringify({
                            text: this.props.editMessage.text,
                            images: this.props.editMessage.images,
                            sounds: this.props.editMessage.sounds,
                            files: this.props.editMessage.files,
                            attachedRecentMessages: this.props.editMessage.recentMessages,
                        }) !== 
                        JSON.stringify({
                            text: this.state.text,
                            images: this.props.images,
                            sounds: this.props.sounds,
                            files: this.props.files,
                            attachedRecentMessages: this.props.attachedRecentMessages
                        })) && <IconButton ref={(node) => {
                        if (node) {
                            node.style.setProperty("margin-right", "0", "important");
                        }
                        }} 
                        onClick={() => {
                            this.props.sendEditMessage(this.state.text)
                            this.setState({text: ''})
                            let inputMessage = document.getElementById('input-message')
                            inputMessage.style.maxHeight = "60px";
                        }} className="btn-send-message">
                        <EditOutlinedIcon style={{color: '#008FF7'}} />
                    </IconButton>}

                    <IconButton ref={(node) => {
                        if (node) {
                            node.style.setProperty("margin-left", "0", "important");
                        }
                        }} 
                        onClick={() => {
                            this.props.cancelEditMessage()
                            let inputMessage = document.getElementById('input-message')
                            inputMessage.style.maxHeight = "60px";
                        }} className="btn-send-message">
                        <CloseIcon style={{color: '#008FF7'}} />
                    </IconButton>
                </CSSTransitionGroup>}

                <ReactResizeDetector handleHeight onResize={(width, inputMessageHeight) => {
                    this.setState({inputMessageHeight})
                }} />
            </div>
        )
    }
}

export default InputMessage