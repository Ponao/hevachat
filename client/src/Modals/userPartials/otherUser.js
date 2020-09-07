// App
import React from 'react'

// Material
import Fab from '@material-ui/core/Fab';
import { withStyles } from '@material-ui/core'
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
import ChatBubbleOutlineOutlinedIcon from '@material-ui/icons/ChatBubbleOutlineOutlined';
import MicOffIcon from '@material-ui/icons/MicOff';
import CallIcon from '@material-ui/icons/Call';
import MicIcon from '@material-ui/icons/Mic';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import WarningIcon from '@material-ui/icons/Warning';
import BlockIcon from '@material-ui/icons/Block';

// Redux
import { connect } from 'react-redux'
import * as usersActions from '../../Redux/actions/users'
import * as callActions from '../../Redux/actions/call'
import { bindActionCreators } from 'redux'
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import CheckOutlinedIcon from '@material-ui/icons/CheckOutlined';
import PersonAddOutlinedIcon from '@material-ui/icons/PersonAddOutlined';
import Avatar from '../../Partials/User/Avatar';
import { NavLink, withRouter } from 'react-router-dom';
import store from '../../Redux/store';
import { SLIDER_SET } from '../../Redux/constants';
import { withLang } from 'react-multi-language';
import languages from '../../languages';

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
                <span style={{cursor: 'pointer', borderRadius: 50}} onClick={() => {
                    if(this.props.user.avatar) {
                        this.props.history.push({
                            search: `?modal=slider`
                        })
                        store.dispatch({
                            type: SLIDER_SET,
                            payload: {
                                images: [{path: this.props.user.avatar.original}],
                                index: 0
                            }
                        })
                    }
                }}><Avatar 
                    style={{width: 80, height: 80, fontSize: 28, lineHeight: '28px', fontWeight: 600, backgroundColor: `rgb(${this.props.user.color})`}} 
                    name={this.props.user.name.first.charAt(0)+this.props.user.name.last.charAt(0)} 
                    avatar={this.props.user.avatar ? this.props.user.avatar : false}
                /></span>

                <p className="user-profile-name">{this.props.user.name.first} {this.props.user.name.last}</p>
                <p className="user-profile-city">{this.props.user.city ? this.props.user.city : this.props.langProps.not_indicated}</p>
                
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
                        <p>{this.props.langProps.message}</p>
                    </div>    

                    {this.props.call.status === 'none' && <div className="user-btn">
                        <NavLink style={{textDecoration: 'none'}} onClick={(e) => {
                            e.preventDefault()
                            this.props.callActions.call(this.props.user, this.props.myUser.apiToken)
                        }} className="dialog-link" to={`/chats/${this.props.user._id}`}>
                            <CustomFab color="primary" size="small" aria-label="add" onClick={() => {}}>
                                <CallIcon style={{color: '#99AABB'}} />
                            </CustomFab>
                        </NavLink>
                        <p>{this.props.langProps.call}</p>
                    </div>}

                    {this.props.user.friendStatus === 0 && <div className="user-btn">
                        <CustomFab color="primary" size="small" aria-label="add" onClick={() => {
                            this.props.usersActions.sendRequest(this.props.userId, this.props.myUser.apiToken)
                        }}>
                            <PersonAddOutlinedIcon style={{color: '#99AABB'}} />
                        </CustomFab>
                        <p>{this.props.langProps.plus_friend}</p>
                    </div>}

                    {this.props.user.friendStatus === 2 && <div className="user-btn">
                        <CustomFab color="primary" size="small" aria-label="add" onClick={() => {
                            this.props.usersActions.acceptRequest(this.props.userId, this.props.myUser.apiToken)
                        }}>
                            <CheckOutlinedIcon style={{color: '#99AABB'}} />
                        </CustomFab>
                        <p>{this.props.langProps.accept}</p>
                    </div>}

                    {(this.props.user.friendStatus === 2 || this.props.user.friendStatus === 1) && <div className="user-btn">
                        <CustomFab color="primary" size="small" aria-label="add" onClick={() => {
                            this.props.usersActions.removeRequest(this.props.userId, this.props.myUser.apiToken)
                        }}>
                            <CloseOutlinedIcon style={{color: '#99AABB'}} />
                        </CustomFab>
                        <p>{this.props.langProps.decline}</p>
                    </div>}

                    {this.props.user.friendStatus === 3 && <div className="user-btn">
                        <CustomFab color="primary" size="small" aria-label="add" onClick={() => {
                            this.props.usersActions.removeRequest(this.props.userId, this.props.myUser.apiToken)
                        }}>
                            <DeleteOutlineOutlinedIcon style={{color: '#99AABB'}} />
                        </CustomFab>
                        <p>{this.props.langProps.remove}</p>
                    </div>}

                    {(this.props.myUser.role === 'moder' || this.props.myUser.role === 'admin') && <div className="user-btn">
                        <CustomFab color="primary" size="small" aria-label="add" onClick={() => {
                            this.props.history.push({
                                search: `?mute=${this.props.user._id}`
                            })
                        }}>
                            <MicOffIcon style={{color: '#99AABB'}} />
                        </CustomFab>
                        <p>Mute</p>
                    </div>}

                    {(this.props.myUser.role === 'moder' || this.props.myUser.role === 'admin') && <div className="user-btn">
                        <CustomFab color="primary" size="small" aria-label="add" onClick={() => {
                            this.props.history.push({
                                search: `?unmute=${this.props.user._id}`
                            })
                        }}>
                            <MicIcon style={{color: '#99AABB'}} />
                        </CustomFab>
                        <p>Unmute</p>
                    </div>}

                    {(this.props.myUser.role === 'moder' || this.props.myUser.role === 'admin') && <div className="user-btn">
                        <CustomFab color="primary" size="small" aria-label="add" onClick={() => {
                            this.props.history.push({
                                search: `?banroom=${this.props.user._id}`
                            })
                        }}>
                            <LockOutlinedIcon style={{color: '#99AABB'}} />
                        </CustomFab>
                        <p>Ban room</p>
                    </div>}

                    {(this.props.myUser.role === 'moder' || this.props.myUser.role === 'admin') && <div className="user-btn">
                        <CustomFab color="primary" size="small" aria-label="add" onClick={() => {
                            this.props.history.push({
                                search: `?unbanroom=${this.props.user._id}`
                            })
                        }}>
                            <LockOpenIcon style={{color: '#99AABB'}} />
                        </CustomFab>
                        <p>Unban room</p>
                    </div>}

                    {(this.props.myUser.role === 'moder' || this.props.myUser.role === 'admin') && <div className="user-btn">
                        <CustomFab color="primary" size="small" aria-label="add" onClick={() => {
                            this.props.history.push({
                                search: `?sendwarning=${this.props.user._id}`
                            })
                        }}>
                            <WarningIcon style={{color: '#99AABB'}} />
                        </CustomFab>
                        <p>Send warning</p>
                    </div>}

                    {(this.props.myUser.role === 'moder' || this.props.myUser.role === 'admin') && <div className="user-btn">
                        <CustomFab color="primary" size="small" aria-label="add" onClick={() => {
                            this.props.history.push({
                                search: `?ban=${this.props.user._id}`
                            })
                        }}>
                            <BlockIcon style={{color: '#99AABB'}} />
                        </CustomFab>
                        <p>Ban</p>
                    </div>}
                </>
            </>
    }
}

const mapStateToProps = state => {
    return {
        users: state.users,
        myUser: state.user,
        call: state.call,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        usersActions: bindActionCreators(usersActions, dispatch),
        callActions: bindActionCreators(callActions, dispatch)
    }
}

export default withLang(languages)(connect(mapStateToProps, mapDispatchToProps)(withRouter(OtherUser)))