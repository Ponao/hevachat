// App
import React from 'react'
import Modal from 'react-modal';

// Redux
import { connect } from 'react-redux'
import {urlApi} from '../config'

import { withRouter } from 'react-router-dom';
import { withLang } from 'react-multi-language';
import languages from '../languages';

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
        fetch(`${urlApi}/api/room/delete`, {
            method: "post",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.props.user.apiToken}`,
            },
            body: JSON.stringify({
                id: this.props.rooms.activeRoom._id
            })
        })
        .then(() => {
            this.props.close()
        });
    }
    
    render() {
        return <Modal
            isOpen={this.props.isOpen}
            onRequestClose={() => {this.props.close()}}
            style={customStylesModalCreate}
            contentLabel="Delete room"
        >
            <h2 className="modal-title" style={{width: '100%'}}>{this.props.langProps.you_sure}</h2>
            
            <button className="button-blue" onClick={() => {this.props.close()}} style={{width: 'max-content', marginTop: 5}}>{this.props.langProps.back}</button>
            <button className="button-gray" onClick={() => {this.onSubmit()}} style={{width: 'max-content', marginTop: 5}}>{this.props.langProps.delete}</button>
        </Modal>
    }
}

const mapStateToProps = state => {
    return {
        user: state.user,
        rooms: state.rooms
    }
}

export default withLang(languages)(connect(mapStateToProps)(withRouter(DeleteRoom)))