// App
import React from 'react'
import Modal from 'react-modal';

// Material

// Redux
import { connect } from 'react-redux'
import * as usersActions from '../Redux/actions/users'
import { bindActionCreators } from 'redux'
import { withCookies } from 'react-cookie'

import { withRouter } from 'react-router-dom';
import { urlApi } from '../config';
import store from '../Redux/store';
import { USER_EDIT } from '../Redux/constants';
import languages from '../languages';
import { withLang } from 'react-multi-language';

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
        firstName: this.props.user.name.first,
        lastName: this.props.user.name.last,
        city: this.props.user.city,
        error: false,
        errors: []
    }

    onSubmit(e) {
        this.setState({error: false, errors: []})
        e.preventDefault()

        fetch(`${urlApi}/api/user/edit`, {
            method: "post",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.props.user.apiToken}`,
            },
            body: JSON.stringify({
                firstName: this.state.firstName,
                lastName: this.state.lastName
            })
        })
        .then((response) => response.json())
        .then((user) => {
            if(user.error) {
                this.setState({error: true, errors: user.errors})
            } else {
                store.dispatch({
                    type: USER_EDIT,
                    payload: {
                        firstName: this.state.firstName,
                        lastName: this.state.lastName,
                        city: this.state.city
                    }
                })
            }
        });
    }

    render() {
        return <Modal
            isOpen={this.props.isOpen}
            onRequestClose={() => {this.props.close()}}
            style={customStylesModal}
            contentLabel="Contacts"
        >
            <h2 className="modal-title">{this.props.langProps.change_profile}</h2>

            <form style={{display: 'contents'}} onSubmit={(e) => {this.onSubmit(e)}}>
                <input 
                    value={this.state.firstName} 
                    onChange={(e) => {this.setState({firstName: e.target.value})}} 
                    className="input-field" 
                    type="text"
                    placeholder={this.props.langProps.firstName}
                    style={{marginTop: 0}} 
                />
                {this.state.errors.find(value => value.param === 'firstName') && <span className="input-error-label">
                    {this.props.langProps[this.state.errors.find(value => value.param === 'firstName').msg]} 
                </span>}

                <input 
                    value={this.state.lastName} 
                    onChange={(e) => {this.setState({lastName: e.target.value})}} 
                    className="input-field" 
                    type="text"
                    style={{marginBottom: 0}} 
                    placeholder={this.props.langProps.lastName}
                />
                {this.state.errors.find(value => value.param === 'lastName') && <span className="input-error-label">
                    {this.props.langProps[this.state.errors.find(value => value.param === 'lastName').msg]} 
                </span>}

                <input 
                    value={this.state.city} 
                    onChange={(e) => {this.setState({city: e.target.value})}} 
                    className="input-field" 
                    type="text"
                    placeholder={this.props.langProps.city}
                />

                {(this.state.firstName !== this.props.user.name.first || this.state.lastName !== this.props.user.name.last || this.state.city !== this.props.user.city) && <button className="button-blue" type="submit" style={{width: 'max-content', marginTop: 25}}>{this.props.langProps.save}</button>}
                {(this.state.firstName === this.props.user.name.first && this.state.lastName === this.props.user.name.last && this.state.city === this.props.user.city) && <button className="button-gray" onClick={() => {
                        this.props.history.goBack()
                    }} style={{width: 'max-content', marginTop: 25}}>{this.props.langProps.back}</button>}
            </form>
        </Modal>
    }
}

const mapStateToProps = state => {
    return {
        users: state.users,
        user: state.user
    }
}

function mapDispatchToProps(dispatch) {
    return {
        usersActions: bindActionCreators(usersActions, dispatch),
    }
}

export default withLang(languages)(connect(mapStateToProps, mapDispatchToProps)(withRouter(withCookies(Settings))))