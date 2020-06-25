// App
import React from 'react'
import Modal from 'react-modal';
import { Scrollbars } from 'react-custom-scrollbars';

// Material
import GroupIcon from '@material-ui/icons/Group';

// Redux
import { connect } from 'react-redux'
import * as usersActions from '../../Redux/actions/users'
import { bindActionCreators } from 'redux'

import { NavLink, withRouter } from 'react-router-dom';
import UserItem from '../../Partials/User/UserItem';
import { CircularProgress } from '@material-ui/core';
import { urlApi } from '../../config';
import { SLIDER_SET } from '../../Redux/constants';

class Images extends React.Component {
    state = {
        isFetching: true,
        images: []
    }

    componentDidMount() {
        if(this.props.match.params.id) {
            let type = this.props.history.location.pathname.substring(1,5)
            this.setState({isFetching: true})
            let body
            if(type === 'chat') {
                body = {
                    userId: this.props.match.params.id,
                    type: 'image'
                }
            } else {
                body = {
                    roomId: this.props.match.params.id,
                    type: 'image'
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
            .then(images => {
                if(!images.error) {
                    images = images.map(x => x.data)
                    
                    this.setState({images, isFetching: false})
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
            {this.state.images.map((image, index) => {
                return (
                    <div className="investment-image">
                        <img key={index} style={{cursor: 'pointer'}} onClick={() => {
                            this.props.history.push({
                                search: `?modal=slider`
                            })
                            this.props.dispatch({
                                type: SLIDER_SET,
                                payload: {
                                    images: this.state.images,
                                    index
                                }
                            })
                        }} src={image.path} />
                    </div>
                )
            })}
            {(!this.state.images.length && !this.state.isFetching) && <div className="data-empty">
                <GroupIcon style={{color: '#B8C3CF', fontSize: 54, margin: '0 auto', display: 'block'}} />

                <p>Here will placed images from this dialog</p>
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