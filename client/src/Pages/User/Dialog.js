// App
import React from 'react'
import { Scrollbars } from 'react-custom-scrollbars';
import { withRouter } from 'react-router-dom'
import {PageSettings} from '../PageSettings'

// Redux
import { connect } from 'react-redux'
import * as dialogsActions from '../../Redux/actions/dialogs'
import { bindActionCreators } from 'redux'
import RoomItem from '../../Partials/Room/RoomItem'
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import IconButton from '@material-ui/core/IconButton';

// Material
import Fab from '@material-ui/core/Fab';
import Skeleton from '@material-ui/lab/Skeleton';
import AddIcon from '@material-ui/icons/Add';
import { withStyles } from '@material-ui/core'
import showLoading from '../../Partials/Loading'
import Avatar from '../../Partials/User/Avatar';
import Chat from '../../Partials/Chat/Chat';
import SearchIcon from '@material-ui/icons/Search';

const fabStyles = theme => ({
    root: {
        backgroundColor: '#008FF7',
        position: 'absolute',
        bottom: 20,
        right: 20,
        '&:hover': {
            backgroundColor: '#008FF7',
        }
    }
})

const CustomFab = withStyles(fabStyles)(Fab);

class Dialog extends React.Component {
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
                     <><Avatar style={{
                        width: 32, 
                        height: 32, 
                        fontSize: 14, 
                        fontWeight: 600, 
                        backgroundColor: `rgb(${dialog.user.color})`
                    }} name={dialog.user.name.first.charAt(0) + dialog.user.name.last.charAt(0)} />
                    <div className="user-info">
                        <p className="user-name">{`${dialog.user.name.first} ${dialog.user.name.last}`}</p>
                        <p className="last-message">Last message</p>
                    </div></>
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

                            <p>User not found</p>
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
        dialogs: state.dialogs
    }
}

function mapDispatchToProps(dispatch) {
    return {
        dialogsActions: bindActionCreators(dialogsActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Dialog))
