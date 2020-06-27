// App
import React from 'react'
import Modal from 'react-modal';

// Material
import { withStyles } from '@material-ui/core/styles';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';

// Redux
import { connect } from 'react-redux'
import * as callActions from '../Redux/actions/call'
import { bindActionCreators } from 'redux'

import { withRouter } from 'react-router-dom';
import Avatar from '../Partials/User/Avatar';
import Fab from '@material-ui/core/Fab';
import CallIcon from '@material-ui/icons/Call';
import CallEndIcon from '@material-ui/icons/CallEnd';
import MicOffIcon from '@material-ui/icons/MicOff';
import WebRtcController from '../Controllers/WebRtcController'
import MusicOffIcon from '@material-ui/icons/MusicOff';
import VideocamOutlinedIcon from '@material-ui/icons/VideocamOutlined';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import { withLang } from 'react-multi-language';
import languages from '../languages';

const fabCallStyles = theme => ({
    root: {
        backgroundColor: '#25D441',
        color: '#fff',
        zIndex: 2,
        width: 40,
        height: 40,
        boxShadow: 'none!important',
        margin: '0 9px',
        '&:hover': {
            backgroundColor: '#25D441',
            boxShadow: 'none',
        }
    }
})
const fabRejectStyles = theme => ({
    root: {
        backgroundColor: '#FF4444',
        color: '#fff',
        zIndex: 2,
        width: 40,
        height: 40,
        boxShadow: 'none!important',
        margin: '0 9px',
        '&:hover': {
            backgroundColor: '#FF4444',
            boxShadow: 'none',
        }
    }
})

const CallFab = withStyles(fabCallStyles)(Fab);
const RejectFab = withStyles(fabRejectStyles)(Fab);

const fabStyles = theme => ({
    root: {
        backgroundColor: '#EDF0F3',
        color: '#008FF7',
        zIndex: 2,
        margin: '0 9px!important',
        '&:hover': {
            backgroundColor: '#EDF0F3',
        }
    }
})

const CustomFab = withStyles(fabStyles)(Fab);

const customStylesModal = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        zIndex: 4
    },
    content : {
        top                   : '50%',
        left                  : '50%',
        right                 : 'auto',
        bottom                : 'auto',
        minWidth              : '260px',
        marginRight           : '-50%',
        transform             : 'translate(-50%, -50%)',
        borderRadius          : '10px',
        boxShadow             : '0px 5px 30px rgba(0, 0, 0, 0.16)',
        display               : 'flex',
        justifyContent        : 'center',
        flexWrap              : 'wrap',
        width                 : 'max-content',
        maxWidth              : '260px',
        padding               : '20px 0'
    }
};

const customStylesModalActive = {
    overlay: {
        position: 'fixed',
        width: 'max-content',
        height: 'max-content',
        top: 70,
        left: 'unset',
        right: 40,
        zIndex: 4
    },
    content : {
        border: 'none',
        minWidth              : '320px',
        height: 'max-content',
        borderRadius          : '10px',
        boxShadow             : '0px 5px 30px rgba(0, 0, 0, 0.16)',
        display               : 'flex',
        justifyContent        : 'center',
        flexWrap              : 'wrap',
        width                 : 'max-content',
        maxWidth              : '260px',
        padding               : '20px 0',
        position: 'unset'
    }
};

const customStylesModalActiveFullScreen = {
    overlay: {
        position: 'fixed',
        width: '100%',
        height: '100vh',
        top: 0,
        left: 0,
        zIndex: 4
    },
    content : {
        border: 'none',
        minWidth              : '100%',
        height: '100vh',
        borderRadius          : '10px',
        boxShadow             : '0px 5px 30px rgba(0, 0, 0, 0.16)',
        display               : 'flex',
        justifyContent        : 'center',
        flexWrap              : 'wrap',
        width                 : 'max-content',
        maxWidth              : '260px',
        padding               : '20px 0',
        position: 'unset',
        alignItems: 'center',
        justifyContent: 'center',
        justifyItems: 'center',
        alignContent: 'center',
    }
};

class MediaStream extends React.PureComponent {
    componentDidMount() {
        this.audio.srcObject = this.props.stream
        if(this.props.media === 'video')
            this.video.srcObject = this.props.stream
    }

    render() {
        return <>
            <audio ref={ref => {this.audio = ref}} style={{display: 'none'}} autoPlay controls></audio>
            {this.props.media === 'video' && <video className="other-video" ref={ref => {this.video = ref}} autoPlay muted></video>}
        </>
    }
}

