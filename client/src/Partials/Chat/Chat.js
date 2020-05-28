// App
import React from 'react'
import Dialog from './Dialog'
import {CSSTransitionGroup} from 'react-transition-group'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Redux
import { connect } from 'react-redux'
import * as roomsActions from '../../Redux/actions/rooms'
import { bindActionCreators } from 'redux'

import Attachment from './Attachment';
import Slider from './Slider'
import InputMessage from './InputMessage'
import ToolbarMessage from './ToolbarMessage'
import SocketController from '../../Controllers/SocketController'
import { randomInteger } from '../../Controllers/FunctionsController';

let waitFastRead = false

class Chat extends React.Component {
    constructor(props) {
        super(props)
        this.inputMessage = React.createRef()
    }

    state = {
        recentMessages: [],
        attachedRecentMessages: [],
        sounds: [],
        files: [],
        images: [],
        inputMessageHeight: 0,
        isOpenSlider: false,
        sliderImages: [],
        isEdit: false,
        editMessage: {},
        canTyping: true
    }

    sendMessage(text) {
        if(/\S/.test(text) || !!this.state.attachedRecentMessages.length || !!this.state.images.length || !!this.state.files.length|| !!this.state.sounds.length) {
            switch (this.props.type) {
                case 'room': 
                    this.props.roomsActions.sendMessage({
                        text: text,
                        roomId: this.props.roomId,
                        images: this.state.images,
                        files: this.state.files,
                        sounds: this.state.sounds,
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
            
            this.setState({attachedRecentMessages: [], images: [], sounds: [], files: []})
            this.inputMessage.current.setText('')
        }
    }

    sendEditMessage(text) {
        if(/\S/.test(text) || !!this.state.attachedRecentMessages.length || !!this.state.images.length || !!this.state.sounds.length || !!this.state.files.length) {
            switch (this.props.type) {
                case 'room': 
                    this.props.roomsActions.editMessage({
                        _id: this.state.editMessage._id,
                        text: text,
                        roomId: this.props.roomId,
                        images: this.state.images,
                        files: this.state.files,
                        sounds: this.state.sounds,
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
            
           this.cancelEditMessage()
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

    retrySendMessage(message) {
        switch (this.props.type) {
            case 'room': 
                message.roomId = this.props.rooms.activeRoom._id
                message.dialogId = this.props.dialogId
                this.props.roomsActions.retrySendMessage(message, this.props.user.apiToken)
                break;
            case 'dialog': 
                this.props.roomsActions.editMessage({
                    
                })
                break;
            default:
                break;
        }
    }

    deleteLocalMessage(_id) {
        switch (this.props.type) {
            case 'room': 
                this.props.roomsActions.deleteLocalMessage(_id)
                break;
            case 'dialog': 
                this.props.roomsActions.sendMessage({
                    
                })
                break;
            default:
                break;
        }
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
        this.inputMessage.current.setText(this.state.recentMessages[0].text)

        this.state.recentMessages[0].images.map((x, i) => {
            x.id = i
        })
        this.state.recentMessages[0].sounds.map((x, i) => {
            x.id = i
        })
        this.state.recentMessages[0].files.map((x, i) => {
            x.id = i
        })

        this.setState({
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

        lastMyMessage.images.map(x => {
            x.id = randomInteger(0, 10000)
        })
        lastMyMessage.sounds.map(x => {
            x.id = randomInteger(0, 10000)
        })
        lastMyMessage.files.map(x => {
            x.id = randomInteger(0, 10000)
        })

        if(lastMyMessage) {
            this.inputMessage.current.setText(lastMyMessage.text)
            this.setState({
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
        this.inputMessage.current.setText('')
        this.setState({
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

    loadMessages() {
        switch (this.props.type) {
            case 'room': 
                this.props.roomsActions.loadMessages({dialogId: this.props.dialogId}, this.props.user.apiToken)
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

        let counter = sounds.length + files.length + images.length
        
        for (let i = 0; i < e.target.files.length; i++) {
            if(counter > 9) {
                toast.error("Max upload 10 attachment!", {
                    position: toast.POSITION.TOP_CENTER
                });
                break
            }

            let file = {
                path: (window.URL || window.webkitURL).createObjectURL(new Blob([e.target.files[i]], {type: e.target.files[i].type})), 
                file: e.target.files[i], 
                name: e.target.files[i].name, 
                type: e.target.files[i].name.split('.').pop(),
                size: e.target.files[i].size / 1000
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
                sounds.push(file)
            }

            counter++
        }

        e.target.value = null;

        this.setState({sounds, files, images})
    }

    typing(newText, prevText) {
        if(newText > prevText) {
            if(this.state.canTyping) {
                this.setState({canTyping: false})

                SocketController.typingRoom(this.props.rooms.activeRoom._id)
                
                setTimeout(() => {
                    this.setState({canTyping: true})
                }, 2500)
            }
        }
    }

    render() {
        return (
        <>
            <div className="dialog-container">
                <Slider images={this.state.sliderImages} isOpen={this.state.isOpenSlider} close={() => {this.setState({isOpenSlider: false, sliderImages: []})}} />

                <Dialog 
                    loadMessages={() => {this.loadMessages()}}
                    retrySendMessage={(message) => {this.retrySendMessage(message)}}
                    deleteLocalMessage={(_id) => {this.deleteLocalMessage(_id)}}
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
                    readMessages={() => {
                        this.readMessages()
                    }}
                />

                <CSSTransitionGroup 
                    transitionName="scroll-to-bottom"
                    transitionEnterTimeout={100}
                    transitionLeaveTimeout={100}>
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
                            removeSound={(id) => {
                                this.setState({sounds: [
                                    ...this.state.sounds.filter(sound => {                        
                                        return sound.id !== id
                                    })
                                ]})
                            }}
                            removeFile={(id) => {
                                this.setState({files: [
                                    ...this.state.files.filter(file => {                        
                                        return file.id !== id
                                    })
                                ]})
                            }}
                        />
                    }
                </CSSTransitionGroup>

                <InputMessage 
                    isShow={!this.state.recentMessages.length}
                    ref={this.inputMessage}
                    cancelEditMessage={() => {this.cancelEditMessage()}}
                    isEdit={this.state.isEdit}
                    editMessage={this.state.editMessage}
                    sendEditMessage={(text) => {this.sendEditMessage(text)}}
                    cancelEditMessage={() => {this.cancelEditMessage()}}
                    images={this.state.images} 
                    sounds={this.state.sounds} 
                    files={this.state.files} 
                    attachedRecentMessages={this.state.attachedRecentMessages} 
                    sendMessage={(text) => {this.sendMessage(text)}}
                    typing={(newText, prevText) => {this.typing(newText, prevText)}}
                    addFile={(e) => {this.addFile(e)}} 
                    setLastEditMessage={() => {this.setLastEditMessage()}}
                />

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