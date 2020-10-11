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
        flexDirection         : 'column',
        alignItems            : 'center',
        width                 : 'max-content',
        maxWidth              : '380px',
        padding               : '20px 0'
    }
};



class Settings extends React.Component {
    state = {
        error: false,
        errors: [],
        isFetching: false,
        message: '',
        email: ''
    }

    onSubmit(e) {
        this.setState({error: false, errors: []})

        fetch(`${urlApi}/api/user/send-support-all`, {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: this.state.message,
                email: this.state.email.toLowerCase().replace(/\s+/g, ''),
            })
        })
        .then(response => response.json())
        .then((data) => {
            if(data.error) {
                this.setState({error: true, errors: data.errors})
            } else {
                this.props.history.goBack()
                toast(this.props.langProps.message_to_support_sended, {
                    position: toast.POSITION.TOP_CENTER
                });
            }
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
            <h2 className="modal-title" style={{maxWidth: '70%'}}>{this.props.langProps.send_message_to_support}</h2>

            <textarea 
                className="input-field"
                style={{}}
                onChange={(e) => {
                    this.setState({message: e.target.value})
                }}
                value={this.state.message}
                placeholder={this.props.langProps.write_message}
            ></textarea>

            <input 
                value={this.state.email} 
                onChange={(e) => {this.setState({email: e.target.value})}} 
                className="input-field" 
                type="text"
                style={{marginBottom: 10}} 
                placeholder={'E-mail'}
                maxLength={50}
            />
            {this.state.errors.find(value => value.param === 'email') && <span className="input-error-label">
                {this.props.langProps[this.state.errors.find(value => value.param === 'email').msg]} 
            </span>}

            {(!!this.state.message && !!this.state.email) && <button className="button-blue" onClick={() => {
                this.onSubmit()
            }} style={{width: 'max-content', marginTop: 25}}>Send</button>}
            {(!this.state.message || !this.state.email) && <button className="button-gray" onClick={() => {
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