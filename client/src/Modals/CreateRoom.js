// App
import React from 'react'
import Modal from 'react-modal';

// Material
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { withStyles } from '@material-ui/core/styles';

// Redux
import { connect } from 'react-redux'
import * as roomsActions from '../Redux/actions/rooms'
import { bindActionCreators } from 'redux'
import {urlApi} from '../config'

import SocketController from '../Controllers/SocketController';
import Friends from './contactsPartials/Friends';
import { withRouter } from 'react-router-dom';
import { withLang } from 'react-multi-language';
import languages from '../languages';
import store from '../Redux/store';
import { ROOMS_SET_FORCE } from '../Redux/constants';
import { CircularProgress } from '@material-ui/core';

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
        boxShadow             : '0px 5px 30px rgba(0, 0, 0, 0.16)'
    }
};

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
        minHeight             : '300px',
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

const checkBoxStyles = theme => ({
    root: {
        color: '#CCD1D6',
        '&$checked': {
            color: '#008FF7',
            border: 'none'
        },
        '&:hover': {
            backgroundColor: 'transparent',
        }
    },
    checked: {},
})

const CustomCheckbox = withStyles(checkBoxStyles)(Checkbox);

class CreateRoom extends React.Component {
    state = {
        title: '',
        isPrivate: false,
        step: 'create',
        selectUsers: [],
        error: false,
        errors: [],
        isFetching: false
    }

    onSubmit(e) {
        this.setState({error: false, errors: [], isFetching: true})
        e.preventDefault()

        fetch(`${urlApi}/api/room/create`, {
            method: "post",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.props.user.apiToken}`,
            },
            body: JSON.stringify({
                title: this.state.title,
                isPrivate: this.state.isPrivate,
                lang: this.props.user.roomLang,
                selectUsers: this.state.selectUsers
            })
        })
        .then((response) => response.json())
        .then((room) => {
            if(room.error) {
                this.setState({error: true, errors: room.errors, step: 'create', isFetching: false})
            } else {
                this.props.roomsActions.roomsAdd(room)
                SocketController.createRoom({room, lang: this.props.user.roomLang})

                if(this.props.call.user) {
                    this.props.history.push({
                        search: ""
                    })
                    store.dispatch({
                        type: ROOMS_SET_FORCE,
                        payload: room._id
                    })
                } else {
                    this.props.history.push(`/rooms/${room._id}`)
                }
            }
        });
    }
    
    render() {
        if(this.state.isFetching) {
            return <Modal
                isOpen={this.props.isOpen}
                onRequestClose={() => {this.props.close()}}
                style={customStylesModalInvite}
                contentLabel="Create room"
            >
                <CircularProgress style={{
                    color: '#008FF7',
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    margin: 'auto',
                    top: 'calc(50% - 20px)'
                }} />
            </Modal>
        }

        return <Modal
            isOpen={this.props.isOpen}
            onRequestClose={() => {this.props.close()}}
            style={this.state.step === 'create' ? customStylesModalCreate : customStylesModalInvite}
            contentLabel="Create room"
        >
            {this.state.step === 'create' && <h2 className="modal-title">{this.props.langProps.new_room}</h2>}
            {this.state.step === 'invite' && <h2 className="modal-title">{this.props.langProps.select_users}</h2>}

            <form style={{display: 'contents'}} onSubmit={(e) => {this.onSubmit(e)}}>
                {this.state.step === 'create' && <>
                    <input 
                        value={this.state.title} 
                        onChange={(e) => {this.setState({title: e.target.value})}} 
                        className="input-field" 
                        type="text"
                        style={{marginBottom: 10}} 
                        placeholder={this.props.langProps.title}
                        maxLength={50}
                    />
                    {this.state.errors.find(value => value.param === 'title') && <span className="input-error-label">
                        {this.props.langProps[this.state.errors.find(value => value.param === 'title').msg]} 
                    </span>}

                    <FormControlLabel 
                        control={
                            <CustomCheckbox
                                checked={this.state.isPrivate}
                                onChange={() => {this.setState({isPrivate: !this.state.isPrivate})}} 
                            />
                        }
                        style={{color: '#667788'}}
                        label={this.props.langProps.private_room}
                    />
                    
                    {!this.state.title.length && <button className="button-gray" onClick={() => {this.props.close()}} style={{width: 'max-content', marginTop: 5}}>{this.props.langProps.back}</button>}
                    {!!this.state.title.length && <button className="button-blue" onClick={() => {this.setState({step: 'invite'})}} style={{width: 'max-content', marginTop: 5}}>{this.props.langProps.next}</button>}
                </>}

                {this.state.step === 'invite' && <>
                    <Friends onClick={(id) => {
                        if(!this.state.selectUsers.find(x => x === id))
                            this.setState({selectUsers: [id, ...this.state.selectUsers]})
                        else 
                            this.setState({selectUsers: [...this.state.selectUsers.filter(x => x !== id)]})
                    }} type={'select'} selectUsers={this.state.selectUsers} />

                    <button className="button-gray" onClick={() => {this.setState({step: 'create'})}} style={{width: 'max-content', marginTop: 5}}>{this.props.langProps.back}</button>
                    <button className="button-blue" type="submit" style={{width: 'max-content', marginTop: 5}}>{this.props.langProps.start}</button>
                </>}
            </form>
        </Modal>
    }
}

const mapStateToProps = state => {
    return {
        user: state.user,
        call: state.call
    }
}

function mapDispatchToProps(dispatch) {
    return {
        roomsActions: bindActionCreators(roomsActions, dispatch),
    }
}

export default withLang(languages)(connect(mapStateToProps, mapDispatchToProps)(withRouter(CreateRoom)))