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
import LanguageItem from '../Partials/Language/LanguageItem'
import { withLang } from 'react-multi-language'
import languages from '../languages'

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
                    <h2 className="sidebar-title">{this.props.langProps.language}</h2>

                    <LanguageItem onClick={() => {
                        this.updateRoomLang('eng')
                    }} title={this.props.langProps.english} />
                    <LanguageItem onClick={() => {
                        this.updateRoomLang('rus')
                    }} title={this.props.langProps.russian} />
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

export default withLang(languages)(connect(mapStateToProps, mapDispatchToProps)(withRouter(Languages)))