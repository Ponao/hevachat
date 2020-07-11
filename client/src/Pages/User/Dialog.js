// App
import React from 'react'
import { withRouter } from 'react-router-dom'
import {PageSettings} from '../PageSettings'

// Redux
import { connect } from 'react-redux'
import * as dialogsActions from '../../Redux/actions/dialogs'
import * as callActions from '../../Redux/actions/call'
import * as usersActions from '../../Redux/actions/users'
import { bindActionCreators } from 'redux'
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import IconButton from '@material-ui/core/IconButton';

// Material
import Avatar from '../../Partials/User/Avatar';
import Chat from '../../Partials/Chat/Chat';
import SearchIcon from '@material-ui/icons/Search';
import { OnlineDate } from '../../Controllers/TimeController';
import Fab from '@material-ui/core/Fab';
import CallIcon from '@material-ui/icons/Call';
import { withStyles } from '@material-ui/core'
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ActionMenu from '../../Partials/ActionMenu'
import { withLang } from 'react-multi-language'
import languages from '../../languages'

const fabStyles = theme => ({
    root: {
        backgroundColor: '#25D441',
        color: '#fff',
        zIndex: 2,
        width: 36,
        height: 36,
        boxShadow: 'none!important',
        marginRight: '14px',
        '&:hover': {
            backgroundColor: '#25D441',
            boxShadow: 'none',
        }
    }
})

const fabStylesCustom = theme => ({
    root: {
        backgroundColor: '#fff',
        color: '#008FF7',
        zIndex: 2,
        width: 36,
        height: 36,
        boxShadow: 'none!important',
        marginRight: '14px',
        '&:hover': {
            backgroundColor: '#fff',
            boxShadow: 'none',
        }
    }
})

const CallFab = withStyles(fabStyles)(Fab);
const CustomFab = withStyles(fabStylesCustom)(Fab);

class Dialog extends React.PureComponent {
    static contextType = PageSettings;

    state = {
        showBtnAdd: true,
        scrollTop: 0,
    }

    componentDidMount() {
        this.context.toggleHeader(true)
        
        if(window.innerWidth < 769)
            this.context.toggleHeader(false)

        if(!this.props.dialogs.dialogs.find(dialog => dialog.user._id === this.props.match.params.id)) {
            this.props.dialogsActions.dialogGet(this.props.match.params.id, this.props.user.apiToken)
        } else {
            this.props.dialogsActions.updateOnline(this.props.match.params.id, this.props.user.apiToken)
            if(!this.props.dialogs.dialogs.find(dialog => dialog.user._id === this.props.match.params.id).getted)
                this.props.dialogsActions.dialogLoad(this.props.match.params.id, this.props.user.apiToken)
        }
    }

    componentWillUnmount() {
        this.context.toggleHeader(false)
    }

    render() {    
        let dialog = this.props.dialogs.dialogs.find(dialog => dialog.user._id === this.props.match.params.id)

        return (
            <> 
                {dialog && !dialog.isNotFound && <><div className="col-xl-9 col-lg-6 col-md-6 dialog-header" style={{order: 2}}>
                        <IconButton className="back-btn" onClick={() => {
                            this.props.history.push('/')
                        }}>
                            <ArrowBackIcon fontSize="small" style={{color: '#008FF7'}} />
                        </IconButton>
                     <><div style={{display: 'contents'}} onClick={() => {
                         this.props.history.push({
                            search: `?user=${dialog.user._id}`
                         })
                     }}><Avatar style={{
                        width: 36, 
                        height: 36, 
                        fontSize: 14, 
                        fontWeight: 600, 
                        backgroundColor: `rgb(${dialog.user.color})`
                    }} 
                    name={dialog.user.name.first.charAt(0) + dialog.user.name.last.charAt(0)} 
                    avatar={dialog.user.avatar ? dialog.user.avatar : false}
                    /></div>
                    <div className="user-info col" onClick={() => {
                        this.props.history.push({
                            search: `?user=${dialog.user._id}`
                        })
                    }}>
                        <p className="user-name">{`${dialog.user.name.first} ${dialog.user.name.last}`}</p>
                        {!dialog.user.online && <p className="last-message">{OnlineDate(dialog.user.onlineAt)}</p>}
                        {dialog.user.online && <p className="last-message" style={{color: '#35E551'}}>{this.props.langProps.online}</p>}
                    </div></>

                    <div style={{marginLeft: 'auto'}}>
                        {dialog.user._id !== this.props.user._id && this.props.call.status === 'none' && <CallFab color="primary" size="small" aria-label="call" onClick={() => {
                            this.props.callActions.call(dialog.user, this.props.user.apiToken)
                        }}>
                            <CallIcon style={{color: '#fff'}} />
                        </CallFab>}
                        
                        <CustomFab id={'dialog-more-actions-'+dialog._id} color="primary" size="small" aria-label="more">
                            <MoreVertIcon style={{color: '#008FF7'}} />
                        </CustomFab>
                        <ActionMenu event="click" bottom={true} right={true} actions={[
                            {text: this.props.langProps.show_investments, action: () => {
                                this.props.history.push({
                                    search: `?modal=investments`
                                })
                            }},
                        ]} from={'dialog-more-actions-'+dialog._id} />
                    </div>
                </div>
                <div className="col-xl-9 col-lg-6 col-md-6" style={{order: 4}}>
                    <Chat 
                        messages={dialog.messages}
                        loading={dialog && !dialog.getted} 
                        type="dialog" 
                        userName={dialog.user.name.first}
                        typing={dialog.typing}
                        userId={dialog.user._id}
                        to={dialog.user.name.first} 
                        dialogId={dialog._id}
                        dialog={dialog}
                    />
                </div></>}

                {dialog && dialog.isNotFound && <>
                    <div className="col-xl-9 col-lg-6 col-md-6" style={{order: 2}}></div>
                    <div className="col-xl-9 col-lg-6 col-md-6" style={{order: 4}}>
                        <div className="data-empty">
                            <SearchIcon style={{color: '#B8C3CF', fontSize: 54, margin: '0 auto', display: 'block'}} />

                            <p>{this.props.langProps.user_not_found}</p>
                        </div>
                    </div>
                </>}     
            </>
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.user,
        dialogs: state.dialogs,
        call: state.call
    }
}

function mapDispatchToProps(dispatch) {
    return {
        dialogsActions: bindActionCreators(dialogsActions, dispatch),
        usersActions: bindActionCreators(usersActions, dispatch),
        callActions: bindActionCreators(callActions, dispatch)
    }
}

export default withLang(languages)(connect(mapStateToProps, mapDispatchToProps)(withRouter(Dialog)))
