// App
import React from 'react'
import { Scrollbars } from 'react-custom-scrollbars';

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

class Main extends React.Component {
    static contextType = PageSettings;

    state = {
        showBtnAdd: true,
        scrollTop: 0
    }

    componentDidMount() {
        this.context.toggleHeader(true)

        if(!this.props.dialogs.getted) {
            this.props.dialogsActions.dialogsGet(this.props.user.apiToken)
        }
    }

    onScroll() {
        if(this.state.scrollTop < this.messagesBlock.getScrollTop()) {
            if(this.state.showBtnAdd)
                this.setState({showBtnAdd: false})
        } else {
            if(!this.state.showBtnAdd)
                this.setState({showBtnAdd: true})
        }

        this.setState({scrollTop: this.messagesBlock.getScrollTop()})
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(nextState.scrollTop !== this.state.scrollTop) {
            return false
        }

        return true
    }

    componentWillUnmount() {
        this.context.toggleHeader(false)
    }

    render() {
        return (
            <> 
                <div className="col-md-9" style={{order: 2}}></div>
                <div className="col-md-9" style={{order: 4}}></div>            
            </>
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.user,
        rooms: state.rooms,
        dialogs: state.dialogs
    }
}

function mapDispatchToProps(dispatch) {
    return {
        dialogsActions: bindActionCreators(dialogsActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Main)
