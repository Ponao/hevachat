// App
import React from 'react'

import {PageSettings} from '../PageSettings'

// Redux
import { connect } from 'react-redux'

class Languages extends React.Component {
    static contextType = PageSettings;

    componentDidMount() {
        this.context.toggleHeader(true)
    }

    componentWillUnmount() {
        this.context.toggleHeader(false)
    }

    updateRoomLang(lang) {
        fetch(`http://localhost:8000/api/user/update-room-lang`, {
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
                <div className="col-md-9"></div>
                <div className="col-md-3 sidebar">
                    <h2 className="sidebar-title">Language</h2>

                    <span onClick={() => {
                        this.updateRoomLang('eng')
                    }}>English</span>
                    <span onClick={() => {
                        this.updateRoomLang('rus')
                    }}>Russian</span>
                </div>
                <div className="col-md-9">
                    
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

export default connect(mapStateToProps)(Languages)