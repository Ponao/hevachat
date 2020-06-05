// App
import React from 'react'
import {PageSettings} from '../Pages/PageSettings'

// Redux
import { connect } from 'react-redux'
import * as userActions from '../Redux/actions/user'
import * as roomsActions from '../Redux/actions/rooms'
import { bindActionCreators } from 'redux'
import { withRouter } from 'react-router-dom'
import {urlApi} from '../config'
import SocketController from '../Controllers/SocketController'

class Languages extends React.Component {
    static contextType = PageSettings;

    componentDidMount() {
        this.context.toggleHeader(true)
    }

    componentWillUnmount() {
        this.context.toggleHeader(false)
    }

    updateRoomLang(lang) {
        this.props.userActions.updateRoomLang(lang)

        this.props.history.push('/')

        this.props.roomsActions.roomsGet(this.props.user.apiToken, lang)

        SocketController.joinLang(lang)

        fetch(`${urlApi}/api/user/update-room-lang`, {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.props.user.apiToken}`,
            },
            body: JSON.stringify({
                lang
            })
        })
    }

    render() {
        return (
            <> 
                <div className="col-xl-3 col-lg-6 col-md-6 sidebar">
                    <h2 className="sidebar-title">Language</h2>

                    <span style={{color: this.props.user.roomLang === 'eng' ? 'red' : '#000'}} onClick={() => {
                        this.updateRoomLang('eng')
                    }}>English</span>
                    <span style={{color: this.props.user.roomLang === 'rus' ? 'red' : '#000'}} onClick={() => {
                        this.updateRoomLang('rus')
                    }}>Russian</span>
                </div>
            </>
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.user
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userActions: bindActionCreators(userActions, dispatch),
        roomsActions: bindActionCreators(roomsActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Languages))