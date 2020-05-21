// App
import React from 'react'

import {PageSettings} from '../PageSettings'

class Notifications extends React.Component {
    static contextType = PageSettings;

    componentDidMount() {
        this.context.toggleHeader(true)
    }

    componentWillUnmount() {
        this.context.toggleHeader(false)
    }

    render() {
        return (
            <> 
                <div className="col-md-9"></div>
                <div className="col-md-3 sidebar">
                    <h2 className="sidebar-title">Notifications</h2>
                </div>
                <div className="col-md-9">
                    CONTENT
                </div>
            </>
        )
    }
}

export default Notifications
