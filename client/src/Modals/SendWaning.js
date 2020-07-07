// App
import React from 'react'
import Modal from 'react-modal';

// Material

// Redux
import { connect } from 'react-redux'
import * as usersActions from '../Redux/actions/users'
import * as roomsActions from '../Redux/actions/rooms'
import { bindActionCreators } from 'redux'
import { withCookies } from 'react-cookie'
import { Scrollbars } from 'react-custom-scrollbars';
import { CircularProgress, Button, Radio, withStyles } from '@material-ui/core'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';

import { withRouter } from 'react-router-dom';
import { urlApi, timeStamps } from '../config';
import languages from '../languages';
import { withLang } from 'react-multi-language';
import Avatar from '../Partials/User/Avatar';
import { toast } from 'react-toastify';

let waitSearch = false

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

const radioStyles = theme => ({
    root: {
        color: '#CCD1D6',
        display: 'flex',
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

const CustomRadio = withStyles(radioStyles)(Radio);

class RoomItem extends React.Component {
    render() {
        return <>
            <Button className="room-item" title={`Room ${this.props.room.title}`} onClick={() => {
                this.props.selectRoom(this.props.room._id)
            }}>
                <Avatar style={{minWidth: 40, maxWidth: 40, height: 40, fontSize: 14, fontWeight: 600, backgroundColor: `rgb(${this.props.room.color})`}} name={this.props.room.title.charAt(0)} />
                <div style={{
                    flexGrow: 1,
                    minWidth: 0,
                    maxWidth: '100%',
                    paddingRight: 10
                }}>
                    <p>{this.props.room.isPrivate && <LockOutlinedIcon />}<span>{this.props.room.title}</span></p>
                </div>
                <CustomRadio
                    checked={this.props.selectRoomId === this.props.room._id}
                />
            </Button>
        </>
    }
}

class Settings extends React.Component {
    state = {
        error: false,
        errors: [],
        isFetching: false,
        warning: ''
    }

    onSubmit(e) {
        this.setState({error: false, errors: []})

        fetch(`${urlApi}/api/user/send-warning`, {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.props.user.apiToken}`,
            },
            body: JSON.stringify({
                warning: this.state.warning,
                userId: this.props.userId,
            })
        })
        .then(() => {
            this.props.history.push({
                search: `?user=${this.props.userId}`
            })
            toast.success("Warning sent", {
                position: toast.POSITION.TOP_CENTER
            });
        })
    }

    render() {
        return <Modal
            isOpen={true}
            onRequestClose={() => {this.props.close()}}
            style={customStylesModal}
            contentLabel="Contacts"
        >   
            <h2 className="modal-title">Send warning</h2>

            <textarea 
                className="input-field"
                onChange={(e) => {
                    this.setState({warning: e.target.value})
                }}
                value={this.state.warning}
            ></textarea>

            {!!this.state.warning && <button className="button-blue" onClick={() => {
                this.onSubmit()
            }} style={{width: 'max-content', marginTop: 25}}>Send</button>}
            {!this.state.warning && <button className="button-gray" onClick={() => {
                this.props.history.goBack()
            }} style={{width: 'max-content', marginTop: 25}}>{this.props.langProps.back}</button>}
        </Modal>
    }
}

const mapStateToProps = state => {
    return {
        users: state.users,
        user: state.user,
        rooms: state.rooms
    }
}

function mapDispatchToProps(dispatch) {
    return {
        usersActions: bindActionCreators(usersActions, dispatch),
        roomsActions: bindActionCreators(roomsActions, dispatch),
    }
}

export default withLang(languages)(connect(mapStateToProps, mapDispatchToProps)(withRouter(withCookies(Settings))))