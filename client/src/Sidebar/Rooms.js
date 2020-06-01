// App
import React from 'react'
import {PageSettings} from '../Pages/PageSettings'
import RoomItem from '../Partials/Room/RoomItem'
import SocketController from '../Controllers/SocketController'
import { Scrollbars } from 'react-custom-scrollbars';

// Modal
import ModalCreateRoom from '../Modals/CreateRoom'

// Redux
import { connect } from 'react-redux'
import * as roomsActions from '../Redux/actions/rooms'
import { bindActionCreators } from 'redux'

// Material
import Fab from '@material-ui/core/Fab';
import Skeleton from '@material-ui/lab/Skeleton';
import AddIcon from '@material-ui/icons/Add';
import { withStyles, Tooltip } from '@material-ui/core'
import showLoading from '../Partials/Loading'

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

class Rooms extends React.Component {
    static contextType = PageSettings;

    state = {
        isOpenCreateRoom: false,
        scrollTop: 0,
        showBtnAdd: true
    }

    componentDidMount() {
        this.context.toggleHeader(true)

        if(!this.props.rooms.getted) {
            this.props.roomsActions.roomsGet(this.props.user.apiToken, this.props.user.roomLang)
        }
    }

    onScroll() {
        if(this.state.scrollTop < this.roomsBlock.getScrollTop()) {
            if(this.state.showBtnAdd)
                this.setState({showBtnAdd: false})
        } else {
            if(!this.state.showBtnAdd)
                this.setState({showBtnAdd: true})
        }

        this.setState({scrollTop: this.roomsBlock.getScrollTop()})
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
                <ModalCreateRoom isOpen={this.state.isOpenCreateRoom} close={() => {this.setState({isOpenCreateRoom: false})}} />

                <div className="col-md-3 sidebar" style={{overflow: 'hidden'}}>
                    <h2 className="sidebar-title">Rooms</h2>

                    <Scrollbars
                        ref={(ref) => {this.roomsBlock = ref}}
                        renderTrackVertical={props => <div className="track-vertical"/>}
                        renderThumbVertical={props => <div className="thumb-vertical"/>}
                        className="scroll"
                        onScroll={() => {this.onScroll()}}
                        style={{height: 'calc(100% - 78px)'}}
                        autoHide
                    >
                        {this.props.rooms.isFetching && showLoading(<div className="room-item">
                            <Skeleton variant="circle" width={40} height={40} />
                            <Skeleton variant="text" style={{marginLeft: 12, flex: '1 1'}} />
                        </div>)}
                        {this.props.rooms.rooms.map((room, index) => {
                            return (
                                <RoomItem key={index} room={room} />
                            )
                        })}
                    </Scrollbars>

                    <Tooltip title="Create room" className={`scroll-to-bottom ${this.state.showBtnAdd ? 'active' : ''}`} placement="top">
                        <CustomFab color="primary" size="small" aria-label="add" onClick={() => {this.setState({isOpenCreateRoom: true})}}>
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
        rooms: state.rooms
    }
}

function mapDispatchToProps(dispatch) {
    return {
        roomsActions: bindActionCreators(roomsActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Rooms)