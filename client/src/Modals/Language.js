// App
import React from 'react'
import Modal from 'react-modal';

// Material

// Redux
import { connect } from 'react-redux'
import * as usersActions from '../Redux/actions/users'
import { bindActionCreators } from 'redux'
import { withCookies } from 'react-cookie'

import { withRouter } from 'react-router-dom';
import ActionMenu from '../Partials/ActionMenu';
import store from '../Redux/store';
import { USER_SET_LANG } from '../Redux/constants';
import { urlApi } from '../config';
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

class Settings extends React.Component {
    setLang(lang) {
        store.dispatch({
            type: USER_SET_LANG,
            payload: lang
        })

        fetch(`${urlApi}/api/user/set-lang`, {
            method: "post",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.props.user.apiToken}`,
            },
            body: JSON.stringify({
                lang
            })
        })
    }

    render() {
        return <Modal
            isOpen={this.props.isOpen}
            onRequestClose={() => {this.props.close()}}
            style={customStylesModal}
            contentLabel="Contacts"
        >
            <h2 className="modal-title">{this.props.langProps.select_language}</h2>

            <p className={`settings-item ${this.props.user.lang === 'en' ? 'active' : ''}`} onClick={() => {
                if(this.props.user.lang !== 'en')
                this.setLang('en')
            }}>{this.props.langProps.english}</p>
            <p className={`settings-item ${this.props.user.lang === 'ru' ? 'active' : ''}`} onClick={() => {
                if(this.props.user.lang !== 'ru')
                this.setLang('ru')
            }}>{this.props.langProps.russian}</p>
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

export default withLang(languages)(connect(mapStateToProps, mapDispatchToProps)(withRouter(withCookies(Settings))))