// App
import React from 'react'
import Modal from 'react-modal';

// Redux
import { connect } from 'react-redux'
import ReportProblemOutlinedIcon from '@material-ui/icons/ReportProblemOutlined';
import { withRouter } from 'react-router-dom';
import store from '../Redux/store';
import { USER_SET_WARNING } from '../Redux/constants';

const customStylesModal = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        zIndex: 999
    },
    content : {
        top                   : '50%',
        left                  : '50%',
        right                 : 'auto',
        bottom                : 'auto',
        minWidth              : '300px',
        marginRight           : '-50%',
        transform             : 'translate(-50%, -50%)',
        borderRadius          : '10px',
        boxShadow             : '0px 5px 30px rgba(0, 0, 0, 0.16)',
        textAlign             : 'center'
    }
};

class Warning extends React.Component {
    render() {
        return <Modal
            isOpen={this.props.isOpen}
            style={customStylesModal}
            contentLabel="Warning"
        >
            <ReportProblemOutlinedIcon style={{color: '#FF3333', fontSize: 60}} />

            <h2 className="modal-title">Warning</h2>

            <p className="modal-text">{this.props.user.warning}</p>
            
            <button className="button-blue" type="submit" style={{width: 'max-content'}} onClick={() => {
                store.dispatch({
                    type: USER_SET_WARNING,
                    payload: false
                })
            }}>Close</button>
        </Modal>
    }
}

const mapStateToProps = state => {
    return {
        user: state.user
    }
}

export default connect(mapStateToProps)(withRouter(Warning))