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

import SocketController from '../Controllers/SocketController';

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
        title: '',
        isPrivate: false
    }

    onSubmit(e) {
        e.preventDefault()

        fetch(`http://localhost:8000/api/room/create`, {
            method: "post",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.props.user.apiToken}`,
            },
            body: JSON.stringify({
                title: this.state.title,
                isPrivate: this.state.isPrivate,
                lang: this.props.user.roomLang
            })
        })
        .then((response) => response.json())
        .then((room) => {
            this.props.roomsActions.roomsAdd(room)
            SocketController.createRoom({room, lang: this.props.user.roomLang})
        });
    }
    
    render() {
        return <Modal
            isOpen={this.props.isOpen}
            onRequestClose={() => {this.props.close()}}
            style={customStylesModal}
            contentLabel="Create room"
        >
            <h2 className="modal-title">New room</h2>

            <form onSubmit={(e) => {this.onSubmit(e)}}>
                <input 
                    value={this.state.title} 
                    onChange={(e) => {this.setState({title: e.target.value})}} 
                    className="input-field" 
                    type="text"
                    style={{marginBottom: 10}} 
                    placeholder="Title" 
                />

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

                <button className="button-blue" type="submit" style={{width: 'max-content'}}>Next</button>
            </form>
        </Modal>
    }
}

const mapStateToProps = state => {
    return {
        user: state.user
    }
}

function mapDispatchToProps(dispatch) {
    return {
        roomsActions: bindActionCreators(roomsActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateRoom)