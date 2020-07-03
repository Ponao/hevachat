// App
import React from 'react'
import {PageSettings} from '../Pages/PageSettings'
import RoomItem from '../Partials/Room/RoomItem'
import { Scrollbars } from 'react-custom-scrollbars';

// Redux
import { connect } from 'react-redux'
import * as roomsActions from '../Redux/actions/rooms'
import { bindActionCreators } from 'redux'

// Material
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import { withStyles, Tooltip, CircularProgress } from '@material-ui/core'
import WarningIcon from '@material-ui/icons/Warning';
import AppsIcon from '@material-ui/icons/Apps';
import { withRouter } from 'react-router-dom';
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

        if((this.roomsBlock.getScrollHeight() - (this.roomsBlock.getClientHeight() + this.roomsBlock.getScrollTop())) === 0) {
            this.props.roomsActions.roomsLoad(this.props.user.apiToken, this.props.user.roomLang)
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
                <div className="col-xl-3 col-lg-6 col-md-6 sidebar" style={{overflow: 'hidden'}}>
                    <h2 className="sidebar-title">{this.props.langProps.rooms}</h2>

                    <Scrollbars
                        ref={(ref) => {this.roomsBlock = ref}}
                        renderTrackVertical={props => <div className="track-vertical"/>}
                        renderThumbVertical={props => <div className="thumb-vertical"/>}
                        className="scroll"
                        onScroll={() => {this.onScroll()}}
                        style={{height: 'calc(100% - 78px)'}}
                        autoHide
                    >
                        {this.props.rooms.isFetching && <CircularProgress style={{
                            color: '#008FF7',
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            margin: 'auto',
                            top: 'calc(50% - 20px)'
                        }} />}
                        {this.props.rooms.rooms.map((room, index) => {
                            return (
                                <RoomItem key={index} room={room} />
                            )
                        })}
                    </Scrollbars>

                    {!this.props.rooms.isFetching && !this.props.rooms.isError && !this.props.rooms.rooms.length && <div className="data-empty">
                        <AppsIcon style={{color: '#B8C3CF', fontSize: 54, margin: '0 auto', display: 'block'}} />

                        <p>{this.props.langProps.create_your_first_room}</p>
                    </div>}

                    {!this.props.rooms.isFetching && this.props.rooms.isError && <div className="data-empty">
                        <WarningIcon style={{color: '#B8C3CF', fontSize: 54, margin: '0 auto', display: 'block'}} />

                        <p>{this.props.langProps.something_goes_wrong}</p>

                        <button onClick={() => {this.props.roomsActions.roomsGet(this.props.user.apiToken, this.props.user.roomLang)}} className="button-gray" type="submit" style={{width: 'max-content'}}>Retry</button>
                    </div>}

                    <Tooltip title={this.props.langProps.create_room} className={`scroll-to-bottom ${this.state.showBtnAdd ? 'active' : ''}`} placement="top">
                        <CustomFab color="primary" size="small" aria-label="add" onClick={() => {
                            this.props.history.push({
                                search: "?act=newRoom"
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
        rooms: state.rooms
    }
}

function mapDispatchToProps(dispatch) {
    return {
        roomsActions: bindActionCreators(roomsActions, dispatch),
    }
}

export default withLang(languages)(connect(mapStateToProps, mapDispatchToProps)(withRouter(Rooms)))