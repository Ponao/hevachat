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
import { CircularProgress } from '@material-ui/core'
import store from '../../Redux/store'
import { BAN_SET } from '../../Redux/constants'
import { withLang } from 'react-multi-language'
import languages from '../../languages'
import {Facebook} from '@material-ui/icons';

const Vkontakte = ({style}) => {
    return <svg 
        style={style}
        aria-aria-hidden="true" 
        focusable="false" 
        data-prefix="fab" 
        data-icon="vk" 
        role="img" 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 576 512"
        className="svg-inline--fa fa-vk fa-w-18 fa-2x">
        <path 
            fill="currentColor" 
            d="M545 117.7c3.7-12.5 0-21.7-17.8-21.7h-58.9c-15 0-21.9 7.9-25.6 16.7 0 0-30 73.1-72.4 120.5-13.7 13.7-20 18.1-27.5 18.1-3.7 0-9.4-4.4-9.4-16.9V117.7c0-15-4.2-21.7-16.6-21.7h-92.6c-9.4 0-15 7-15 13.5 0 14.2 21.2 17.5 23.4 57.5v86.8c0 19-3.4 22.5-10.9 22.5-20 0-68.6-73.4-97.4-157.4-5.8-16.3-11.5-22.9-26.6-22.9H38.8c-16.8 0-20.2 7.9-20.2 16.7 0 15.6 20 93.1 93.1 195.5C160.4 378.1 229 416 291.4 416c37.5 0 42.1-8.4 42.1-22.9 0-66.8-3.4-73.1 15.4-73.1 8.7 0 23.7 4.4 58.7 38.1 40 40 46.6 57.9 69 57.9h58.9c16.8 0 25.3-8.4 20.4-25-11.2-34.9-86.9-106.7-90.3-111.5-8.7-11.2-6.2-16.2 0-26.2.1-.1 72-101.3 79.4-135.6z" class="" />
    </svg>
}

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
            this.setState({isFetching: true, error: false, errors: []})

            fetch(`${urlApi}/auth/login`, {
                method: "post",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: this.state.email.toLowerCase().replace(/\s+/g, ''),
                    password: this.state.password
                })
            })
            .then(response => response.json())
            .then(data => {
                if(data.error) {
                    this.setState({error: true, errors: data.errors})
                } else {
                    if(data.ban) {
                        store.dispatch({
                            type: BAN_SET,
                            payload: {numDate: data.numDate, date: data.date}
                        })
                    } else {
                        this.props.userActions.loginUser(data.user, data.dialogs, data.noReadCount, data.noReadNotifications, data.token, data.leftDays)

                        SocketController.init(data.token)
                    }
                    const { cookies } = this.props
                    cookies.set('apiToken', data.token, { path: '/' })
                }

                this.setState({isFetching: false})
            })
        }
    }

    render() {
        if(this.state.isFetching)
            return <CircularProgress style={{
                color: '#008FF7',
                position: 'absolute',
                left: 0,
                right: 0,
                margin: 'auto',
                top: 'calc(50% - 20px)'
            }} />
            
        return (
            <div className="login-page">
                <h1 className="logo">
                    <span style={{color: '#556677'}}>heva</span>
                    <span style={{color: '#008FF7'}}>chat</span>
                </h1>

                <form onSubmit={(e) => {this.onSubmit(e)}} className="form">
                    <a className="social-auth" href={`${urlApi}/auth/login_vk?uuid=${randomInteger(0, 9999999)}`}>
                        <Vkontakte style={{width: 24, height: 24, marginLeft: 20, marginRight: 15, color: '#5181b8'}} />
                        Вход через VK
                    </a>
                    <a className="social-auth" href={`${urlApi}/auth/login_fb?uuid=${randomInteger(0, 9999999)}`}>
                        <Facebook style={{marginLeft: 20, marginRight: 15, color: '#4267b2'}} />
                        Вход через FaceBook
                    </a>

                    <input value={this.state.email} onChange={(e) => {this.setState({email: e.target.value})}} className="input-field" type="text" name="email" placeholder="E-mail" />
                    {this.state.errors.find(value => value.param === 'email') && <span className="input-error-label">
                        {this.props.langProps[this.state.errors.find(value => value.param === 'email').msg]} 
                    </span>}

                    <input value={this.state.password} onChange={(e) => {this.setState({password: e.target.value})}} className="input-field" type="password" name="password" placeholder="Password" />
                    {this.state.errors.find(value => value.param === 'password') && <span className="input-error-label">
                        {this.props.langProps[this.state.errors.find(value => value.param === 'password').msg]} 
                    </span>}

                    {this.state.errors.find(value => value.param === 'all') && <span style={{marginTop: 30}} className="input-error-label">
                        {this.props.langProps[this.state.errors.find(value => value.param === 'all').msg]} 
                    </span>}

                    <button type="submit" className="button-gray">Log in</button>

                    <p className="nav-auth">New to the site? <Link to="/register">Sign up</Link></p>
                    <p className="nav-auth" onClick={() => {
                        fetch(`${urlApi}/auth/reset`, {
                            method: "post",
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            }
                        })
                    }}><Link to="/forgot">Forgot your password?</Link></p>
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

function randomInteger(min, max) {
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
}

export default withLang(languages)(connect(mapStateToProps, mapDispatchToProps)(withCookies(Login)))