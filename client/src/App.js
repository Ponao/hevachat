// App
import React from 'react'
import './App.css'
import {PageSettings} from './Pages/PageSettings'

// Partials
import UserSidebar from './Partials/UserSidebar'

// Router
import AppRouter from './Router'
import { connect } from 'react-redux'
import ModalUser from './Modals/User'

class App extends React.Component {
    constructor(props) {
        super(props);
        this.toggleHeader = (value) => {
            this.setState({userHeader: value})
        }

        this.state = {
            userHeader: false,
            toggleHeader: this.toggleHeader
        }
    }

    

    render() {
        return (
            <PageSettings.Provider value={this.state}>
                <div className="container-fluid">
                    <div className="row">
                        {this.state.userHeader && <UserSidebar />}
                        <AppRouter />
                        {!!this.props.users.activeUserId && <ModalUser userId={this.props.users.activeUserId} />}
                    </div>
                </div>
            </PageSettings.Provider>
        )
    }
}

const mapStateToProps = state => {
    return {
        users: state.users
    }
}

export default connect(mapStateToProps)(App)
