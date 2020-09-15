// App
import React from 'react'
import Dialog from './Dialog'
import {CSSTransitionGroup} from 'react-transition-group'
import { toast } from 'react-toastify';

// Redux
import { connect } from 'react-redux'
import * as roomsActions from '../../Redux/actions/rooms'
import * as dialogsActions from '../../Redux/actions/dialogs'
import { bindActionCreators } from 'redux'

import Attachment from './Attachment';
import InputMessage from './InputMessage'
import ToolbarMessage from './ToolbarMessage'
import SocketController from '../../Controllers/SocketController'
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';

let waitFastRead = false

class Chat extends React.Component {
    constructor(props) {
        super(props)
        this.inputMessage = React.createRef()
    }

    state = {
        recentMessages: [],
        attachedRecentMessages: this.props.dialogs.forwardMessages,
        sounds: [],
        files: [],
        images: [],
        inputMessageHeight: 0,
        isEdit: false,
        editMessage: {},
        canTyping: true,
        drag: false
    }

    dropRef = React.createRef()
    dragCounter = 0

    componentDidMount() {
        if(!!this.props.dialogs.forwardMessages.length) {
            this.props.dialogsActions.setForward([])
        }

        let div = this.dropRef.current
        div.addEventListener('dragenter', this.handleDragIn)
        div.addEventListener('dragleave', this.handleDragOut)
        div.addEventListener('dragover', this.handleDrag)
        div.addEventListener('drop', this.handleDrop)

        let drafts = {...JSON.parse(localStorage.getItem('drafts'))}
        
        if(drafts['draft-'+this.props.dialogId])
            this.inputMessage.current.setText(drafts['draft-'+this.props.dialogId])
    }

    componentWillUnmount() {
        let div = this.dropRef.current
        div.removeEventListener('dragenter', this.handleDragIn)
        div.removeEventListener('dragleave', this.handleDragOut)
        div.removeEventListener('dragover', this.handleDrag)
        div.removeEventListener('drop', this.handleDrop)
    }

    handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
    }

    handleDragIn = (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.dragCounter++
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            this.setState({drag: true})
        }
    }

    handleDragOut = (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.dragCounter--
        if (this.dragCounter === 0) {
            this.setState({drag: false})
        }
    }

    handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.setState({drag: false})
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          this.handleDropFiles(e.dataTransfer.files)
          e.dataTransfer.clearData()
          this.dragCounter = 0    
        }
      }

    handleDropFiles = (files) => {
        for (var i = 0; i < files.length; i++) {
            this.addFile(files, false, true)
        }
    }

    sendMessage(text) {
        if(/\S/.test(text) || !!this.state.attachedRecentMessages.length || !!this.state.images.length || !!this.state.files.length|| !!this.state.sounds.length) {
            let drafts = {...JSON.parse(localStorage.getItem('drafts'))}
            delete drafts['draft-'+this.props.dialogId]
            localStorage.setItem('drafts', JSON.stringify(drafts));
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
                    this.props.dialogsActions.sendMessage({
                        text: text,
                        userId: this.props.userId,
                        images: this.state.images,
                        files: this.state.files,
                        sounds: this.state.sounds,
                        dialogId: this.props.dialogId,
                        recentMessages: this.state.attachedRecentMessages
                    }, this.props.user.apiToken)
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
                    this.props.dialogsActions.editMessage({
                        _id: this.state.editMessage._id,
                        text: text,
                        userId: this.props.userId,
                        images: this.state.images,
                        files: this.state.files,
                        sounds: this.state.sounds,
                        dialogId: this.props.dialogId,
                        recentMessages: this.state.attachedRecentMessages
                    }, this.props.user.apiToken)
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
                this.props.dialogsActions.deleteMessage({
                    otherId: this.props.userId,
                    dialogId: this.props.dialogId,
                    deleteMessages: this.state.recentMessages
                }, this.props.user.apiToken)
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
                message.userId = this.props.userId
                message.dialogId = this.props.dialogId
                this.props.dialogsActions.retrySendMessage(message, this.props.user.apiToken)
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
                this.props.dialogsActions.deleteLocalMessage(_id, this.props.dialogId)
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

    addAttachmentForwardMessage() {
        this.props.dialogsActions.setForward(this.state.recentMessages)
        this.setState({
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
            return 1
        })
        this.state.recentMessages[0].sounds.map((x, i) => {
            x.id = i
            return 1
        })
        this.state.recentMessages[0].files.map((x, i) => {
            x.id = i
            return 1
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

        lastMyMessage.images.map((x, i) => {
            x.id = i
            return 1
        })
        lastMyMessage.sounds.map((x, i) => {
            x.id = i
            return 1
        })
        lastMyMessage.files.map((x, i) => {
            x.id = i
            return 1
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
                    this.props.roomsActions.readMessages({
                        dialogId: this.props.dialogId, 
                        roomId: this.props.roomId, 
                        userId: this.props.user._id
                    }, this.props.user.apiToken)
                }, 100)
                break;
            case 'dialog': 
                waitFastRead = setTimeout(() => {
                    this.props.dialogsActions.readMessages({
                        dialogId: this.props.dialogId, 
                        otherId: this.props.userId, 
                        userId: this.props.user._id
                    }, this.props.user.apiToken)
                }, 100)
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
                this.props.dialogsActions.loadMessages({dialogId: this.props.dialogId}, this.props.user.apiToken)
                break;
            default:
                break;
        }
    }

    addFile(e, paste = false, drag = false) {
        let sounds = [...this.state.sounds]
        let files = [...this.state.files]
        let images = [...this.state.images]

        let counter = sounds.length + files.length + images.length
        
        if(!paste && !drag) {
            for (let i = 0; i < e.target.files.length; i++) {
                if(counter > 9) {
                    toast.error("Max upload 10 attachments!", {
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
                
                if(file.type.toLowerCase() === 'png' || file.type.toLowerCase() === 'jpg' || file.type.toLowerCase() === 'jpeg' || file.type.toLowerCase() === 'gif') {
                    file.id = images.length
                    images.push(file)
                }

                if(file.type.toLowerCase() === 'txt' || file.type.toLowerCase() === 'pdf' || file.type.toLowerCase() === 'docx' || file.type.toLowerCase() === 'zip' || file.type.toLowerCase() === 'doc') {
                    file.id = files.length
                    files.push(file)
                }

                if(file.type.toLowerCase() === 'mpeg' || file.type.toLowerCase() === 'mp3' || file.type.toLowerCase() === 'ogg' || file.type.toLowerCase() === 'wav' || file.type.toLowerCase() === 'flac') {
                    file.id = sounds.length
                    sounds.push(file)
                }

                counter++
            }

            e.target.value = null;
        }

        if(paste) {
            if(counter > 9) {
                toast.error("Max upload 10 attachment!", {
                    position: toast.POSITION.TOP_CENTER
                });
            } else {
                let file = {
                    id: images.length,
                    path: (window.URL || window.webkitURL).createObjectURL(new Blob([e], {type: e.type})), 
                    file: e, 
                    name: e.name, 
                    type: e.name.split('.').pop()
                }

                images.push(file)
            }
        }

        if(drag) {
            for (let i = 0; i < e.length; i++) {
                if(counter > 9) {
                    toast.error("Max upload 10 attachment!", {
                        position: toast.POSITION.TOP_CENTER
                    });
                    break
                }

                let file = {
                    path: (window.URL || window.webkitURL).createObjectURL(new Blob([e[i]], {type: e[i].type})), 
                    file: e[i], 
                    name: e[i].name, 
                    type: e[i].name.split('.').pop(),
                    size: e[i].size / 1000
                }
                
                if(file.type.toLowerCase() === 'png' || file.type.toLowerCase() === 'jpg' || file.type.toLowerCase() === 'jpeg' || file.type.toLowerCase() === 'gif') {
                    file.id = images.length
                    images.push(file)
                }

                if(file.type.toLowerCase() === 'txt' || file.type.toLowerCase() === 'pdf' || file.type.toLowerCase() === 'docx' || file.type.toLowerCase() === 'zip' || file.type.toLowerCase() === 'doc') {
                    file.id = files.length
                    files.push(file)
                }

                if(file.type.toLowerCase() === 'mpeg' || file.type.toLowerCase() === 'mp3' || file.type.toLowerCase() === 'ogg' || file.type.toLowerCase() === 'wav' || file.type.toLowerCase() === 'flac') {
                    file.id = sounds.length
                    sounds.push(file)
                }

                counter++
            }
        }

        this.setState({sounds, files, images})
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(this.state.canTyping !== nextState.canTyping) {
            return false
        }

        return true
    }

    typing(newText, prevText) {
        if(newText > prevText && !this.state.isEdit) {
            if(this.state.canTyping) {
                this.setState({canTyping: false})

                switch (this.props.type) {
                    case 'room': 
                        SocketController.typingRoom(this.props.rooms.activeRoom._id)
                        break;
                    case 'dialog': 
                        SocketController.typingDialog(this.props.userId, this.props.user._id)
                        break;
                    default:
                        break;
                }
                
                setTimeout(() => {
                    this.setState({canTyping: true})
                }, 2500)
            }
        }

        if(!this.state.isEdit) {
            let drafts = {...JSON.parse(localStorage.getItem('drafts'))}
            drafts['draft-'+this.props.dialogId] = newText
            if(!drafts['draft-'+this.props.dialogId] || !/\S/.test(drafts['draft-'+this.props.dialogId]))
                delete drafts['draft-'+this.props.dialogId]
            localStorage.setItem('drafts', JSON.stringify(drafts));
        }
    }

    render() {
        return (
        <>
            <div className="dialog-container" ref={this.dropRef}>
                {this.state.drag &&
                    <div className="drag-and-drop-container">
                        <div className="data-empty">
                            <InsertDriveFileOutlinedIcon style={{color: '#B8C3CF', fontSize: 54, margin: '0 auto', display: 'block'}} />

                            <p>Drag & drop files here to attach</p>
                        </div>
                    </div>
                }

                <Dialog 
                    loadMessages={() => {this.loadMessages()}}
                    retrySendMessage={(message) => {this.retrySendMessage(message)}}
                    deleteLocalMessage={(_id) => {this.deleteLocalMessage(_id)}}
                    messages={this.props.messages}
                    to={this.props.to}
                    dialog={this.props.dialog}
                    userName={this.props.userName}
                    typing={this.props.typing}
                    loading={this.props.loading}
                    type={this.props.type}
                    unRead={this.props.messages.filter(x => !x.isRead && x.user._id !== this.props.user._id)}
                    recentMessages={this.state.recentMessages}
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
                    images={this.state.images} 
                    sounds={this.state.sounds} 
                    files={this.state.files} 
                    attachedRecentMessages={this.state.attachedRecentMessages} 
                    sendMessage={(text) => {this.sendMessage(text)}}
                    typing={(newText, prevText) => {this.typing(newText, prevText)}}
                    addFile={(e, paste) => {this.addFile(e, paste)}} 
                    setLastEditMessage={() => {this.setLastEditMessage()}}
                />

                {!!this.state.recentMessages.length && 
                    <ToolbarMessage 
                        addAttachmentRecentMessage={() => {this.addAttachmentRecentMessage()}}
                        cancelAttachmentRecentMessage={() => {this.cancelAttachmentRecentMessage()}}
                        addAttachmentForwardMessage={() => {this.addAttachmentForwardMessage()}} 
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
        rooms: state.rooms,
        dialogs: state.dialogs
    }
}

function mapDispatchToProps(dispatch) {
    return {
        roomsActions: bindActionCreators(roomsActions, dispatch),
        dialogsActions: bindActionCreators(dialogsActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Chat)