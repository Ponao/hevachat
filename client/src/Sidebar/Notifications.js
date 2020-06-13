// App
import React from 'react'

import {PageSettings} from '../Pages/PageSettings'
import { withRouter } from 'react-router-dom';
import { Scrollbars } from 'react-custom-scrollbars';
import NotificationsNoneIcon from '@material-ui/icons/NotificationsNone';
import { connect } from 'react-redux';
import { CircularProgress } from '@material-ui/core';
import NotificationItem from '../Partials/Notifications/NotificationItem'
import * as notificationsActions from '../Redux/actions/notifications'
import { bindActionCreators } from 'redux'

class Notifications extends React.Component {
    static contextType = PageSettings;

    componentDidMount() {
        this.context.toggleHeader(true)

        if(!this.props.notifications.getted) {
            this.props.notificationsActions.notificationsGet(this.props.user.apiToken)
        }
    }

    componentWillUnmount() {
        this.context.toggleHeader(false)
    }

    render() {
        return (
            <> 
                <div className="col-xl-3 col-lg-6 col-md-6 sidebar">
                    <h2 className="sidebar-title">Notifications</h2>

                    <Scrollbars
                        ref={(ref) => {this.roomsBlock = ref}}
                        renderTrackVertical={props => <div className="track-vertical"/>}
                        renderThumbVertical={props => <div className="thumb-vertical"/>}
                        className="scroll"
                        style={{height: 'calc(100% - 78px)'}}
                        autoHide
                    >
                        {this.props.notifications.isFetching && <CircularProgress style={{
                            color: '#008FF7',
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            margin: 'auto',
                            top: 'calc(50% - 20px)'
                        }} />}
                        {this.props.notifications.notifications.map((notification, index) => {
                            return (
                                <NotificationItem key={index} notification={notification} />
                            )
                        })}
                    </Scrollbars>

                    {!this.props.notifications.isFetching &&!this.props.notifications.notifications.length && <div className="data-empty">
                        <NotificationsNoneIcon style={{color: '#B8C3CF', fontSize: 54, margin: '0 auto', display: 'block'}} />

                        <p>Here will placed your notifications</p>
                    </div>}
                </div>
            </>
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.user,
        notifications: state.notifications
    }
}

function mapDispatchToProps(dispatch) {
    return {
        notificationsActions: bindActionCreators(notificationsActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Notifications))
