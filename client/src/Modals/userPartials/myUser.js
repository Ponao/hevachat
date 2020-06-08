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

class MyUser extends React.Component {
    render() {
        return <>
            <Avatar 
                style={{width: 80, height: 80, fontSize: 28, lineHeight: '28px', fontWeight: 600, backgroundColor: `rgb(${this.props.user.color})`}} 
                name={this.props.user.name.first.charAt(0)+this.props.user.name.last.charAt(0)} 
            />

            <p className="user-profile-name">{this.props.user.name.first} {this.props.user.name.last}</p>
            <p className="user-profile-city">Moscow</p>
            
            <button onClick={() => {
                
            }}>Contacts</button>
        </>
    }
}

const mapStateToProps = state => {
    return {
        users: state.users,
        user: state.user
    }
}

function mapDispatchToProps(dispatch) {
    return {
        usersActions: bindActionCreators(usersActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(MyUser))