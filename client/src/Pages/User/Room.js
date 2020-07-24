// App
import React from 'react'
import {PageSettings} from '../PageSettings'
import { Scrollbars } from 'react-custom-scrollbars';
import qs from 'qs'

// Redux
import { connect } from 'react-redux'
import * as roomsActions from '../../Redux/actions/rooms'
import { bindActionCreators } from 'redux'

// Material
import { withRouter } from 'react-router-dom'
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Chat from '../../Partials/Chat/Chat'
import RoomJoinError from '../../Modals/RoomJoinError'
import IconButton from '@material-ui/core/IconButton';
import MicOffIcon from '@material-ui/icons/MicOff';

import MicIcon from '@material-ui/icons/Mic';
import Fab from '@material-ui/core/Fab';
import { withStyles, Tooltip } from '@material-ui/core'
import WebRtcController from '../../Controllers/WebRtcController'
import SocketController from '../../Controllers/SocketController'
import MusicOffIcon from '@material-ui/icons/MusicOff';
import CallEndIcon from '@material-ui/icons/CallEnd';
import Avatar from '../../Partials/User/Avatar';
import ActionMenu from '../../Partials/ActionMenu';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { withLang } from 'react-multi-language';
import languages from '../../languages';
import ChatBubbleOutlineIcon from '@material-ui/icons/ChatBubbleOutline';

const fabStyles = theme => ({
    root: {
        backgroundColor: '#fff',
        color: '#008FF7',
        zIndex: 2,
        '&:hover': {
            backgroundColor: '#fff',
        }
    }
})

const CustomFab = withStyles(fabStyles)(Fab);

const fabStylesCustom = theme => ({
    root: {
        backgroundColor: '#fff',
        color: '#008FF7',
        zIndex: 2,
        minWidth: 36,
        height: 36,
        boxShadow: 'none!important',
        marginLeft: 'auto',
        marginRight: '14px',
        '&:hover': {
            backgroundColor: '#fff',
            boxShadow: 'none',
        }
    }
})

const CustomFab2 = withStyles(fabStylesCustom)(Fab);

const Members = withRouter((props) => {
    return <Scrollbars
        renderTrackVertical={() => <div className="track-vertical"/>}
        renderThumbVertical={() => <div className="thumb-vertical"/>}
        className="theme-members scroll"
        autoHide
    >
        {props.users.map((user, index) => 
            <div key={index} style={{cursor: 'pointer'}} className="member col-6 col-sm-6 col-md-6 col-lg-4 col-xl-3" onClick={() => {
                props.history.push({
                    search: `?user=${user._id}`
                })
            }}>
                <Avatar avatarStyle={{borderRadius: 0}} avatar={user.avatar ? user.avatar : false} name={user.name.first.charAt(0)+user.name.last.charAt(0)} style={{fontSize: 30, borderRadius: 0, width: '100%', height: '100%', backgroundColor: `rgb(${user.color})`}}  />
                {user.speaking && <span className="speaking"></span>}
                <span className="user-name">{user.name.first} {user.name.last}</span>
            </div>
        )}
    </Scrollbars>
})

class MediaStream extends React.PureComponent {
    componentDidMount() {
        this.audio.srcObject = this.props.stream
    }

    render() {
        return <audio ref={ref => {this.audio = ref}} style={{display: 'none'}} autoPlay controls></audio>
    }
}

class Room extends React.Component {
    static contextType = PageSettings;

