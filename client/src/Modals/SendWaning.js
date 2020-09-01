// App
import React from 'react'
import Modal from 'react-modal';

// Material
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';

// Redux
import { connect } from 'react-redux'
import * as usersActions from '../Redux/actions/users'
import * as roomsActions from '../Redux/actions/rooms'
import { bindActionCreators } from 'redux'
import { withCookies } from 'react-cookie'

import { withRouter } from 'react-router-dom';
import { urlApi } from '../config';
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
            <span className="modal-back" onClick={(e) => {
                this.props.history.goBack()
            }}>
                <CloseOutlinedIcon style={{color: '#99AABB'}} />
            </span>
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