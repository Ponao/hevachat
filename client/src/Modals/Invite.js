// App
import React from 'react'
import Modal from 'react-modal';

// Redux
import { connect } from 'react-redux'
import * as roomsActions from '../Redux/actions/rooms'
import { bindActionCreators } from 'redux'
import {urlApi} from '../config'

import Friends from './contactsPartials/Friends';
import { withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
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
    state = {
        selectUsers: [],
        error: false,
        errors: []
    }

    onSubmit(e) {
        e.preventDefault()

        fetch(`${urlApi}/api/room/invite`, {
            method: "post",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.props.user.apiToken}`,
            },
            body: JSON.stringify({
                id: this.props.rooms.activeRoom._id,
                selectUsers: this.state.selectUsers
            })
        })
        .then(response => response.json())
        .then(({error}) => {
            this.setState({selectUsers: []})
            toast("Invited sents!", {
                position: toast.POSITION.TOP_CENTER,
            });
            if(error) {
                toast("Вы уже приглашали некоторых пользователей", {
                    position: toast.POSITION.TOP_CENTER,
                });
            }
            this.props.close()
        });
    }
    
    render() {
        return <Modal
            isOpen={this.props.isOpen}
            onRequestClose={() => {this.props.close()}}
            style={customStylesModalInvite}
            contentLabel="Create room"
        >
            <h2 className="modal-title">{this.props.langProps.select_users}</h2>

            <form style={{display: 'contents'}} onSubmit={(e) => {this.onSubmit(e)}}>
                <Friends onClick={(id) => {
                    if(!this.state.selectUsers.find(x => x === id))
                        this.setState({selectUsers: [id, ...this.state.selectUsers]})
                    else 
                        this.setState({selectUsers: [...this.state.selectUsers.filter(x => x !== id)]})
                }} type={'select'} selectUsers={this.state.selectUsers} />

                {!this.state.selectUsers.length && <button className="button-gray" onClick={() => {this.props.close()}} style={{width: 'max-content', marginTop: 5}}>{this.props.langProps.back}</button>}
                {!!this.state.selectUsers.length && <button className="button-blue" type="submit" style={{width: 'max-content', marginTop: 5}}>{this.props.langProps.invite}</button>}
            </form>
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