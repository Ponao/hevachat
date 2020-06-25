// App
import React from 'react'
import Modal from 'react-modal';
import { Scrollbars } from 'react-custom-scrollbars';

// Material
import AudiotrackIcon from '@material-ui/icons/Audiotrack';

// Redux
import { connect } from 'react-redux'
import * as usersActions from '../../Redux/actions/users'
import { bindActionCreators } from 'redux'

import { NavLink, withRouter } from 'react-router-dom';
import UserItem from '../../Partials/User/UserItem';
import { CircularProgress } from '@material-ui/core';
import { urlApi } from '../../config';
import { SLIDER_SET } from '../../Redux/constants';
import Audio from '../../Partials/Chat/Audio';

class Images extends React.Component {
    state = {
        isFetching: true,
        sounds: []
    }

    componentDidMount() {
        if(this.props.match.params.id) {
            let type = this.props.history.location.pathname.substring(1,5)
            this.setState({isFetching: true})
            let body
            if(type === 'chat') {
                body = {
                    userId: this.props.match.params.id,
                    type: 'sound'
                }
            } else {
                body = {
                    roomId: this.props.match.params.id,
                    type: 'sound'
                }
            }
            fetch(`${urlApi}/api/${type === 'chat' ? 'dialog' : 'room'}/get-investments`, {
                method: "post",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.props.user.apiToken}`,
                },
                body: JSON.stringify(body)
            })
            .then(response => response.json())
            .then(sounds => {
                if(!sounds.error) {
                    sounds = sounds.map(x => x.data)
                    
                    this.setState({sounds, isFetching: false})
                }
            })
        }
    }

    onScroll() {

    }
    
    render() {
        return <Scrollbars
            ref={(ref) => {this.roomsBlock = ref}}
            renderTrackVertical={props => <div className="track-vertical"/>}
            renderThumbVertical={props => <div className="thumb-vertical"/>}
            className="scroll investment-images"
            onScroll={() => {this.onScroll()}}
            style={{height: 340}}
            autoHide
        >
            {this.state.isFetching && <CircularProgress style={{
                    color: '#008FF7',
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    margin: 'auto',
                    top: 'calc(50% - 20px)'
                }} />}
            {this.state.sounds.map((sound, index) => {
                return (
                    <Audio
                        key={index}
                        fileName={sound.name}
                        src={sound.path}
                    />
                )
            })}
            {(!this.state.sounds.length && !this.state.isFetching) && <div className="data-empty">
                <AudiotrackIcon style={{color: '#B8C3CF', fontSize: 54, margin: '0 auto', display: 'block'}} />

                <p>Here will placed sounds from this dialog</p>
            </div>}
        </Scrollbars>
    }
}

const mapStateToProps = state => {
    return {
        users: state.users,
        user: state.user
    }
}

export default connect(mapStateToProps)(withRouter(Images))