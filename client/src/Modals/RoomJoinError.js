// App
import React from 'react'
import Modal from 'react-modal';

// Redux
import { connect } from 'react-redux'
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import { withRouter, Redirect } from 'react-router-dom';
import { withLang } from 'react-multi-language';
import languages from '../languages';

const customStylesModal = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.25)'
    },
    content : {
        top                   : '50%',
        left                  : '50%',
        right                 : 'auto',
        bottom                : 'auto',
        minWidth              : '300px',
        marginRight           : '-50%',
        transform             : 'translate(-50%, -50%)',
        borderRadius          : '10px',
        boxShadow             : '0px 5px 30px rgba(0, 0, 0, 0.16)',
        textAlign             : 'center'
    }
};

class RoomJoinError extends React.Component {
    render() {
        return <Modal
            isOpen={this.props.isOpen}
            style={customStylesModal}
            contentLabel="Error join room"
        >  
            {this.props.rooms.activeRoom.error.msg === 'dont_have_payment' && <Redirect to="/payment" />}
            <ErrorOutlineIcon style={{color: '#FF3333', fontSize: 60}} />
            <h2 className="modal-title">{this.props.langProps.error}</h2>
            <p className="modal-text" style={{marginBottom: !!this.props.rooms.activeRoom.error.ban ? 0 : ''}}>{this.props.langProps[this.props.rooms.activeRoom.error.msg]}</p>
            {!!this.props.rooms.activeRoom.error.ban && <p className="modal-text">to <span style={{color: '#008FF7'}}>{new Date(this.props.rooms.activeRoom.error.ban.date).toLocaleString()}</span></p>}
            <button className="button-blue" type="submit" style={{width: 'max-content'}} onClick={() => {
                this.props.history.push('/')
            }}>{this.props.langProps.back}</button>
        </Modal>
    }
}

const mapStateToProps = state => {
    return {
        rooms: state.rooms
    }
}

export default withLang(languages)(connect(mapStateToProps)(withRouter(RoomJoinError)))