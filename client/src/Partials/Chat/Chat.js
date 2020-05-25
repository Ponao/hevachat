// App
import React from 'react'
import Dialog from './Dialog'

// Redux
import { connect } from 'react-redux'
import * as roomsActions from '../../Redux/actions/rooms'
import { bindActionCreators } from 'redux'

import Attachment from './Attachment';
import Slider from './Slider'
import InputMessage from './InputMessage'
import ToolbarMessage from './ToolbarMessage'

let waitFastRead = false

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
        sliderImages: [],
        isEdit: false,
        editMessage: {}
    }

    sendMessage() {
        if(/\S/.test(this.state.text) || !!this.state.attachedRecentMessages.length || !!this.state.images.length) {
            switch (this.props.type) {
                case 'room': 
                    this.props.roomsActions.sendMessage({
                        text: this.state.text,
                        roomId: this.props.roomId,
                        images: this.state.images,
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

    sendEditMessage() {
        if(/\S/.test(this.state.text) || !!this.state.attachedRecentMessages.length) {
            switch (this.props.type) {
                case 'room': 
                    this.props.roomsActions.editMessage({
                        _id: this.state.editMessage._id,
                        text: this.state.text,
                        roomId: this.props.roomId,
                        dialogId: this.props.dialogId,
                        recentMessages: this.state.attachedRecentMessages
                    }, this.props.user.apiToken)
                    break;
                case 'dialog': 
                    this.props.roomsActions.editMessage({
                        
                    })
                    break;
                default:
                    break;
            }
            
            this.setState({text: '', attachedRecentMessages: [], images: [], sounds: [], files: [], isEdit: false, editMessage: {}})
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

    addAttachmentRecentMessage() {
        this.setState({
            attachedRecentMessages: this.state.recentMessages,
            recentMessages: []
        })
    }

    cancelAttachmentRecentMessage() {
        this.setState({
            recentMessages: []
        })
    }

    setEditMessage() {
        this.setState({
            text: this.state.recentMessages[0].text,
            images: this.state.recentMessages[0].images,
            sounds: this.state.recentMessages[0].sounds,
            files: this.state.recentMessages[0].files,
            recentMessages: [],
            attachedRecentMessages: this.state.recentMessages[0].recentMessages,
            isEdit: true,
            editMessage: this.state.recentMessages[0]
        })
    }

    setLastEditMessage() {
        let lastMyMessage = this.props.messages.slice().reverse().find(x => x.user._id === this.props.user._id)

        if(lastMyMessage) {
            this.setState({
                text: lastMyMessage.text,
                images: lastMyMessage.images,
                sounds: lastMyMessage.sounds,
                files: lastMyMessage.files,
                recentMessages: [],
                attachedRecentMessages: lastMyMessage.recentMessages,
                isEdit: true,
                editMessage: lastMyMessage
            })
        }
    }

    cancelEditMessage() {
        this.setState({
            text: '',
            images: [],
            sounds: [],
            files: [],
            recentMessages: [],
            attachedRecentMessages: [],
            isEdit: false,
            editMessage: {}
        })
    }

    readMessages() {
        if(waitFastRead)
            clearTimeout(waitFastRead)

        switch (this.props.type) {
            case 'room': 
                waitFastRead = setTimeout(() => {
                    this.props.roomsActions.readMessages({dialogId: this.props.dialogId, roomId: this.props.roomId, userId: this.props.user._id}, this.props.user.apiToken)
                }, 500)
                break;
            case 'dialog': 
                this.props.roomsActions.readMessages({
                    
                })
                break;
            default:
                break;
        }
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
        return (
        <>
            <div className="dialog-container">
                <Slider images={this.state.sliderImages} isOpen={this.state.isOpenSlider} close={() => {this.setState({isOpenSlider: false, sliderImages: []})}} />

                <Dialog 
                    messages={this.props.messages}
                    to={this.props.to}
                    unRead={this.props.messages.filter(x => !x.isRead && x.user._id !== this.props.user._id)}
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
                    readMessages={() => {this.readMessages()}}
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

                {!this.state.recentMessages.length && 
                    <InputMessage 
                        cancelEditMessage={() => {this.cancelEditMessage()}}
                        isEdit={this.state.isEdit}
                        editMessage={this.state.editMessage}
                        sendEditMessage={() => {this.sendEditMessage()}}
                        text={this.state.text} 
                        images={this.state.images} 
                        sounds={this.state.sounds} 
                        files={this.state.files} 
                        attachedRecentMessages={this.state.attachedRecentMessages} 
                        sendMessage={() => {this.sendMessage()}} 
                        setText={(text) => {this.setState({text})}} 
                        addFile={(e) => {this.addFile(e)}} 
                        setLastEditMessage={() => {this.setLastEditMessage()}}
                    />
                }

                {!!this.state.recentMessages.length && 
                    <ToolbarMessage 
                        addAttachmentRecentMessage={() => {this.addAttachmentRecentMessage()}}
                        cancelAttachmentRecentMessage={() => {this.cancelAttachmentRecentMessage()}} 
                        deleteMessage={() => {this.deleteMessage()}}
                        recentMessages={this.state.recentMessages}
                        setEditMessage={() => {this.setEditMessage()}}
                    />
                }
            </div>
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