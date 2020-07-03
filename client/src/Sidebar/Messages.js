// App
import React from 'react'
import { Scrollbars } from 'react-custom-scrollbars';

import {PageSettings} from '../Pages/PageSettings'

// Redux
import { connect } from 'react-redux'
import * as dialogsActions from '../Redux/actions/dialogs'
import { bindActionCreators } from 'redux'

// Material
import Fab from '@material-ui/core/Fab';
import Skeleton from '@material-ui/lab/Skeleton';
import AddIcon from '@material-ui/icons/Add';
import { withStyles, Tooltip } from '@material-ui/core'
import showLoading from '../Partials/Loading'
import DialogItem from '../Partials/Dialog/DialogItem';
import { withRouter } from 'react-router-dom';
import ChatBubbleIcon from '@material-ui/icons/ChatBubble';
import { withLang } from 'react-multi-language';
import languages from '../languages';

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

class Messages extends React.Component {
    static contextType = PageSettings;

    state = {
        showBtnAdd: true,
        scrollTop: 0
    }

    componentDidMount() {
        this.context.toggleHeader(true)

        // if(!this.props.dialogs.getted) {
        //     this.props.dialogsActions.dialogsGet(this.props.user.apiToken)
        // }
    }

    onScroll() {
        if(this.state.scrollTop < this.messagesBlock.getScrollTop()) {
            if(this.state.showBtnAdd)
                this.setState({showBtnAdd: false})
        } else {
            if(!this.state.showBtnAdd)
                this.setState({showBtnAdd: true})
        }

        if((this.messagesBlock.getScrollHeight() - (this.messagesBlock.getClientHeight() + this.messagesBlock.getScrollTop())) === 0) {
            this.props.dialogsActions.dialogsLoad(this.props.user.apiToken)
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
                <div className="col-xl-3 col-lg-6 col-md-6 sidebar" style={{overflow: 'hidden'}}>
                    <h2 className="sidebar-title">{this.props.langProps.chats}</h2>

                    <Scrollbars
                        ref={(ref) => {this.messagesBlock = ref}}
                        renderTrackVertical={props => <div className="track-vertical"/>}
                        renderThumbVertical={props => <div className="thumb-vertical"/>}
                        className="scroll"
                        onScroll={() => {this.onScroll()}}
                        style={{height: 'calc(100% - 78px)'}}
                        autoHide
                    >
                        {this.props.dialogs.isFetching && showLoading(<div className="room-item">
                            <Skeleton variant="circle" width={40} height={40} />
                            <Skeleton variant="text" style={{marginLeft: 12, flex: '1 1'}} />
                        </div>)}
                        {this.props.dialogs.dialogs.map((dialog, index) => {
                            return dialog.lastMessage && (
                                <DialogItem key={index} dialogId={dialog._id} typing={dialog.typing} noRead={dialog.noRead} lastMessage={dialog.lastMessage} user={dialog.user} />
                            )
                        })}
                    </Scrollbars>

                    {!this.props.dialogs.dialogs.find(x => x.lastMessage) && <div className="data-empty">
                        <ChatBubbleIcon style={{color: '#B8C3CF', fontSize: 54, margin: '0 auto', display: 'block'}} />

                        <p>{this.props.langProps.you_dont_have_chats}</p>
                    </div>}

                    <Tooltip title="Create dialog" className={`scroll-to-bottom ${this.state.showBtnAdd ? 'active' : ''}`} placement="top">
                        <CustomFab color="primary" size="small" aria-label="add" onClick={() => {
                            this.props.history.push({
                                search: "?act=newChat"
                            })
                        }}>
                            <AddIcon />
                        </CustomFab>
                    </Tooltip>
                </div>
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

export default withLang(languages)(connect(mapStateToProps, mapDispatchToProps)(withRouter(Messages)))
