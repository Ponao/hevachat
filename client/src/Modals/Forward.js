// App
import React from 'react'
import Modal from 'react-modal';

// Redux
import { connect } from 'react-redux'
import * as roomsActions from '../Redux/actions/rooms'
import { bindActionCreators } from 'redux'

import Friends from './contactsPartials/Friends';
import { withRouter } from 'react-router-dom';
import { withLang } from 'react-multi-language';
import languages from '../languages';

const customStylesModalInvite = {
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
        minWidth              : '300px',
        marginRight           : '-50%',
        transform             : 'translate(-50%, -50%)',
        borderRadius          : '10px',
        boxShadow             : '0px 5px 30px rgba(0, 0, 0, 0.16)',
        display               : 'flex',
        justifyContent        : 'center',
        flexWrap              : 'wrap',
        width                 : 'max-content',
        maxWidth              : '320px',
        padding               : '20px 0'
    }
};

class CreateRoom extends React.Component {
    render() {
        return <Modal
            isOpen={this.props.isOpen}
            onRequestClose={() => {this.props.close()}}
            style={customStylesModalInvite}
            contentLabel="Forward messages"
        >
            <h2 className="modal-title">{this.props.langProps.forward}</h2>

            <Friends onClick={(id) => {
                this.props.history.push(`/chats/${id}`)
            }} />
        </Modal>
    }
}

const mapStateToProps = state => {
    return {
        user: state.user,
        rooms: state.rooms
    }
}

function mapDispatchToProps(dispatch) {
    return {
        roomsActions: bindActionCreators(roomsActions, dispatch),
    }
}

export default withLang(languages)(connect(mapStateToProps, mapDispatchToProps)(withRouter(CreateRoom)))