// App
import React from 'react'
import { withCookies } from 'react-cookie'
import { CircularProgress } from '@material-ui/core'
import qs from 'qs'
import { Link, withRouter } from 'react-router-dom'
import { urlApi } from '../../config'
import { toast } from 'react-toastify'
import languages from '../../languages'
import { withLang } from 'react-multi-language'

class Reset extends React.Component {
    state = {
        token: qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).token,
        password: '',
        error: false,
        errors: [],
        isFetching: false
    }

    onSubmit(e) {
        e.preventDefault()

        if(this.state.password) {
            this.setState({isFetching: true, error: false, errors: []})

            fetch(`${urlApi}/auth/reset`, {
                method: "post",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    password: this.state.password,
                    token: this.state.token
                })
            })
            .then(response => response.json())
            .then(data => {
                if(data.error) {
                    this.setState({error: true, errors: data.errors})
                } else {
                    if(data.status === 'success') {
                        toast.success("Password changed", {
                            position: toast.POSITION.TOP_CENTER
                        })
                        this.props.history.push('/login')
                    }
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
                    <input value={this.state.email} onChange={(e) => {this.setState({password: e.target.value})}} className="input-field" type="password" name="password" placeholder="Password" />
                    {this.state.errors.find(value => value.param === 'password') && <span className="input-error-label">
                        {this.props.langProps[this.state.errors.find(value => value.param === 'password').msg]} 
                    </span>}

                    {this.state.errors.find(value => value.param === 'all') && <span className="input-error-label">
                        {this.props.langProps[this.state.errors.find(value => value.param === 'all').msg]} 
                    </span>}

                    <button type="submit" className="button-gray">Reset password</button>

                    <p className="nav-auth">Already have account? <Link to="/login">Log in</Link></p>
                    <p className="nav-auth">New to the site? <Link to="/register">Sign up</Link></p>
                </form>
            </div>
        )
    }
}


export default withLang(languages)(withCookies(withRouter(Reset)))