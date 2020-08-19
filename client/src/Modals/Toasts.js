// App
import React from 'react'

// Material

// Redux
import { connect } from 'react-redux'
import * as usersActions from '../Redux/actions/users'
import { bindActionCreators } from 'redux'

import { withRouter } from 'react-router-dom';
import { withLang } from 'react-multi-language';
import languages from '../languages';
import Toast from './Toast';

class Toasts extends React.Component {
    state = {
        activeTab: 'friends'
    }

    render() {
        return !!this.props.toasts.toasts.length && <div className="bell-toasts">
            {this.props.toasts.toasts.map((toast, index) => {
                return <Toast key={index} toast={toast} />
            })}
        </div>
    }
}

const mapStateToProps = state => {
    return {
        toasts: state.toasts,
        user: state.user
    }
}

function mapDispatchToProps(dispatch) {
    return {
        usersActions: bindActionCreators(usersActions, dispatch),
    }
}

export default withLang(languages)(connect(mapStateToProps, mapDispatchToProps)(withRouter(Toasts)))