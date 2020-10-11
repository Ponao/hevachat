// App
import React from 'react'
import { withLang } from 'react-multi-language'
import { withRouter } from 'react-router-dom'
import languages from '../languages'
import SupportNoAuth from '../Modals/SupportNoAuth'

// Router
// import {
//     BrowserRouter as Router,
// } from "react-router-dom"

class SupportPage extends React.Component {
    render() {
        return (
            <SupportNoAuth isOpen={true} close={() => {
                this.props.history.goBack()
            }} />
        )
    }
}

export default withLang(languages)(withRouter(SupportPage))
