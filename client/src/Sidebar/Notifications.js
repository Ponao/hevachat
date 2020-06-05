// App
import React from 'react'

import {PageSettings} from '../Pages/PageSettings'

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
                <div className="col-xl-3 col-lg-6 col-md-6 sidebar">
                    <h2 className="sidebar-title">Notifications</h2>
                </div>
            </>
        )
    }
}

export default Notifications
