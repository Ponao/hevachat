// App
import React from 'react'
import { withCookies } from 'react-cookie'
import '../../Css/Auth/Login.css'

// Router
import {
    Link
} from "react-router-dom"

// Redux
import { connect } from 'react-redux'
import * as userActions from '../../Redux/actions/user'
import { bindActionCreators } from 'redux'
import SocketController from '../../Controllers/SocketController'
import {urlApi} from '../../config'

class Login extends React.Component {
    state = {
        email: '',
        password: '',
        error: false,
        errors: [],
        isFetching: false
    }

    onSubmit(e) {
        e.preventDefault()

        if(this.state.email && this.state.password) {
            this.setState({isFetching: true})

            fetch(`${urlApi}/auth/login`, {
                method: "post",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: this.state.email,
                    password: this.state.password
                })
            })
            .then(response => response.json())
            .then(data => {
                if(data.error) {
                    this.setState({error: true, errors: data.errors})
                } else {
                    const { cookies } = this.props
                    cookies.set('apiToken', data.token, { path: '/' })

                    this.props.userActions.loginUser(data.user, data.dialogs, data.noReadCount, data.noReadNotifications, data.token)

                    SocketController.init(data.token)
                }

                this.setState({isFetching: false})
            })
        }
    }

    render() {
        return (
            <div className="login-page">
                <h1 className="logo">
                    <span style={{color: '#556677'}}>heva</span>
                    <span style={{color: '#008FF7'}}>chat</span>
                </h1>

                <form onSubmit={(e) => {this.onSubmit(e)}} className="form">
                    <input value={this.state.email} onChange={(e) => {this.setState({email: e.target.value})}} className="input-field" type="text" name="email" placeholder="E-mail" />
                    {this.state.errors.find(value => value.param === 'email') && <span className="input-error-label">
                        {this.state.errors.find(value => value.param === 'email').msg} 
                    </span>}

                    <input value={this.state.password} onChange={(e) => {this.setState({password: e.target.value})}} className="input-field" type="password" name="password" placeholder="Пароль" />
                    {this.state.errors.find(value => value.param === 'password') && <span className="input-error-label">
                        {this.state.errors.find(value => value.param === 'password').msg} 
                    </span>}

                    {this.state.errors.find(value => value.param === 'all') && <span style={{marginTop: 30}} className="input-error-label">
                        {this.state.errors.find(value => value.param === 'all').msg} 
                    </span>}

                    <button type="submit" className="button-gray">Войти</button>

                    <p className="nav-auth">New to the site? <Link to="/register">Sign up</Link></p>
                </form>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.user
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userActions: bindActionCreators(userActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withCookies(Login))