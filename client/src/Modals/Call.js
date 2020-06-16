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

class CreateDialog extends React.Component {
    render() {
        return <Modal
            isOpen={this.props.isOpen}
            onRequestClose={() => {
                if(this.props.call.status !== 'outcoming' && this.props.call.status !== 'incoming') {
                    this.props.callActions.clear()
                }
            }}
            style={customStylesModal}
            contentLabel="Call"
        >
            {this.props.call.status !== 'exist' && <>
                {(this.props.call.status === 'outcoming' || this.props.call.status === 'busy' || this.props.call.status === 'canceled') && <h2 style={{width: '100%'}} className="modal-title">Outcoming call</h2>}
                {this.props.call.status === 'incoming' && <h2 style={{width: '100%'}} className="modal-title">Incoming call</h2>}

                <Avatar 
                    style={{width: 80, height: 80, fontSize: 28, lineHeight: '28px', fontWeight: 600, backgroundColor: `rgb(${this.props.call.user.color})`}} 
                    name={this.props.call.user.name.first.charAt(0)+this.props.call.user.name.last.charAt(0)} 
                />

                <p className="user-profile-name">{this.props.call.user.name.first} {this.props.call.user.name.last}</p>
                <p className="user-profile-city">Moscow</p>

                {this.props.call.status !== 'busy' && this.props.call.status !== 'canceled' && <div style={{width: '100%', textAlign: 'center', marginTop: 20, marginBottom: 20}}>
                    {this.props.call.status === 'incoming' && <CallFab color="primary" size="small" aria-label="call" onClick={() => {
                        
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
        call: state.call
    }
}

function mapDispatchToProps(dispatch) {
    return {
        callActions: bindActionCreators(callActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(CreateDialog))