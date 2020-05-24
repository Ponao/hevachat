// App
import React from 'react'
import ReactResizeDetector from 'react-resize-detector'
import {CSSTransitionGroup} from 'react-transition-group'

// Material
import AttachFileIcon from '@material-ui/icons/AttachFile';
import SendIcon from '@material-ui/icons/Send';
import IconButton from '@material-ui/core/IconButton';

class InputMessage extends React.Component {
    state = {
        inputMessageHeight: 0
    }

    render() {
        return (
            <>
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

                <textarea className="col input-message" id="input-message" 
                    onKeyDown={(e) => {
                        if (e.keyCode == 13 && !e.shiftKey) {
                            e.preventDefault()
                            if(/\S/.test(this.props.text) || !!this.props.attachedRecentMessages.length) {
                                this.props.sendMessage()
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
                        this.props.setText(e.target.value)
                    }}
                    value={this.props.text}
                ></textarea>

                {!this.props.text && <div className="placeholder">Write message...</div>}

                <CSSTransitionGroup 
                    transitionName="btn-send-message"
                    transitionEnterTimeout={100}
                    transitionLeaveTimeout={100}>
                     {(/\S/.test(this.props.text) || !!this.props.files.length || !!this.props.images.length|| !!this.props.sounds.length || !!this.props.attachedRecentMessages.length) && <IconButton onClick={() => {
                            this.props.sendMessage()
                            let inputMessage = document.getElementById('input-message')
                            inputMessage.style.maxHeight = "60px";
                        }} className="btn-send-message">
                        <SendIcon style={{color: '#008FF7'}} />
                    </IconButton>}
                </CSSTransitionGroup>

                <ReactResizeDetector handleHeight onResize={(width, inputMessageHeight) => {
                    this.setState({inputMessageHeight})
                }} />
            </>
        )
    }
}

export default InputMessage