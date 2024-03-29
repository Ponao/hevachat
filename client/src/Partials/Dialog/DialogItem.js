// App
import React from 'react'

import Avatar from '../User/Avatar'
import { CSSTransitionGroup } from 'react-transition-group';
import '../../Css/Partials/RoomItem.css'
import { NavLink, withRouter } from 'react-router-dom';

// Material
import Button from '@material-ui/core/Button';
import { LastMessageDate } from '../../Controllers/TimeController';
import { connect } from 'react-redux';
import DoneIcon from '@material-ui/icons/Done';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import QueryBuilderIcon from '@material-ui/icons/QueryBuilder';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';

import * as dialogsActions from '../../Redux/actions/dialogs'
import { bindActionCreators } from 'redux'

import ActionMenu from '../ActionMenu'
import { randomInteger } from '../../Controllers/FunctionsController';
import { withLang } from 'react-multi-language';
import languages from '../../languages';

class DialogItem extends React.Component {
    state = {
        randomId: randomInteger(0, 100000)
    }

    render() {
        return (
            <NavLink style={{textDecoration: 'none'}} onClick={(e) => {
                if(`/chats/${this.props.user._id}` === this.props.history.location.pathname)
                    e.preventDefault()
            }} className="dialog-link" to={`/chats/${this.props.user._id}`}>
                <Button className={`dialog-item`}>
                    <Avatar 
                        avatar={this.props.user.avatar ? this.props.user.avatar : false}
                        online={this.props.user.online} 
                        style={{minWidth: 40, maxWidth: 40, height: 40, fontSize: 14, fontWeight: 600, backgroundColor: `rgb(${this.props.user.color})`}} 
                        name={this.props.user.name.first.charAt(0) + this.props.user.name.last.charAt(0)} 
                    />

                    <div style={{
                        flexGrow: 1,
                        minWidth: 0,
                        maxWidth: '100%',
                        paddingRight: 10
                    }}>
                        <p className="user-name"><span>{`${this.props.user.name.first} ${this.props.user.name.last}`}</span></p>
                        {!this.props.typing && <p className="last-message">
                            {this.props.lastMessage.user._id === this.props.myUser._id && <span style={{color: '#999999'}}>{this.props.langProps.you}:&nbsp;</span>}
                            {this.props.lastMessage.text && <span className="content" style={{color: this.props.lastMessage.type === 'call' ? '#008FF7' : null}}>{this.props.lastMessage.type === 'call' ? this.props.langProps[this.props.lastMessage.text] : this.props.lastMessage.text}</span>}
                            
                            {!this.props.lastMessage.text && 
                            this.props.lastMessage.images.length === 1 && 
                                <><span  className="content" style={{color: '#008FF7'}}>Photo</span></>
                            }

                            {!this.props.lastMessage.text && 
                            this.props.lastMessage.images.length > 1 && 
                                <><span  className="content" style={{color: '#008FF7'}}>{this.props.langProps.photos} [{this.props.lastMessage.images.length}]</span></>
                            }

                            {!this.props.lastMessage.text && 
                            !this.props.lastMessage.images.length && 
                            this.props.lastMessage.sounds.length === 1 &&
                                <><span  className="content" style={{color: '#008FF7'}}>Sound</span></>
                            }

                            {!this.props.lastMessage.text && 
                            !this.props.lastMessage.images.length && 
                            this.props.lastMessage.sounds.length > 1 &&
                                <><span className="content" style={{color: '#008FF7'}}>{this.props.langProps.sounds} [{this.props.lastMessage.sounds.length}]</span></>
                            }

                            {!this.props.lastMessage.text && 
                            !this.props.lastMessage.images.length && 
                            !this.props.lastMessage.sounds.length &&
                            this.props.lastMessage.files.length === 1 &&
                                <><span className="content" style={{color: '#008FF7'}}>File</span></>
                            }

                            {!this.props.lastMessage.text && 
                            !this.props.lastMessage.images.length && 
                            !this.props.lastMessage.sounds.length &&
                            this.props.lastMessage.files.length > 1 &&
                                <><span className="content" style={{color: '#008FF7'}}>{this.props.langProps.files} [{this.props.lastMessage.files.length}]</span></>
                            }

                            {!this.props.lastMessage.text && 
                            !this.props.lastMessage.images.length && 
                            !this.props.lastMessage.sounds.length &&
                            !this.props.lastMessage.files.length &&
                            !!this.props.lastMessage.recentMessages.length &&
                                <><span className="content" style={{color: '#008FF7'}}>Attachment messages [{this.props.lastMessage.recentMessages.length}]</span></>
                            }
                        </p>}
                        {this.props.typing && <p className="last-message typing">typing</p>}
                    </div>
                    <div className="dialog-info">
                        <span className="time-at">{LastMessageDate(this.props.lastMessage.createdAt)}</span>
                        <CSSTransitionGroup 
                    transitionName="message-status-transition"
                    transitionEnterTimeout={100}
                    transitionLeaveTimeout={100}>
                        {(this.props.lastMessage.user._id === this.props.myUser._id && !this.props.lastMessage.isError && this.props.lastMessage.isLoading) && <QueryBuilderIcon style={{marginTop: 2, fontSize: 16, color: '#B8C3CF'}} />}
                        {(this.props.lastMessage.user._id === this.props.myUser._id && !this.props.lastMessage.isError && !this.props.lastMessage.isLoading && !this.props.lastMessage.isRead) && <DoneIcon style={{marginTop: 2, fontSize: 16, color: '#B8C3CF'}} />}
                        {(this.props.lastMessage.user._id === this.props.myUser._id && !this.props.lastMessage.isError && !this.props.lastMessage.isLoading && this.props.lastMessage.isRead) && <DoneAllIcon style={{marginTop: 2, fontSize: 16, color: '#008FF7'}} />}
                        {(this.props.lastMessage.user._id !== this.props.myUser._id && !!this.props.noRead) && <span className="unread-messages-count">{this.props.noRead}</span>}
                        {(this.props.lastMessage.user._id !== this.props.myUser._id && !this.props.noRead) && <span style={{height: 18}}></span>}
                        {(this.props.lastMessage.user._id === this.props.myUser._id && !this.props.lastMessage.isLoading && this.props.lastMessage.isError) && <>
                            <ActionMenu event="hover" actions={[
                                {text: 'Retry', action: () => {
                                    let message = this.props.lastMessage
                                    message.userId = this.props.user._id
                                    message.dialogId = this.props.dialogId
                                    this.props.dialogsActions.retrySendMessage(message, this.props.myUser.apiToken)
                                }},
                                {text: 'Delete', action: () => {
                                    this.props.dialogsActions.deleteLocalMessage(this.props.lastMessage._id, this.props.dialogId)
                                }},
                            ]} from={'message-error-actions-'+this.state.randomId} />
                            <ErrorOutlineIcon className='error' id={'message-error-actions-'+this.state.randomId} style={{marginTop: 2, fontSize: 16, color: '#FF3333'}} />
                        </>}
                        </CSSTransitionGroup>
                    </div>
                </Button>
            </NavLink>
        )
    }
}

const mapStateToProps = state => {
    return {
        myUser: state.user,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        dialogsActions: bindActionCreators(dialogsActions, dispatch)
    }
}

export default withLang(languages)(connect(mapStateToProps, mapDispatchToProps)(withRouter(DialogItem)))