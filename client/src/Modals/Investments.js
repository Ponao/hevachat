// App
import React from 'react'
import Modal from 'react-modal';

// Material

// Redux
import { connect } from 'react-redux'
import * as usersActions from '../Redux/actions/users'
import { bindActionCreators } from 'redux'

import { withRouter } from 'react-router-dom';
import Images from './investmentsPartials/Images';
import Sounds from './investmentsPartials/Sounds';
import Files from './investmentsPartials/Files';
import { withLang } from 'react-multi-language';
import languages from '../languages';

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
        activeTab: 'images'
    }

    render() {
        return <Modal
            isOpen={this.props.isOpen}
            onRequestClose={() => {this.props.close()}}
            style={customStylesModal}
            contentLabel="Contacts"
        >
            <h2 className="modal-title">{this.props.langProps.investments}</h2>

            <div className="contacts-tabs">
                <span className={this.state.activeTab === 'images' ? 'active' : ''} onClick={() => {this.setState({activeTab: 'images'})}}>{this.props.langProps.photos}</span>
                <span className={this.state.activeTab === 'sounds' ? 'active' : ''} onClick={() => {this.setState({activeTab: 'sounds'})}}>{this.props.langProps.sounds}</span>
                <span className={this.state.activeTab === 'files' ? 'active' : ''} onClick={() => {this.setState({activeTab: 'files'})}}>{this.props.langProps.files}</span>
            </div>

            {this.state.activeTab === 'images' && <Images />}
            {this.state.activeTab === 'sounds' && <Sounds />}
            {this.state.activeTab === 'files' && <Files />}
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

export default withLang(languages)(connect(mapStateToProps, mapDispatchToProps)(withRouter(Contacts)))