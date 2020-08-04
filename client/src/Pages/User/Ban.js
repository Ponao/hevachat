// App
import React from 'react'

import {PageSettings} from '../PageSettings'
import '../../Css/Partials/Ban.css'

// Redux
import { connect } from 'react-redux'
import { urlApi } from '../../config';
import { withRouter } from 'react-router-dom';
import { withCookies } from 'react-cookie';

class Payment extends React.Component {
    static contextType = PageSettings;

    state = {
        isFetching: true,
        tariffs: [],
        redirect: false
    }

    componentDidMount() {
        this.context.toggleHeader(false)
    }

    componentWillUnmount() {
        this.context.toggleHeader(false)
    }

    render() {
        return (
            <> 
                <div className="ban-page">
                    <p className="ban-title">Ooops...</p>

                    <p className="ban-subtitle">You have ban to <span style={{color: '#008FF7'}}>{new Date(this.props.ban.date).toLocaleString()}</span></p>

                    <button className="button-blue" onClick={() => {
                        const { cookies } = this.props;
                        cookies.remove("apiToken", { path: "/" });
                        window.location.reload()
                    }} style={{width: 'max-content', marginTop: 25}}>Logout</button>
                </div>        
            </>
        )
    }
}

const mapStateToProps = state => {
    return {
        ban: state.ban,
    }
}

export default connect(mapStateToProps)(withRouter(withCookies(Payment)))
