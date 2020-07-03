// App
import React from 'react'
import Modal from 'react-modal';

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
import { urlApi } from '../config';
import languages from '../languages';
import { withLang } from 'react-multi-language';
import Avatar from '../Partials/User/Avatar';
import { toast } from 'react-toastify';

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
        isFetching: true,
        rooms: [],
        selectRoomId: false,
    }

    componentDidMount() {
        fetch(`${urlApi}/api/user/get-mute`, {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.props.user.apiToken}`,
            },
            body: JSON.stringify({
                userId: this.props.userId
            })
        })
        .then(response => response.json())
        .then(limits => {
            let rooms = limits.map(x => x.room)
            this.setState({isFetching: false, rooms})
        })
    }

    onSubmit(e) {
        this.setState({error: false, errors: []})

        fetch(`${urlApi}/api/room/unmute`, {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.props.user.apiToken}`,
            },
            body: JSON.stringify({
                roomId: this.state.selectRoomId,
                userId: this.props.userId
            })
        })
        .then(() => {
            toast.success("Unmute sent", {
                position: toast.POSITION.TOP_CENTER
            });
            this.setState({rooms: [...this.state.rooms.filter(x => x._id !== this.state.selectRoomId)], selectRoomId: 0})
        })
    }

    render() {
        return <Modal
            isOpen={true}
            onRequestClose={() => {this.props.close()}}
            style={customStylesModal}
            contentLabel="Contacts"
        >   
            <h2 className="modal-title">Unmute</h2>

            <Scrollbars
                ref={(ref) => {this.roomsBlock = ref}}
                renderTrackVertical={props => <div className="track-vertical"/>}
                renderThumbVertical={props => <div className="thumb-vertical"/>}
                className="scroll"
                style={{height: 340}}
                autoHide
            >
                {this.state.isFetching && <CircularProgress style={{
                    color: '#008FF7',
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    margin: 'auto',
                    top: 'calc(50% - 20px)'
                }} />}
                {!this.state.isFetching && this.state.rooms.map((room, index) => {
                    return (
                        <RoomItem selectRoom={(id) => {
                            this.setState({selectRoomId: id})
                        }} key={index} room={room} selectRoomId={this.state.selectRoomId} />
                    )
                })}
                {!this.state.isFetching && !this.state.rooms.length && <div className="data-empty">
                    <p>This user dont have mutes rooms</p>
                </div>}
            </Scrollbars>

            {!!this.state.selectRoomId && <button className="button-blue" onClick={() => {
                this.onSubmit()
            }} style={{width: 'max-content', marginTop: 25}}>Unmute</button>}
            {!this.state.selectRoomId && <button className="button-gray" onClick={() => {
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