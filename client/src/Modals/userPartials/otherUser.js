// App
import React from 'react'
import Modal from 'react-modal';

// Material
import Fab from '@material-ui/core/Fab';
import BookOutlinedIcon from '@material-ui/icons/BookOutlined';
import { withStyles } from '@material-ui/core'
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
import ChatBubbleOutlineOutlinedIcon from '@material-ui/icons/ChatBubbleOutlineOutlined';

// Redux
import { connect } from 'react-redux'
import * as usersActions from '../../Redux/actions/users'
import { bindActionCreators } from 'redux'
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import CheckOutlinedIcon from '@material-ui/icons/CheckOutlined';
import PersonAddOutlinedIcon from '@material-ui/icons/PersonAddOutlined';
import {urlApi} from '../../config'

import SocketController from '../../Controllers/SocketController';
import Avatar from '../../Partials/User/Avatar';
import { NavLink, withRouter } from 'react-router-dom';

const fabStyles = theme => ({
    root: {
        backgroundColor: '#EDF0F3',
        boxShadow: 'none!important',
        '&:hover': {
            backgroundColor: '#008FF7',
        },
        '&:hover svg': {
            color: '#fff!important'
        },
        '& svg': {
            transition: 'all 0.25s'
        },
    }
})

const CustomFab = withStyles(fabStyles)(Fab);

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
                    <div className="user-btn">
                        <NavLink style={{textDecoration: 'none'}} onClick={(e) => {
                            if(`/chats/${this.props.user._id}` === this.props.history.location.pathname)
                                e.preventDefault()
                        }} className="dialog-link" to={`/chats/${this.props.user._id}`}>
                            <CustomFab color="primary" size="small" aria-label="add" onClick={() => {}}>
                                <ChatBubbleOutlineOutlinedIcon style={{color: '#99AABB'}} />
                            </CustomFab>
                        </NavLink>
                        <p>Message</p>
                    </div>    

                    {this.props.user.friendStatus === 0 && <div className="user-btn">
                        <CustomFab color="primary" size="small" aria-label="add" onClick={() => {
                            this.props.usersActions.sendRequest(this.props.userId, this.props.myUser.apiToken)
                        }}>
                            <PersonAddOutlinedIcon style={{color: '#99AABB'}} />
                        </CustomFab>
                        <p>+ Friend</p>
                    </div>}

                    {this.props.user.friendStatus === 2 && <div className="user-btn">
                        <CustomFab color="primary" size="small" aria-label="add" onClick={() => {
                            this.props.usersActions.acceptRequest(this.props.userId, this.props.myUser.apiToken)
                        }}>
                            <CheckOutlinedIcon style={{color: '#99AABB'}} />
                        </CustomFab>
                        <p>Accept</p>
                    </div>}

                    {(this.props.user.friendStatus === 2 || this.props.user.friendStatus === 1) && <div className="user-btn">
                        <CustomFab color="primary" size="small" aria-label="add" onClick={() => {
                            this.props.usersActions.removeRequest(this.props.userId, this.props.myUser.apiToken)
                        }}>
                            <CloseOutlinedIcon style={{color: '#99AABB'}} />
                        </CustomFab>
                        <p>Decline</p>
                    </div>}

                    {this.props.user.friendStatus === 3 && <div className="user-btn">
                        <CustomFab color="primary" size="small" aria-label="add" onClick={() => {
                            this.props.usersActions.removeRequest(this.props.userId, this.props.myUser.apiToken)
                        }}>
                            <DeleteOutlineOutlinedIcon style={{color: '#99AABB'}} />
                        </CustomFab>
                        <p>Remove</p>
                    </div>}
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