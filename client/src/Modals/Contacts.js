// App
import React from 'react'
import Modal from 'react-modal';

// Material

// Redux
import { connect } from 'react-redux'
import * as usersActions from '../Redux/actions/users'
import { bindActionCreators } from 'redux'

import { withRouter } from 'react-router-dom';
import Friends from './contactsPartials/Friends';
import Inbox from './contactsPartials/Inbox';
import Outbox from './contactsPartials/Outbox';

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

class Contacts extends React.Component {
    state = {
        activeTab: 'friends'
    }

    render() {
        return <Modal
            isOpen={this.props.isOpen}
            onRequestClose={() => {this.props.close()}}
            style={customStylesModal}
            contentLabel="Contacts"
        >
            <h2 className="modal-title">Contacts</h2>

            <div className="contacts-tabs">
                <span className={this.state.activeTab === 'friends' ? 'active' : ''} onClick={() => {this.setState({activeTab: 'friends'})}}>Friends</span>
                <span className={this.state.activeTab === 'inbox' ? 'active' : ''} onClick={() => {this.setState({activeTab: 'inbox'})}}>Inbox</span>
                <span className={this.state.activeTab === 'outbox' ? 'active' : ''} onClick={() => {this.setState({activeTab: 'outbox'})}}>Outbox</span>
            </div>

            {this.state.activeTab === 'friends' && <Friends />}
            {this.state.activeTab === 'inbox' && <Inbox />}
            {this.state.activeTab === 'outbox' && <Outbox />}
        </Modal>
    }
}

const mapStateToProps = state => {
    return {
        users: state.users,
        user: state.user
    }
}

function mapDispatchToProps(dispatch) {
    return {
        usersActions: bindActionCreators(usersActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Contacts))