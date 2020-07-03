// App
import React from 'react'
import { Scrollbars } from 'react-custom-scrollbars';

// Material
import GroupIcon from '@material-ui/icons/Group';

// Redux
import { connect } from 'react-redux'
import * as usersActions from '../../Redux/actions/users'
import { bindActionCreators } from 'redux'

import { withRouter } from 'react-router-dom';
import UserItem from '../../Partials/User/UserItem';
import { CircularProgress } from '@material-ui/core';

class Contacts extends React.Component {
    componentDidMount() {
        if(!this.props.users.pending.getted) {
            this.props.usersActions.pendingGet(this.props.user.apiToken)
        }
    }

    onScroll() {

    }
    
    render() {
        return <Scrollbars
            ref={(ref) => {this.roomsBlock = ref}}
            renderTrackVertical={props => <div className="track-vertical"/>}
            renderThumbVertical={props => <div className="thumb-vertical"/>}
            className="scroll"
            onScroll={() => {this.onScroll()}}
            style={{height: 340}}
            autoHide
        >
            {this.props.users.pending.isFetching && <CircularProgress style={{
                    color: '#008FF7',
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    margin: 'auto',
                    top: 'calc(50% - 20px)'
                }} />}
            {this.props.users.pending.users.map((user, index) => {
                return (
                    <UserItem key={index} user={user} onClick={(id) => {this.props.onClick(id)}} />
                )
            })}
            {(!this.props.users.pending.users.length && !this.props.users.pending.isFetching) && <div className="data-empty">
                <GroupIcon style={{color: '#B8C3CF', fontSize: 54, margin: '0 auto', display: 'block'}} />

                <p>Outgoing requests will be displayed here</p>
            </div>}
        </Scrollbars>
    }
}

const mapStateToProps = state => {
    return {
        users: state.users,
        user: state.user
    }
}

function mapDispatchToProps(dispatch) {
    return {
        usersActions: bindActionCreators(usersActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Contacts))