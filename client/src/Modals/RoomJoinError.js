// App
import React from 'react'
import Modal from 'react-modal';

// Redux
import { connect } from 'react-redux'
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import { withRouter } from 'react-router-dom';

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
            <ErrorOutlineIcon style={{color: '#FF3333', fontSize: 60}} />
            <h2 className="modal-title">Error</h2>
            <p className="modal-text">{this.props.rooms.activeRoom.error.msg}</p>
            <button className="button-blue" type="submit" style={{width: 'max-content'}} onClick={() => {
                this.props.history.push('/rooms')
            }}>Back</button>
        </Modal>
    }
}

const mapStateToProps = state => {
    return {
        rooms: state.rooms
    }
}

export default connect(mapStateToProps)(withRouter(RoomJoinError))