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
import { toast } from 'react-toastify'

class Login extends React.Component {
    state = {
        email: '',
        error: false,
        errors: [],
        isFetching: false
    }

    onSubmit(e) {
        e.preventDefault()

        if(this.state.email) {
            this.setState({isFetching: true, error: false, errors: []})

            fetch(`${urlApi}/auth/forgot`, {
                method: "post",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: this.state.email.toLowerCase().replace(/\s+/g, ''),
                })
            })
            .then(response => response.json())
            .then(data => {
                if(data.error) {
                    this.setState({error: true, errors: data.errors})
                } else {
                    if(data.status === 'sended')
                        toast.success("Mail sent", {
                            position: toast.POSITION.TOP_CENTER
                        });

                    if(data.status === 'waiting')
                        toast.error("Mail alredy sent", {
                            position: toast.POSITION.TOP_CENTER
                        });
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
                    <input value={this.state.email} onChange={(e) => {this.setState({email: e.target.value})}} className="input-field" type="text" name="email" placeholder="E-mail" />
                    {this.state.errors.find(value => value.param === 'email') && <span className="input-error-label">
                        {this.props.langProps[this.state.errors.find(value => value.param === 'email').msg]} 
                    </span>}

                    {this.state.errors.find(value => value.param === 'all') && <span className="input-error-label">
                        {this.props.langProps[this.state.errors.find(value => value.param === 'all').msg]} 
                    </span>}

                    <button type="submit" className="button-gray">Send mail</button>

                    <p className="nav-auth">Already have account? <Link to="/login">Log in</Link></p>
                    <p className="nav-auth">New to the site? <Link to="/register">Sign up</Link></p>
                </form>

                <div className="auth-links">
                    <Link to="/about">About us</Link>
                    <Link to="/privacy-policy">Privacy policy</Link>
                    <Link to="/support">Support</Link>
                </div>
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