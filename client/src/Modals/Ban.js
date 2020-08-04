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
import { Button, Radio, withStyles } from '@material-ui/core'

import { withRouter } from 'react-router-dom';
import { urlApi, timeStamps } from '../config';
import languages from '../languages';
import { withLang } from 'react-multi-language';
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

class Settings extends React.Component {
    state = {
        error: false,
        errors: [],
        isFetching: false,
        time: 0,
    }

    onSubmit(e) {
        this.setState({error: false, errors: []})

        fetch(`${urlApi}/api/user/ban`, {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.props.user.apiToken}`,
            },
            body: JSON.stringify({
                userId: this.props.userId,
                time: this.state.time
            })
        })
        .then(() => {
            this.props.history.push({
                search: `?user=${this.props.userId}`
            })
            toast.success("Ban sent", {
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
            <h2 className="modal-title">Ban</h2>

            {timeStamps.map((time, index) => 
                    <Button key={index} className="room-item" style={{height: 40}} onClick={() => {
                        this.setState({time: time.time})
                    }}>
                        <div style={{
                            flexGrow: 1,
                            minWidth: 0,
                            maxWidth: '100%',
                            paddingRight: 10
                        }}>
                            <p><span>{time.label}</span></p>
                        </div>
                        <CustomRadio
                            checked={this.state.time === time.time}
                        />
                    </Button>
            )}
            {!!this.state.time && <button className="button-blue" onClick={() => {
                this.onSubmit()
            }} style={{width: 'max-content', marginTop: 25}}>Ban</button>}
            {!this.state.time && <button className="button-gray" onClick={() => {
                this.props.history.push({
                    search: `?user=${this.props.userId}`
                })
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