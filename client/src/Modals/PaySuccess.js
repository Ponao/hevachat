// App
import React from 'react'
import Modal from 'react-modal';

// Redux
import { connect } from 'react-redux'
import * as usersActions from '../Redux/actions/users'
import { bindActionCreators } from 'redux'
import { withCookies } from 'react-cookie'
import { withRouter } from 'react-router-dom';
import { withLang } from 'react-multi-language';
import languages from '../languages';
import CheckCircleOutlineRoundedIcon from '@material-ui/icons/CheckCircleOutlineRounded';
import ErrorOutlineRoundedIcon from '@material-ui/icons/ErrorOutlineRounded';
import qs from 'qs'

const customStylesModal = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        zIndex: 4
    },
    content : {
        top                   : '50%',
        left                  : '50%',
        right                 : 'auto',
        bottom                : 'auto',
        minWidth              : '320px',
        marginRight           : '-50%',
        transform             : 'translate(-50%, -50%)',
        borderRadius          : '10px',
        boxShadow             : '0px 5px 30px rgba(0, 0, 0, 0.16)',
        display               : 'flex',
        justifyContent        : 'center',
        flexWrap              : 'wrap',
        width                 : 'max-content',
        maxWidth              : '320px',
        padding               : '20px 0'
    }
};

class Payments extends React.Component {
    state = {
        from: qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).from,
    }

    render() {
        return <Modal
            isOpen={this.props.isOpen}
            onRequestClose={() => {this.props.close()}}
            style={customStylesModal}
            contentLabel="Payments"
        >      
            <div style={{display: 'flex', flexDirection: 'column'}}>
                {this.props.isOpen === 'true' && <>
                    <CheckCircleOutlineRoundedIcon style={{color: '#35E551', fontSize: 54, margin: '0 auto', display: 'block'}} /> 
                    <h2 className="modal-title" style={{marginBottom: 10}}>{this.props.langProps.pay_success_true}</h2>
                </>}

                {this.props.isOpen === 'false' && <>
                    <ErrorOutlineRoundedIcon style={{color: '#FF4444', fontSize: 54, margin: '0 auto', display: 'block'}} /> 
                    <h2 className="modal-title" style={{marginBottom: 10}}>{this.props.langProps.pay_success_false}</h2>
                </>}
                <button className="button-blue" onClick={() => {
                    if(this.props.isOpen === 'true' && this.state.from === 'app')
                        window.location.replace('hevachat://myorders')
                    else 
                    this.props.history.push({
                        search: `?modal=payments`
                    })
                }}>
                    {this.props.langProps.my_orders}
                </button>
            </div>
        </Modal>
    }
}

const mapStateToProps = state => {
    return {
        users: state.users,
        user: state.user
    }
}

function mapDispatchToProps(dispatch) {
    return {
        usersActions: bindActionCreators(usersActions, dispatch),
    }
}

export default withLang(languages)(connect(mapStateToProps, mapDispatchToProps)(withRouter(withCookies(Payments))))