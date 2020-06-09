// App
import React from 'react'
import {urlApi} from '../config'

import SocketController from '../Controllers/SocketController';
import { withRouter } from 'react-router-dom';
import CreateRoom from './CreateRoom';
import qs from 'qs'
import User from './User';
import Contacts from './Contacts';

class MainModal extends React.Component {
    state = {
        act: qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).act,
        user: qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).user,
        modal: qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).modal,
    }

    componentDidMount() {
        this.props.history.listen((location) => {
            this.setState({
                act: qs.parse(location.search, { ignoreQueryPrefix: true }).act,
                user: qs.parse(location.search, { ignoreQueryPrefix: true }).user,
                modal: qs.parse(location.search, { ignoreQueryPrefix: true }).modal,
            })
        })
    }
    
    render() {
        return <>
            <CreateRoom isOpen={this.state.act === 'newRoom'} close={() => {
                this.props.history.push({
                    search: ""
                })
            }} />

            {this.state.user && <User userId={this.state.user} close={() => {
                this.props.history.push({
                    search: ""
                })
            }} />}

            <Contacts isOpen={this.state.modal === 'contacts'} close={() => {
                this.props.history.push({
                    search: ""
                })
            }} />
        </>
    }
}

export default withRouter(MainModal)