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
import { withStyles, Tooltip, CircularProgress } from '@material-ui/core'
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

function declension(n, text_forms) {  
    n = Math.abs(n) % 100; var n1 = n % 10;
    if (n > 10 && n < 20) { return text_forms[2]; }
    if (n1 > 1 && n1 < 5) { return text_forms[1]; }
    if (n1 == 1) { return text_forms[0]; }
    return text_forms[2];
}

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

const Member = withRouter(class Member extends React.Component {
    div = React.createRef();

    state = {
        height: 0
    }

    componentDidMount() {
        this.setState({
            height: this.div.current.clientWidth
        })

        window.addEventListener('resize', this.resize.bind(this))
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resize.bind(this))
    }

    resize() {
        this.setState({
            height: this.div.current.clientWidth
        })
    }

    render() {
        return <div ref={this.div} style={{cursor: 'pointer', height: this.state.height}} className="member col-6 col-sm-6 col-md-6 col-lg-4 col-xl-3" onClick={() => {
            this.props.history.push({
                search: `?user=${this.props.user._id}`
            })
        }}>
            <Avatar avatarStyle={{borderRadius: 0}} avatar={this.props.user.avatar ? this.props.user.avatar : false} name={this.props.user.name.first.charAt(0)+this.props.user.name.last.charAt(0)} style={{fontSize: 30, borderRadius: 0, width: '100%', height: '100%', backgroundColor: `rgb(${this.props.user.color})`}}  />
            {this.props.user.speaking && <span className="speaking"></span>}
            <span className="user-name">{this.props.user.name.first} {this.props.user.name.last}</span>
        </div>
    }
})

const Members = withRouter((props) => {
    return <Scrollbars
        renderTrackVertical={() => <div className="track-vertical"/>}
        renderThumbVertical={() => <div className="thumb-vertical"/>}
        className="theme-members scroll"
        autoHide
    >
        {props.users.map((user, index) => 
            <Member key={index} user={user} />
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
        if(!this.props.rooms.activeRoom) {
            return <CircularProgress style={{
                color: '#008FF7',
                position: 'absolute',
                left: 0,
                right: 0,
                margin: 'auto',
                top: 'calc(50% - 20px)'
            }} />
        }

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
                

                <div style={{paddingTop: Math.ceil(this.props.user.leftDays) < 8 && Math.ceil(this.props.user.leftDays) !== 0 ? 30 : 0}} className={`col-xl-9 col-lg-6 col-md-6 theme-screen ${this.state.act === 'chat' ? 'hide' : 'active'}`}>
                    {Math.ceil(this.props.user.leftDays) < 8 && Math.ceil(this.props.user.leftDays) !== 0 && <div className='left-days' onClick={() => {
                        this.props.history.push('/payment')
                    }}>
                        {this.props.langProps.you_have_left} {Math.ceil(this.props.user.leftDays)} {declension(Math.ceil(this.props.user.leftDays), [this.props.langProps.day_1, this.props.langProps.day_2, this.props.langProps.day_5])} {this.props.langProps.until_the_end}
                    </div>}
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