// App
import React from 'react'
import Dialog from './Dialog'


// Material
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import CloseIcon from '@material-ui/icons/Close';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import Button from '@material-ui/core/Button';

// Redux
import { connect } from 'react-redux'
import * as roomsActions from '../../Redux/actions/rooms'
import { bindActionCreators } from 'redux'

import Attachment from './Attachment';
import Slider from './Slider'
import InputMessage from './InputMessage'

class Chat extends React.Component {
    state = {
        text: '',
        recentMessages: [],
        attachedRecentMessages: [],
        sounds: [],
        files: [],
        images: [],
        inputMessageHeight: 0,
        isOpenSlider: false,
        sliderImages: []
    }

    sendMessage() {
        if(/\S/.test(this.state.text) || !!this.state.attachedRecentMessages.length) {
            switch (this.props.type) {
                case 'room': 
                    this.props.roomsActions.sendMessage({
                        text: this.state.text,
                        roomId: this.props.roomId,
                        dialogId: this.props.dialogId,
                        recentMessages: this.state.attachedRecentMessages
                    }, this.props.user.apiToken)
                    break;
                case 'dialog': 
                    this.props.roomsActions.sendMessage({
                        
                    })
                    break;
                default:
                    break;
            }
            
            this.setState({text: '', attachedRecentMessages: [], images: [], sounds: [], files: []})
        }
    }

    deleteMessage() {
        switch (this.props.type) {
            case 'room': 
                this.props.roomsActions.deleteMessage({
                    roomId: this.props.roomId,
                    deleteMessages: this.state.recentMessages
                }, this.props.user.apiToken)
                break;
            case 'dialog': 
                this.props.roomsActions.sendMessage({
                    
                })
                break;
            default:
                break;
        }

        this.setState({recentMessages: []})
    }

    addFile(e) {
        let sounds = [...this.state.sounds]
        let files = [...this.state.files]
        let images = [...this.state.images]
        
        for (let i = 0; i < e.target.files.length; i++) {
            let file = {
                path: (window.URL || window.webkitURL).createObjectURL(new Blob([e.target.files[i]], {type: e.target.files[i].type})), 
                file: e.target.files[i], 
                name: e.target.files[i].name, 
                type: e.target.files[i].name.split('.').pop()
            }
            
            if(file.type === 'png' || file.type === 'jpg' || file.type === 'jpeg' || file.type === 'gif') {
                file.id = images.length
                images.push(file)
            }

            if(file.type === 'txt' || file.type === 'pdf' || file.type === 'docx' || file.type === 'zip' || file.type === 'doc') {
                file.id = files.length
                files.push(file)
            }

            if(file.type === 'mp3') {
                file.id = sounds.length
                files.push(file)
            }
        }

        e.target.value = null;

        this.setState({sounds, files, images})
    }

    render() {
        return (<>
        <div className="dialog-container">
            <Slider images={this.state.sliderImages} isOpen={this.state.isOpenSlider} close={() => {this.setState({isOpenSlider: false, sliderImages: []})}} />

            <Dialog 
                messages={this.props.messages}
                to={this.props.to}
                recentMessages={this.state.recentMessages}
                openSlider={(sliderImages) => {this.setState({sliderImages, isOpenSlider: true})}}
                onSelect={(message) => {
                    this.setState({recentMessages: [...this.state.recentMessages, message]})
                }} 
                unSelect={(id) => {
                    this.setState({recentMessages: [
                        ...this.state.recentMessages.filter(message => {                        
                            return message._id !== id
                        })
                    ]})
                }}
            />

            {(!!this.state.attachedRecentMessages.length || !!this.state.images.length || !!this.state.sounds.length || !!this.state.files.length) && 
                <Attachment 
                    images={this.state.images} 
                    recentMessages={this.state.attachedRecentMessages} 
                    files={this.state.files} 
                    sounds={this.state.sounds}
                    unSelectRecentMessages={() => {
                        this.setState({attachedRecentMessages: []})
                    }}
                    removeImage={(id) => {
                        this.setState({images: [
                            ...this.state.images.filter(image => {                        
                                return image.id !== id
                            })
                        ]})
                    }}
                />
            }

            {!this.state.recentMessages.length && <div className="dialog-input">
                <InputMessage text={this.state.text} images={this.state.images} sounds={this.state.sounds} files={this.state.files} attachedRecentMessages={this.state.attachedRecentMessages} sendMessage={() => {this.sendMessage()}} setText={(text) => {this.setState({text})}} addFile={(e) => {this.addFile(e)}} />
            </div>}

            {!!this.state.recentMessages.length && <div className="dialog-input">
                <Button className="btn-reply" onClick={() => {
                    this.setState({
                        attachedRecentMessages: this.state.recentMessages,
                        recentMessages: []
                    })
                }}>
                    Reply
                </Button>

                <Button className="btn-forward">
                    Forward
                </Button>

                <div className="col">

                </div>

                {(!this.state.recentMessages.find(message => message.user._id !== this.props.user._id) && this.state.recentMessages.length === 1) && <Button className="btn-edit-message">
                    <EditOutlinedIcon style={{color: '#99AABB'}} />
                </Button>}

                {!this.state.recentMessages.find(message => message.user._id !== this.props.user._id) && <Button className="btn-delete-message" onClick={() => {
                    this.deleteMessage()
                }}>
                    <DeleteOutlineIcon style={{color: '#99AABB'}} />
                </Button>}

                <Button className="btn-cancel-select" onClick={() => {
                    this.setState({recentMessages: []})
                }}>
                    <CloseIcon style={{color: '#99AABB'}} />
                </Button>
            </div>}</div>
        </>)
    }
}

const mapStateToProps = state => {
    return {
        user: state.user,
        rooms: state.rooms
    }
}

function mapDispatchToProps(dispatch) {
    return {
        roomsActions: bindActionCreators(roomsActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Chat)