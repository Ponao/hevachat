// App
import React from 'react'
import './App.css'
import {PageSettings} from './Pages/PageSettings'
import 'react-toastify/dist/ReactToastify.css';
import { MultiLang } from "react-multi-language";

// Partials
import UserSidebar from './Partials/UserSidebar'

// Router
import AppRouter from './Router'
import { connect } from 'react-redux'

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
                        {this.props.user.isAuth && <UserSidebar show={this.state.userHeader} />}
                        <AppRouter />
                        <MultiLang lang={this.props.user.isAuth ? this.props.user.lang : 'en'}/>
                    </div>
                </div>
            </PageSettings.Provider>
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.user
    }
}

export default connect(mapStateToProps)(App)
