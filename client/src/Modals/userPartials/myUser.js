// App
import React from 'react'
import Modal from 'react-modal';

// Material
import Fab from '@material-ui/core/Fab';
import BookOutlinedIcon from '@material-ui/icons/BookOutlined';
import { withStyles } from '@material-ui/core'

// Redux
import { connect } from 'react-redux'
import * as usersActions from '../../Redux/actions/users'
import { bindActionCreators } from 'redux'
import {urlApi} from '../../config'

import SocketController from '../../Controllers/SocketController';
import Avatar from '../../Partials/User/Avatar';
import { NavLink, withRouter } from 'react-router-dom';
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined';
import PermMediaOutlinedIcon from '@material-ui/icons/PermMediaOutlined';

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

class MyUser extends React.Component {
    state = {
        activeTab: 'main'
    }

    render() {
        return <>
            <Avatar 
                style={{width: 80, height: 80, fontSize: 28, lineHeight: '28px', fontWeight: 600, backgroundColor: `rgb(${this.props.user.color})`}} 
                name={this.props.user.name.first.charAt(0)+this.props.user.name.last.charAt(0)} 
            />

            <p className="user-profile-name">{this.props.user.name.first} {this.props.user.name.last}</p>
            <p className="user-profile-city">Moscow</p>
            
            <div className="user-btn">
                <CustomFab color="primary" size="small" aria-label="add" onClick={() => {}}>
                    <SettingsOutlinedIcon style={{color: '#99AABB'}} />
                </CustomFab>
                <p>Settings</p>
            </div>

            <div className="user-btn">
                <CustomFab color="primary" size="small" aria-label="add" onClick={() => {
                    this.props.history.push({
                        search: `?modal=contacts`
                    })
                }}>
                    <BookOutlinedIcon style={{color: '#99AABB'}} />
                </CustomFab>
                <p>Contacts</p>
            </div>

            <div className="user-btn">
                <CustomFab color="primary" size="small" aria-label="add" onClick={() => {}}>
                    <PermMediaOutlinedIcon style={{color: '#99AABB'}} />
                </CustomFab>
                <p>Media</p>
            </div>
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