// App
import React from 'react'

// Material
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import CloseIcon from '@material-ui/icons/Close';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import Button from '@material-ui/core/Button';
import ReplyIcon from '@material-ui/icons/Reply';

// Redux
import { connect } from 'react-redux'

class ToolbarMessage extends React.Component {
    state = {
        inputMessageHeight: 0
    }

    render() {
        return (
            <div className="dialog-input">
                <Button className="btn-reply" onClick={() => {this.props.addAttachmentRecentMessage()}}>
                    <ReplyIcon style={{color: '#99AABB'}} />
                </Button>

                {!this.props.recentMessages.find(message => message.type === 'call') && <Button className="btn-forward" onClick={() => {this.props.addAttachmentForwardMessage()}}>
                    <ReplyIcon style={{color: '#99AABB', transform: 'scaleX(-1)'}} />
                </Button>}

                <div className="col"></div>

                {(this.props.recentMessages[0].user._id === this.props.user._id && this.props.recentMessages[0].type !== 'call' && this.props.recentMessages.length === 1) && <Button className="btn-edit-message" onClick={() => {
                    this.props.setEditMessage()
                }}>
                    <EditOutlinedIcon style={{color: '#99AABB'}} />
                </Button>}

                {!this.props.recentMessages.find(message => message.user._id !== this.props.user._id) && <Button className="btn-delete-message" onClick={() => {
                    this.props.deleteMessage()
                }}>
                    <DeleteOutlineIcon style={{color: '#99AABB'}} />
                </Button>}

                <Button className="btn-cancel-select" onClick={() => {
                    this.props.cancelAttachmentRecentMessage()
                }}>
                    <CloseIcon style={{color: '#99AABB'}} />
                </Button>
            </div>
        )
    }
}
const mapStateToProps = state => {
    return {
        user: state.user
    }
}

export default connect(mapStateToProps)(ToolbarMessage)