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

// Material
import Fab from '@material-ui/core/Fab';
import Skeleton from '@material-ui/lab/Skeleton';
import AddIcon from '@material-ui/icons/Add';
import { withStyles, Tooltip } from '@material-ui/core'
import showLoading from '../../Partials/Loading'
import Avatar from '../../Partials/User/Avatar';
import Chat from '../../Partials/Chat/Chat';

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
        userId: ''
    }

    componentDidMount() {
        this.context.toggleHeader(true)

        this.setState({userId: this.props.match.params.id})
    }

    componentWillUnmount() {
        this.context.toggleHeader(false)
    }

    render() {       
        let dialog = this.props.dialogs.dialogs.find(dialog => dialog.user._id === this.state.userId)

        return (
            <> 
                <div className="col-md-9 dialog-header" style={{order: 2}}>
                    {dialog && <><Avatar style={{
                        width: 32, 
                        height: 32, 
                        fontSize: 14, 
                        fontWeight: 600, 
                        backgroundColor: `rgb(${dialog.user.color})`
                    }} name={dialog.user.name.first.charAt(0) + dialog.user.name.last.charAt(0)} />
                    <div className="user-info">
                        <p className="user-name">{`${dialog.user.name.first} ${dialog.user.name.last}`}</p>
                        <p className="last-message">Last message</p>
                    </div></>}
                </div>
                <div className="col-md-9" style={{order: 4}}>
                    {dialog && <Chat 
                        messages={dialog.messages} 
                        type="dialog" 
                        to={dialog.user.name.first} 
                        dialogId={dialog._id}
                    />}
                </div>            
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
