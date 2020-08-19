// App
import React from 'react'
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
import Settings from './Settings';
import Profile from './Profile';
import Language from './Language';
import Mute from './Mute';
import Unmute from './Unmute';
import Banroom from './Banroom';
import Unbanroom from './Unbanroom';
import SendWaning from './SendWaning';
import Warning from './Warning';
import ForceAcceptCall from './ForceAcceptCall';
import ForcePlaceCall from './ForcePlaceCall';
import ForceJoinRoom from './ForceJoinRoom';
import Ban from './Ban';
import Toasts from './Toasts';

class MainModal extends React.Component {
    state = {
        act: qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).act,
        user: qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).user,
        modal: qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).modal,
        mute: qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).mute,
        unmute: qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).unmute,
        banroom: qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).banroom,
        unbanroom: qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).unbanroom,
        sendwarning: qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).sendwarning,
        ban: qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).ban,
    }

    componentDidMount() {
        this.props.history.listen((location) => {
            this.setState({
                act: qs.parse(location.search, { ignoreQueryPrefix: true }).act,
                user: qs.parse(location.search, { ignoreQueryPrefix: true }).user,
                modal: qs.parse(location.search, { ignoreQueryPrefix: true }).modal,
                mute: qs.parse(location.search, { ignoreQueryPrefix: true }).mute,
                unmute: qs.parse(location.search, { ignoreQueryPrefix: true }).unmute,
                banroom: qs.parse(location.search, { ignoreQueryPrefix: true }).banroom,
                unbanroom: qs.parse(location.search, { ignoreQueryPrefix: true }).unbanroom,
                sendwarning: qs.parse(location.search, { ignoreQueryPrefix: true }).sendwarning,
                ban: qs.parse(location.search, { ignoreQueryPrefix: true }).ban,
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

            {!!this.props.user.warning && <Warning isOpen={!!this.props.user.warning} />}

            {this.state.mute && this.props.user.role !== 'user' && <Mute userId={this.state.mute} close={() => {
                this.props.history.push({
                    search: ""
                })
            }} />}

            {this.state.unmute && this.props.user.role !== 'user' && <Unmute userId={this.state.unmute} close={() => {
                this.props.history.push({
                    search: ""
                })
            }} />}

            {this.state.banroom && this.props.user.role !== 'user' && <Banroom userId={this.state.banroom} close={() => {
                this.props.history.push({
                    search: ""
                })
            }} />}

            {this.state.ban && this.props.user.role !== 'user' && <Ban userId={this.state.ban} close={() => {
                this.props.history.push({
                    search: ""
                })
            }} />}

            {this.state.unbanroom && this.props.user.role !== 'user' && <Unbanroom userId={this.state.unbanroom} close={() => {
                this.props.history.push({
                    search: ""
                })
            }} />}

            {this.state.sendwarning && this.props.user.role !== 'user' && <SendWaning userId={this.state.sendwarning} close={() => {
                this.props.history.push({
                    search: ""
                })
            }} />}

            <Contacts isOpen={this.state.modal === 'contacts'} close={() => {
                this.props.history.push({
                    search: ""
                })
            }} />

            <Settings isOpen={this.state.modal === 'settings'} close={() => {
                this.props.history.push({
                    search: ""
                })
            }} />
            
            {this.state.modal === 'profile' && <Profile isOpen={this.state.modal === 'profile'} close={() => {
                this.props.history.push({
                    search: ""
                })
            }} />}

            {this.state.modal === 'language' && <Language isOpen={this.state.modal === 'language'} close={() => {
                this.props.history.push({
                    search: ""
                })
            }} />}

            <Invite isOpen={this.state.act === 'invite' && this.props.rooms.activeRoom} close={() => {
                this.props.history.push({
                    search: ""
                })
            }} />

            {this.state.act === 'editRoom' && this.props.rooms.activeRoom && (this.props.user._id === this.props.rooms.activeRoom.ownerId  || this.props.user.role === 'admin' || this.props.user.role === 'moder') && <EditRoom isOpen={this.state.act === 'editRoom' && this.props.rooms.activeRoom} close={() => {
                this.props.history.push({
                    search: ""
                })
            }} />}

            {this.state.act === 'deleteRoom' && this.props.rooms.activeRoom && (this.props.user._id === this.props.rooms.activeRoom.ownerId || this.props.user.role === 'admin' || this.props.user.role === 'moder') && <DeleteRoom isOpen={this.state.act === 'deleteRoom' && this.props.rooms.activeRoom} close={() => {
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

            {!!this.props.rooms.force && <ForceJoinRoom isOpen={true} />}

            {this.props.call.user && this.props.call.force.status === 'force-accept' && <ForceAcceptCall isOpen={true} />}
            {this.props.call.force.status === 'force-call' && <ForcePlaceCall isOpen={true} />}

            {this.props.call.user && !this.props.call.force.status && <Call isOpen={true} />}

            <Toasts />
        </>
    }
}

const mapStateToProps = state => {
    return {
        rooms: state.rooms,
        user: state.user,
        dialogs: state.dialogs,
        call: state.call,
        slider: state.slider,
    }
}

export default connect(mapStateToProps)(withRouter(MainModal))