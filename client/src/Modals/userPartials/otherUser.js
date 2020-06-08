// App
import React from 'react'
import Modal from 'react-modal';

// Material

// Redux
import { connect } from 'react-redux'
import * as usersActions from '../../Redux/actions/users'
import { bindActionCreators } from 'redux'
import {urlApi} from '../../config'

import SocketController from '../../Controllers/SocketController';
import Avatar from '../../Partials/User/Avatar';
import { NavLink, withRouter } from 'react-router-dom';

class OtherUser extends React.Component {
    render() {
        return <>
                <Avatar 
                    style={{width: 80, height: 80, fontSize: 28, lineHeight: '28px', fontWeight: 600, backgroundColor: `rgb(${this.props.user.color})`}} 
                    name={this.props.user.name.first.charAt(0)+this.props.user.name.last.charAt(0)} 
                />

                <p className="user-profile-name">{this.props.user.name.first} {this.props.user.name.last}</p>
                <p className="user-profile-city">Moscow</p>
                
                <>
                    <NavLink style={{textDecoration: 'none'}} onClick={(e) => {
                        if(`/chats/${this.props.user._id}` === this.props.history.location.pathname)
                            e.preventDefault()
                    }} className="dialog-link" to={`/chats/${this.props.user._id}`}>
                        <button>Chat</button>
                    </NavLink>

                    {this.props.user.friendStatus === 0 && <button onClick={() => {
                        this.props.usersActions.sendRequest(this.props.userId, this.props.myUser.apiToken)
                    }}>+ Friend</button>}

                    {this.props.user.friendStatus === 2 && <button onClick={() => {
                        this.props.usersActions.acceptRequest(this.props.userId, this.props.myUser.apiToken)
                    }}>Accept</button>}
                    
                    {(this.props.user.friendStatus === 2 || this.props.user.friendStatus === 1) && <button onClick={() => {
                        this.props.usersActions.removeRequest(this.props.userId, this.props.myUser.apiToken)
                    }}>Decline</button>}

                    {this.props.user.friendStatus === 3 && <button onClick={() => {
                        this.props.usersActions.removeRequest(this.props.userId, this.props.myUser.apiToken)
                    }}>Remove</button>}
                </>
            </>
    }
}

const mapStateToProps = state => {
    return {
        users: state.users,
        myUser: state.user
    }
}

function mapDispatchToProps(dispatch) {
    return {
        usersActions: bindActionCreators(usersActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(OtherUser))