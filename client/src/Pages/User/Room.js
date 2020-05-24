// App
import React from 'react'
import {PageSettings} from '../PageSettings'

// Redux
import { connect } from 'react-redux'
import * as roomsActions from '../../Redux/actions/rooms'
import { bindActionCreators } from 'redux'

// Material
import { withRouter } from 'react-router-dom'
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Chat from '../../Partials/Chat/Chat'
import RoomJoinError from '../../Modals/RoomJoinError'
import IconButton from '@material-ui/core/IconButton';

class Room extends React.Component {
    static contextType = PageSettings;

    componentDidMount() {
        this.context.toggleHeader(false)

        this.props.roomsActions.joinRoom({id: this.props.match.params.id, apiToken: this.props.user.apiToken})
    }

    componentWillUnmount() {
        this.props.roomsActions.leaveRoom(this.props.rooms.activeRoom._id, this.props.rooms.activeRoom.lang)
    }

    render() {
        if(this.props.rooms.activeRoom && this.props.rooms.activeRoom.error) {
            return <RoomJoinError isOpen={true} />
        }

        return this.props.rooms.activeRoom && (
            <>  
                <div className="col-md-3">
                    <div className="theme-header">
                        <IconButton className="back-btn" onClick={() => {
                            this.props.history.goBack()
                        }}>
                            <ArrowBackIcon fontSize="small" style={{color: '#008FF7'}} />
                        </IconButton>
                        
                        <h2 className="theme-title">{this.props.rooms.activeRoom.title}</h2>
                    </div>


                    <div className="theme-sidebar">
                        <Chat messages={this.props.rooms.activeRoom.dialog.messages} type="room" to={this.props.rooms.activeRoom.title} dialogId={this.props.rooms.activeRoom.dialog._id} roomId={this.props.rooms.activeRoom._id} />
                    </div>
                </div>
                

                <div className="col-md-9 theme-screen">
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

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Room))