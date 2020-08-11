// App
import React from 'react'
import { withCookies } from 'react-cookie'
import { CircularProgress } from '@material-ui/core'
import qs from 'qs'
import { withRouter } from 'react-router-dom'

class AuthVk extends React.Component {
    state = {
        token: qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).token,
    }

    componentDidMount() {
        if(this.state.token) {
            const { cookies } = this.props
            cookies.set('apiToken', this.state.token, { path: '/' })

            window.location.replace('/')
        }
    }

    render() {
        return <CircularProgress style={{
            color: '#008FF7',
            position: 'absolute',
            left: 0,
            right: 0,
            margin: 'auto',
            top: 'calc(50% - 20px)'
        }} />
    }
}


export default withCookies(withRouter(AuthVk))