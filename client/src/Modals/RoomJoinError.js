// App
import React from 'react'
import Modal from 'react-modal';

// Redux
import { connect } from 'react-redux'
import * as roomsActions from '../Redux/actions/rooms'
import { bindActionCreators } from 'redux'

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
        marginRight           : '-50%',
        transform             : 'translate(-50%, -50%)',
        borderRadius          : '10px',
        boxShadow             : '0px 5px 30px rgba(0, 0, 0, 0.16)'
    }
};

class RoomJoinError extends React.Component {
    render() {
        return <Modal
            isOpen={this.props.isOpen}
            style={customStylesModal}
            contentLabel="Create room"
        >
            <h2 className="modal-title">{this.props.rooms.activeRoom.error.msg}</h2>
        </Modal>
    }
}

const mapStateToProps = state => {
    return {
        rooms: state.rooms
    }
}

export default connect(mapStateToProps)(RoomJoinError)