    state = {
        act: qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).act,
    }

    componentDidMount() {
        this.context.toggleHeader(false)

        let waitSocket = setInterval(() => {
            if(SocketController.getSocketId()) {
                this.props.roomsActions.joinRoom({id: this.props.match.params.id, apiToken: this.props.user.apiToken})
                clearInterval(waitSocket)
            }
        }, 100);
        
        this.props.history.listen((location) => {
            this.setState({
                act: qs.parse(location.search, { ignoreQueryPrefix: true }).act,
            })
        })
    }

    componentWillUnmount() {
        if(!!this.props.rooms.activeRoom)
            this.props.roomsActions.leaveRoom(this.props.rooms.activeRoom._id, this.props.rooms.activeRoom.lang)
    }

    render() {
        if(this.props.rooms.activeRoom && this.props.rooms.activeRoom.error) {
            return <RoomJoinError isOpen={true} />
        }

        return this.props.rooms.activeRoom && (
            <>  
                {this.props.rooms.activeRoom.remoteStream && <MediaStream stream={this.props.rooms.activeRoom.remoteStream} />}
                <div className={`col-xl-3 col-lg-6 col-md-6 theme-first-block ${this.state.act === 'chat' ? 'active' : 'hide'}`}>
                    <div className="theme-header">
                        <IconButton className="back-btn" onClick={() => {
                            if(this.state.act === 'chat') {
                                this.props.history.push({
                                    search: ``
                                })
                            } else {
                                this.props.history.push('/')
                            }                           
                        }}>
                            <ArrowBackIcon fontSize="small" style={{color: '#008FF7'}} />
                        </IconButton>
                        
                        <div className="theme-info">
                            <h2 className="theme-title">{this.props.rooms.activeRoom.title}</h2>
                            <h3 className="theme-online-counter">{this.props.rooms.activeRoom.users.length + 1} {this.props.langProps.online}</h3>
                        </div>

                        <CustomFab2 id={'dialog-more-actions-'+this.props.rooms.activeRoom._id} color="primary" size="small" aria-label="more">
                            <MoreVertIcon style={{color: '#008FF7'}} />
                        </CustomFab2>
                        <ActionMenu event="click" bottom={true} right={true} actions={
                        this.props.rooms.activeRoom.ownerId === this.props.user._id || this.props.user.role === 'admin' || this.props.user.role === 'moder' ? [
                            {text: this.props.langProps.invite_friends, action: () => {
                                this.props.history.push({
                                    search: '?act=invite'
                                })
                            }},
                            {text: this.props.langProps.show_investments, action: () => {
                                this.props.history.push({
                                    search: `?modal=investments`
                                })
                            }},
                            {
                                text: this.props.langProps.edit_room,
                                action: () => {
                                    this.props.history.push({
                                        search: '?act=editRoom'
                                    })
                                }
                            },
                            {
                                text: this.props.langProps.delete_room,
                                action: () => {
                                    this.props.history.push({
                                        search: '?act=deleteRoom'
                                    })
                                }
                            }
                        ] : [
                            {
                                text: this.props.langProps.invite_friends, action: () => {
                                    this.props.history.push({
                                        search: '?act=invite'
                                    })
                                }
                            },
                            {text: this.props.langProps.show_investments, action: () => {
                                this.props.history.push({
                                    search: `?modal=investments`
                                })
                            }}
                        ]} from={'dialog-more-actions-'+this.props.rooms.activeRoom._id} />
                    </div>


                    <div className="theme-sidebar">
                        <Chat 
                        messages={this.props.rooms.activeRoom.dialog.messages} 
                        type="room" 
                        to={this.props.rooms.activeRoom.title} 
                        dialogId={this.props.rooms.activeRoom.dialog._id} 
                        roomId={this.props.rooms.activeRoom._id} />
                    </div>
                </div>
                

                <div className={`col-xl-9 col-lg-6 col-md-6 theme-screen ${this.state.act === 'chat' ? 'hide' : 'active'}`}>
                    {this.props.rooms.activeRoom && <Members users={this.props.rooms.activeRoom.users} />}

                    <div className="media-options">
                        <CustomFab className={`media-option mobile-option`} onClick={() => {this.props.history.push({
                            search: `?act=chat`
                        })}}>
                            {!!this.props.rooms.activeRoom.dialog.messages.filter(x => !x.isRead && x.user._id !== this.props.user._id).length && <span style={{right: 0}} className="unread-messages-count">{this.props.rooms.activeRoom.dialog.messages.filter(x => !x.isRead && x.user._id !== this.props.user._id).length}</span>}
                            <ChatBubbleOutlineIcon style={{color: this.props.media.musicOn ? '#008FF7' : '#fff'}} />
                        </CustomFab>
                        {!!this.props.rooms.activeRoom.muted && <Tooltip title={`Blocked to ${new Date(this.props.rooms.activeRoom.muted.date).toLocaleString()}`} placement="top"><CustomFab className={`media-option reject`}>
                            <MicOffIcon style={{color: '#fff'}} />
                        </CustomFab></Tooltip>}
                        {!this.props.rooms.activeRoom.muted && <CustomFab className={`media-option ${this.props.media.micOn ? 'active' : ''}`} onClick={() => {WebRtcController.toggleMicrophone()}}>
                            <MicIcon style={{color: this.props.media.micOn ? '#fff' : '#008FF7'}} />
                        </CustomFab>}
                        <CustomFab className={`media-option ${this.props.media.musicOn ? '' : 'active'}`} onClick={() => {WebRtcController.toggleMusic()}}>
                            <MusicOffIcon style={{color: this.props.media.musicOn ? '#008FF7' : '#fff'}} />
                        </CustomFab>
                        <CustomFab className={`media-option reject`} onClick={() => {this.props.history.push('/')}}>
                            <CallEndIcon style={{color: '#fff'}} />
                        </CustomFab>
                    </div>
                </div>
            </>
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.user,
        rooms: state.rooms,
        media: state.media
    }
}

function mapDispatchToProps(dispatch) {
    return {
        roomsActions: bindActionCreators(roomsActions, dispatch),
    }
}

export default withLang(languages)(connect(mapStateToProps, mapDispatchToProps)(withRouter(Room)))