// App
import React from 'react'

// Material
import AttachFileIcon from '@material-ui/icons/AttachFile';
import SendIcon from '@material-ui/icons/Send';

import ContentEditable from 'react-contenteditable'

class Input extends React.Component {
    state = {
        text: ''
    }

    render() {
        return (
            <div className="dialog-input">
                <div className="btn-add-files">
                    <AttachFileIcon style={{transform: 'rotate(45deg)', color: '#008FF7'}} />
                </div>

                <ContentEditable
                    multiLine={true}
                    className="col input-message"
                    html={this.state.text}
                    onChange={(e) => {this.setState({text: e.target.value})}}
                />

                {!this.state.text.length && <div className="placeholder">Write message...</div>}

                <div className="btn-send-message">
                    <SendIcon style={{color: '#008FF7'}} />
                </div>
            </div>
        )
    }
}

export default Input