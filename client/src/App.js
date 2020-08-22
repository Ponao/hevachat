// App
import React from 'react'
import './App.css'
import {PageSettings} from './Pages/PageSettings'
import 'react-toastify/dist/ReactToastify.css';
import { MultiLang, withLang } from "react-multi-language";

// Partials
import UserSidebar from './Partials/UserSidebar'

// Router
import AppRouter from './Router'
import { connect } from 'react-redux'
import { CircularProgress } from '@material-ui/core';
import languages from './languages';

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
                {this.props.user.isAuth && this.props.app.connecting && <div className="app-status-connecting">
                    <CircularProgress style={{
                        color: '#fff',
                        width: 20,
                        height: 20,
                        marginRight: 10
                    }} />
                    <span>{this.props.langProps.connecting}...</span>
                </div>}

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
        user: state.user,
        app: state.app
    }
}

export default withLang(languages)(connect(mapStateToProps)(App))
