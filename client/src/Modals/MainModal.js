// App
import React from 'react'
import {urlApi} from '../config'

import SocketController from '../Controllers/SocketController';
import { withRouter } from 'react-router-dom';
import CreateRoom from './CreateRoom';
import qs from 'qs'
import User from './User';
import Contacts from './Contacts';
import CreateDialog from './CreateDialog';
import { connect } from 'react-redux';
import Invite from './Invite';
import EditRoom from './EditRoom';
import DeleteRoom from './DeleteRoom';
import Forward from './Forward';
import { DIALOGS_SET_FORWARD, SLIDER_SET } from '../Redux/constants';
import Call from './Call';
import Slider from '../Partials/Chat/Slider';
import Investments from './Investments';

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

            <CreateDialog isOpen={this.state.act === 'newChat'} close={() => {
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

            <Invite isOpen={this.state.act === 'invite' && this.props.rooms.activeRoom} close={() => {
                this.props.history.push({
                    search: ""
                })
            }} />

            {this.state.act === 'editRoom' && this.props.rooms.activeRoom && (this.props.user._id === this.props.rooms.activeRoom.ownerId) && <EditRoom isOpen={this.state.act === 'editRoom' && this.props.rooms.activeRoom} close={() => {
                this.props.history.push({
                    search: ""
                })
            }} />}

            {this.state.act === 'deleteRoom' && this.props.rooms.activeRoom && (this.props.user._id === this.props.rooms.activeRoom.ownerId) && <DeleteRoom isOpen={this.state.act === 'deleteRoom' && this.props.rooms.activeRoom} close={() => {
                this.props.history.push({
                    search: ""
                })
            }} />}

            <Forward isOpen={!!this.props.dialogs.forwardMessages.length} close={(status) => {
                this.props.dispatch({
                    type: DIALOGS_SET_FORWARD,
                    payload: []
                })
            }} />

            {this.state.modal === 'slider' && !!this.props.slider.images.length && <Slider index={this.props.slider.index} images={this.props.slider.images} close={() => {
                this.props.dispatch({
                    type: SLIDER_SET,
                    payload: {
                        images: [],
                        index: 0
                    }
                })
                this.props.history.goBack()
            }} />}
            
            {this.props.match.params.id && this.state.modal === 'investments' && <Investments 
                isOpen={this.props.match.params.id && this.state.modal === 'investments'} 
                dialogId={this.props.match.params.id} 
                close={() => {
                    this.props.history.push({
                        search: ""
                    })
                }}
            />}

            {this.props.call.user && <Call isOpen={true} />}
        </>
    }
}

const mapStateToProps = state => {
    return {
        rooms: state.rooms,
        user: state.user,
        dialogs: state.dialogs,
        call: state.call,
        slider: state.slider
    }
}

export default connect(mapStateToProps)(withRouter(MainModal))