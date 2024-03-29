// App
import React from 'react'

// Material
import Fab from '@material-ui/core/Fab';
import BookOutlinedIcon from '@material-ui/icons/BookOutlined';
import { withStyles } from '@material-ui/core'

// Redux
import { connect } from 'react-redux'
import * as usersActions from '../../Redux/actions/users'
import * as userActions from '../../Redux/actions/user'
import { bindActionCreators } from 'redux'

import Avatar from '../../Partials/User/Avatar';
import { withRouter } from 'react-router-dom';
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined';
import ListAltRoundedIcon from '@material-ui/icons/ListAltRounded';
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';
import { withLang } from 'react-multi-language';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import languages from '../../languages';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import PolicyOutlinedIcon from '@material-ui/icons/PolicyOutlined';
import ContactSupportOutlinedIcon from '@material-ui/icons/ContactSupportOutlined';

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
            <label style={{cursor: 'pointer'}} className="upload-avatar">
                <Avatar 
                    style={{width: 80, height: 80, fontSize: 28, lineHeight: '28px', fontWeight: 600, backgroundColor: `rgb(${this.props.user.color})`}} 
                    name={this.props.user.name.first.charAt(0)+this.props.user.name.last.charAt(0)}
                    avatar={this.props.user.avatar ? this.props.user.avatar : false}
                />
                <AddAPhotoIcon className="upload-avatar-icon" style={{color: '#fff'}} />
                <div className="upload-avatar-background"></div>
                <input 
                    type="file"
                    onChange={(e) => {this.props.userActions.uploadAvatar(e, this.props.user.apiToken)}}
                    id="uploadAvatar" 
                    style={{display: 'none'}} 
                    accept="image/jpeg,image/png" 
                />
            </label>

            <p className="user-profile-name">{this.props.user.name.first} {this.props.user.name.last}</p>
            <p className="user-profile-city">{this.props.user.city ? this.props.user.city : this.props.langProps.not_indicated}</p>

            <div className="user-btn">
                <CustomFab color="primary" size="small" aria-label="add" onClick={() => {
                    this.props.history.push({
                        search: `?modal=payments`
                    })
                }}>
                    <ListAltRoundedIcon style={{color: '#99AABB'}} />
                </CustomFab>
                <p>{this.props.langProps.my_orders}</p>
            </div>

            

            <div className="user-btn">
                <CustomFab color="primary" size="small" aria-label="add" onClick={() => {
                    this.props.history.push('/payment')
                }}>
                    <AddCircleOutlineIcon style={{color: '#99AABB'}} />
                </CustomFab>
                <p>{this.props.langProps.tariffs}</p>
            </div>

            <div className="user-btn">
                <CustomFab color="primary" size="small" aria-label="add" onClick={() => {
                    this.props.history.push({
                        search: `?modal=settings`
                    })
                }}>
                    <SettingsOutlinedIcon style={{color: '#99AABB'}} />
                </CustomFab>
                <p>{this.props.langProps.settings}</p>
            </div>

            <div className="user-btn">
                <CustomFab color="primary" size="small" aria-label="add" onClick={() => {
                    this.props.history.push({
                        search: `?modal=contacts`
                    })
                }}>
                    <BookOutlinedIcon style={{color: '#99AABB'}} />
                </CustomFab>
                <p>{this.props.langProps.contacts}</p>
            </div>

            <div className="user-btn">
                <CustomFab color="primary" size="small" aria-label="add" onClick={() => {
                    this.props.history.push('/about')
                }}>
                    <InfoOutlinedIcon style={{color: '#99AABB'}} />
                </CustomFab>
                <p>{this.props.langProps.about}</p>
            </div>

            
            <div className="user-btn">
                <CustomFab color="primary" size="small" aria-label="add" onClick={() => {
                    this.props.history.push('/privacy-policy')
                }}>
                    <PolicyOutlinedIcon style={{color: '#99AABB'}} />
                </CustomFab>
                <p>{this.props.langProps.policy}</p>
            </div>

            <div className="user-btn">
                <CustomFab color="primary" size="small" aria-label="add" onClick={() => {
                    this.props.history.push({
                        search: '?modal=support'
                    })
                }}>
                    <ContactSupportOutlinedIcon style={{color: '#99AABB'}} />
                </CustomFab>
                <p>{this.props.langProps.support}</p>
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
        userActions: bindActionCreators(userActions, dispatch),
    }
}

export default withLang(languages)(connect(mapStateToProps, mapDispatchToProps)(withRouter(MyUser)))