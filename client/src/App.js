// App
import React from 'react'
import './App.css'
import {PageSettings} from './Pages/PageSettings'

// Partials
import UserSidebar from './Partials/UserSidebar'

// Router
import AppRouter from './Router'

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
                    </div>
                </div>
            </PageSettings.Provider>
        )
    }
}

export default App
