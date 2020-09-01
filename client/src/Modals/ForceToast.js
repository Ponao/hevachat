// App
import React from 'react'
import Modal from 'react-modal';

// Redux
import { connect } from 'react-redux'

import { withRouter } from 'react-router-dom';
import { withLang } from 'react-multi-language';
import languages from '../languages';
import store from '../Redux/store';
import { CALL_SET_FORCE, TOAST_SET_FORCE } from '../Redux/constants';
import * as callActions from '../Redux/actions/call'
import { bindActionCreators } from 'redux';

const customStylesModalCreate = {
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
        maxWidth              : '300px',
        marginRight           : '-50%',
        transform             : 'translate(-50%, -50%)',
        borderRadius          : '10px',
        boxShadow             : '0px 5px 30px rgba(0, 0, 0, 0.16)',
        display               : 'flex',
        flexWrap              : 'wrap'
    }
};

class DeleteRoom extends React.Component {
    onSubmit() {
        store.dispatch({
            type: TOAST_SET_FORCE,
            payload: {id: false, type: false}
        })
        
        if(this.props.toasts.force.type === 'message')
            this.props.history.push(`/chats/${this.props.toasts.force.id}`)

        if(this.props.toasts.force.type === 'invite') {
            this.props.history.push('/')
            
            setTimeout(() => {
                this.props.history.push(`/rooms/${this.props.toasts.force.id}`)
            }, 100);
        }
    }

    close() {
        store.dispatch({
            type: TOAST_SET_FORCE,
            payload: {id: false, type: false}
        })
    }
    
    render() {
        return <Modal
            isOpen={this.props.isOpen}
            onRequestClose={() => {this.close()}}
            style={customStylesModalCreate}
            contentLabel="Delete room"
        >
            <h2 className="modal-title" style={{width: '100%'}}>{this.props.langProps.you_sure}</h2>
            
            <p>{this.props.langProps.force_toast_text}</p>

            <button className="button-blue" onClick={() => {this.close()}} style={{width: 'max-content', marginTop: 5}}>{this.props.langProps.back}</button>
            <button className="button-gray" onClick={() => {this.onSubmit()}} style={{width: 'max-content', marginTop: 5}}>{this.props.langProps.next}</button>
        </Modal>
    }
}

const mapStateToProps = state => {
    return {
        user: state.user,
        toasts: state.toasts
    }
}

function mapDispatchToProps(dispatch) {
    return {
        callActions: bindActionCreators(callActions, dispatch)
    }
}

export default withLang(languages)(connect(mapStateToProps, mapDispatchToProps)(withRouter(DeleteRoom)))