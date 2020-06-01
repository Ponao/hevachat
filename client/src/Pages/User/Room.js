// App
import React from 'react'
import {PageSettings} from '../PageSettings'
import { Scrollbars } from 'react-custom-scrollbars';

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

import MicIcon from '@material-ui/icons/Mic';
import Fab from '@material-ui/core/Fab';
import { withStyles } from '@material-ui/core'
import WebRtcController from '../../Controllers/WebRtcController'
import MusicOffIcon from '@material-ui/icons/MusicOff';
import CallEndIcon from '@material-ui/icons/CallEnd';
import { randomInteger } from '../../Controllers/FunctionsController'
import Avatar from '../../Partials/User/Avatar';

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

class Members extends React.Component {
    render() {
        return <Scrollbars
            renderTrackVertical={props => <div className="track-vertical"/>}
            renderThumbVertical={props => <div className="thumb-vertical"/>}
            className="theme-members scroll"
            autoHide
        >
            {this.props.users.map((user, index) => 
                <div key={index} className="member">
                    <Avatar name={user.name.first.charAt(0)+user.name.last.charAt(0)} style={{fontSize: 30, borderRadius: 0, width: '100%', height: '100%', backgroundColor: `rgb(${user.color})`}}  />
                    {user.speaking && <span className="speaking"></span>}
                </div>
            )}
        </Scrollbars>
    }
}

class MediaStream extends React.PureComponent {
    componentDidMount() {
        this.audio.srcObject = this.props.stream
    }

    render() {
        return <audio ref={ref => {this.audio = ref}} style={{display: 'none'}} autoPlay></audio>
    }
}

class Room extends React.Component {
    static contextType = PageSettings;

    componentDidMount() {
        this.context.toggleHeader(false)

        this.props.roomsActions.joinRoom({id: this.props.match.params.id, apiToken: this.props.user.apiToken})
    }

    componentWillUnmount() {
        this.props.roomsActions.leaveRoom(this.props.rooms.activeRoom._id, this.props.rooms.activeRoom.lang)
    }

    render() {
        if(this.props.rooms.activeRoom && this.props.rooms.activeRoom.error) {
            return <RoomJoinError isOpen={true} />
        }

        return this.props.rooms.activeRoom && (
            <>  
                {this.props.rooms.activeRoom.remoteStream && <MediaStream stream={this.props.rooms.activeRoom.remoteStream} />}
                <div className="col-xl-3 col-lg-6 col-md-6">
                    <div className="theme-header">
                        <IconButton className="back-btn" onClick={() => {
                            this.props.history.push('/')
                        }}>
                            <ArrowBackIcon fontSize="small" style={{color: '#008FF7'}} />
                        </IconButton>
                        
                        <div className="theme-info">
                            <h2 className="theme-title">{this.props.rooms.activeRoom.title}</h2>
                            <h3 className="theme-online-counter">{this.props.rooms.activeRoom.users.length + 1} online</h3>
                        </div>
                    </div>


                    <div className="theme-sidebar">
                        <Chat messages={this.props.rooms.activeRoom.dialog.messages} type="room" to={this.props.rooms.activeRoom.title} dialogId={this.props.rooms.activeRoom.dialog._id} roomId={this.props.rooms.activeRoom._id} />
                    </div>
                </div>
                

                <div className="col-xl-9 col-lg-6 col-md-6 theme-screen">
                    {this.props.rooms.activeRoom && <Members users={this.props.rooms.activeRoom.users} />}

                    <div className="media-options">
                        <CustomFab className={`media-option ${this.props.media.micOn ? 'active' : ''}`} onClick={() => {WebRtcController.toggleMicrophone()}}>
                            <MicIcon style={{color: this.props.media.micOn ? '#fff' : '#008FF7'}} />
                        </CustomFab>
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

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Room))