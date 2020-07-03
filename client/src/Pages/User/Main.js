// App
import React from 'react'

import {PageSettings} from '../PageSettings'

// Redux
import { connect } from 'react-redux'

class Main extends React.Component {
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
                <div className="col-md-9" style={{order: 2}}></div>
                <div className="col-md-9" style={{order: 4}}></div>            
            </>
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.user,
        rooms: state.rooms,
        dialogs: state.dialogs
    }
}

export default connect(mapStateToProps)(Main)
