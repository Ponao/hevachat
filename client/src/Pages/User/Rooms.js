// App
import React from 'react'
import {PageSettings} from '../PageSettings'
import RoomItem from '../../Partials/Room/RoomItem'
import SocketController from '../../Controllers/SocketController'

// Modal
import ModalCreateRoom from '../../Modals/CreateRoom'

// Redux
import { connect } from 'react-redux'
import * as roomsActions from '../../Redux/actions/rooms'
import { bindActionCreators } from 'redux'

// Material
import Fab from '@material-ui/core/Fab';
import Skeleton from '@material-ui/lab/Skeleton';
import AddIcon from '@material-ui/icons/Add';
import { withStyles, Tooltip } from '@material-ui/core'
import showLoading from '../../Partials/Loading'

const skeletonCount = 20

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
        isOpenCreateRoom: false
    }

    componentDidMount() {
        this.context.toggleHeader(true)

        if(!this.props.rooms.getted) {
            SocketController.joinLang(this.props.user.roomLang)
            this.props.roomsActions.roomsGet(this.props.user.apiToken, this.props.user.roomLang)
        }
    }

    componentWillUnmount() {
        this.context.toggleHeader(false)
    }

    render() {
        return (
            <>
                <ModalCreateRoom isOpen={this.state.isOpenCreateRoom} close={() => {this.setState({isOpenCreateRoom: false})}} />

                <div className="col-md-9"></div>
                <div className="col-md-3 sidebar">
                    <h2 className="sidebar-title">Rooms</h2>

                    {this.props.rooms.isFetching && showLoading(<div className="room-item">
                        <Skeleton variant="circle" width={40} height={40} />
                        <Skeleton variant="text" style={{marginLeft: 12, flex: '1 1'}} />
                    </div>)}

                    {this.props.rooms.rooms.map((room, index) => {
                        return (
                            <RoomItem key={index} room={room} />
                        )
                    })}

                    <Tooltip title="Create room" placement="top">
                        <CustomFab color="primary" size="small" aria-label="add" onClick={() => {this.setState({isOpenCreateRoom: true})}}>
                            <AddIcon />
                        </CustomFab>
                    </Tooltip>
                </div>
                <div className="col-md-9">
                    CONTENT
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