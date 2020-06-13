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
        title: this.props.rooms.activeRoom.title,
        isPrivate: this.props.rooms.activeRoom.isPrivate,
        error: false,
        errors: []
    }

    onSubmit(e) {
        this.setState({error: false, errors: []})
        e.preventDefault()

        fetch(`${urlApi}/api/room/edit`, {
            method: "post",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.props.user.apiToken}`,
            },
            body: JSON.stringify({
                id: this.props.rooms.activeRoom._id,
                title: this.state.title,
                isPrivate: this.state.isPrivate,
            })
        })
        .then((response) => response.json())
        .then((room) => {
            if(room.error) {
                this.setState({error: true, errors: room.errors})
            } else {
                this.props.close()
            }
        });
    }
    
    render() {
        return <Modal
            isOpen={this.props.isOpen}
            onRequestClose={() => {this.props.close()}}
            style={customStylesModalCreate}
            contentLabel="Edit room"
        >
            <h2 className="modal-title">Edit room</h2>

            <form style={{display: 'contents'}} onSubmit={(e) => {this.onSubmit(e)}}>
                <input 
                    value={this.state.title} 
                    onChange={(e) => {this.setState({title: e.target.value})}} 
                    className="input-field" 
                    type="text"
                    style={{marginBottom: 10}} 
                    placeholder="Title"
                    maxLength={50}
                />
                {this.state.errors.find(value => value.param === 'title') && <span className="input-error-label">
                    {this.state.errors.find(value => value.param === 'title').msg} 
                </span>}

                <FormControlLabel 
                    control={
                        <CustomCheckbox
                            checked={this.state.isPrivate}
                            onChange={() => {this.setState({isPrivate: !this.state.isPrivate})}} 
                        />
                    }
                    style={{color: '#667788'}}
                    label="Private theme"
                />

                {this.state.title === this.props.rooms.activeRoom.title && this.state.isPrivate === this.props.rooms.activeRoom.isPrivate && <button className="button-gray" onClick={() => {
                    this.props.close()
                }} style={{width: 'max-content', marginTop: 5}}>Back</button>}

                {(this.state.title !== this.props.rooms.activeRoom.title || this.state.isPrivate !== this.props.rooms.activeRoom.isPrivate) && <button className="button-blue" type="submit" style={{width: 'max-content', marginTop: 5}}>Save</button>}
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

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(CreateRoom))