class CreateDialog extends React.Component {
    state = {
        fullScreen: false
    }
    render() {
        return <Modal
            isOpen={this.props.isOpen}
            onRequestClose={() => {
                if(this.props.call.status !== 'outcoming' && this.props.call.status !== 'incoming') {
                    this.props.callActions.clear()
                }
            }}
            style={this.props.call.status === 'active' ? this.state.fullScreen ? customStylesModalActiveFullScreen : customStylesModalActive : customStylesModal}
            contentLabel="Call"
            overlayClassName="call-modal"
        >
            {this.props.call.remoteStream && <MediaStream media={this.props.call.media} key={this.props.call.remoteStream.id+this.props.call.media} stream={this.props.call.remoteStream} />}
            {this.props.call.status !== 'exist' && <>
                {(this.props.call.status === 'outcoming' || this.props.call.status === 'busy' || this.props.call.status === 'canceled') && <h2 style={{width: '100%'}} className="modal-title">{this.props.langProps.outcoming_call}</h2>}
                {this.props.call.status === 'incoming' && <h2 style={{width: '100%'}} className="modal-title">{this.props.langProps.incoming_call}</h2>}

                {this.props.call.media === 'audio' && <>
                    <Avatar 
                        style={{width: 80, height: 80, fontSize: 28, lineHeight: '28px', fontWeight: 600, backgroundColor: `rgb(${this.props.call.user.color})`}} 
                        name={this.props.call.user.name.first.charAt(0)+this.props.call.user.name.last.charAt(0)}
                        avatar={this.props.call.user.avatar ? this.props.call.user.avatar : false}
                    />

                    <p className="user-profile-name">{this.props.call.user.name.first} {this.props.call.user.name.last}</p>
                    <p className="user-profile-city">{this.props.call.user.city ? this.props.call.user.city : this.props.langProps.not_indicated}</p>
                </>}

                {this.props.call.media === 'video' && <>
                    <div style={{height: this.state.fullScreen ? 'calc(100% - 80px)' : 200, width: '100%'}}></div>
                </>}

                {this.props.call.status !== 'busy' && this.props.call.status !== 'canceled' && <div style={{width: '100%', textAlign: 'center', marginTop: 20, marginBottom: 20}}>
                    {this.props.call.status === 'active' && <>
                        <CustomFab className={`media-option ${this.props.media.micOn ? '' : 'active'}`} onClick={() => {WebRtcController.toggleMicrophone()}}>
                            <MicOffIcon style={{color: this.props.media.micOn ? '#008FF7' : '#fff'}} />
                        </CustomFab>
                        <CustomFab className={`media-option ${this.props.media.musicOn ? '' : 'active'}`} onClick={() => {WebRtcController.toggleMusic()}}>
                            <MusicOffIcon style={{color: this.props.media.musicOn ? '#008FF7' : '#fff'}} />
                        </CustomFab>
                        <CustomFab className={`media-option ${this.props.media.cameraOn ? 'active' : ''}`} onClick={() => {WebRtcController.callToggleCamera()}}>
                            <VideocamOutlinedIcon style={{color: this.props.media.cameraOn ? '#fff' : '#008FF7'}} />
                        </CustomFab>
                        <CustomFab className={`media-option ${this.state.fullScreen ? 'active' : ''}`} onClick={() => {this.setState({fullScreen: !this.state.fullScreen})}}>
                            {!this.state.fullScreen && <FullscreenIcon style={{color: '#008FF7'}} />}
                            {this.state.fullScreen && <FullscreenExitIcon style={{color: '#fff'}} />}
                        </CustomFab>
                    </>}

                    {this.props.call.status === 'incoming' && <CallFab color="primary" size="small" aria-label="call" onClick={() => {
                        this.props.callActions.accept(this.props.user.apiToken)
                    }}>
                        <CallIcon style={{color: '#fff'}} />
                    </CallFab>}

                    <RejectFab color="primary" size="small" aria-label="call" onClick={() => {
                        this.props.callActions.stop(this.props.call.user, this.props.user.apiToken)
                    }}>
                        <CallEndIcon style={{color: '#fff'}} />
                    </RejectFab>
                </div>}

                {this.props.call.status === 'busy' && <div style={{width: '100%', textAlign: 'center', marginTop: 20, marginBottom: 20, color: '#999999', fontSize: 14}}>
                    The line is busy... <br></br><a style={{color: '#008FF7', cursor: 'pointer'}} onClick={() => {this.props.callActions.clear()}}>Close</a>
                </div>}

                {this.props.call.status === 'canceled' && <div style={{width: '100%', textAlign: 'center', marginTop: 20, marginBottom: 20, color: '#999999', fontSize: 14}}>
                    {this.props.call.user.name.first} canceled your call <br></br><a style={{color: '#008FF7', cursor: 'pointer'}} onClick={() => {this.props.callActions.clear()}}>Close</a>
                </div>}
            </>}
            {this.props.call.status === 'exist' && <>
                <ErrorOutlineIcon style={{color: '#FF3333', fontSize: 60}} />
                <h2 className="modal-title" style={{width: '100%'}}>Error</h2>
                <p className="modal-text" style={{width: '100%', textAlign: 'center'}}>have_active_call</p>
            </>}
        </Modal>
    }
}

const mapStateToProps = state => {
    return {
        user: state.user,
        call: state.call,
        media: state.media
    }
}

function mapDispatchToProps(dispatch) {
    return {
        callActions: bindActionCreators(callActions, dispatch),
    }
}

export default withLang(languages)(connect(mapStateToProps, mapDispatchToProps)(withRouter(CreateDialog)))