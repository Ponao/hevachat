// App
import React from 'react'
import Modal from 'react-modal';

// Material

// Redux
import { connect } from 'react-redux'
import * as usersActions from '../Redux/actions/users'
import { bindActionCreators } from 'redux'
import {urlApi} from '../config'

import SocketController from '../Controllers/SocketController';
import Avatar from '../Partials/User/Avatar';
import { NavLink, withRouter } from 'react-router-dom';
import OtherUser from './userPartials/otherUser';
import MyUser from './userPartials/myUser';

const customStylesModal = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        zIndex: 4
    },
    content : {
        top                   : '50%',
        left                  : '50%',
        right                 : 'auto',
        bottom                : 'auto',
        minWidth              : '300px',
        marginRight           : '-50%',
        transform             : 'translate(-50%, -50%)',
        borderRadius          : '10px',
        boxShadow             : '0px 5px 30px rgba(0, 0, 0, 0.16)',
        display               : 'flex',
        justifyContent        : 'center',
        flexWrap              : 'wrap'
    }
};

class User extends React.Component {
    componentDidMount() {
        if(!this.props.users.users.find(user => user._id === this.props.userId)) {
            this.props.usersActions.userGet(this.props.userId, this.props.user.apiToken)
        }
    }
    
    render() {
        let user = this.props.users.users.find(user => user._id === this.props.userId)
        return <Modal
            isOpen={true}
            onRequestClose={() => {this.props.usersActions.setActiveUserId(false)}}
            style={customStylesModal}
            contentLabel="User"
        >
            {user && 
            <>
                {user._id !== this.props.user._id && 
                    <OtherUser userId={this.props.userId} user={user} />
                }

                {user._id === this.props.user._id && 
                    <MyUser />
                }
            </>
            }
        </Modal>
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

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(User))