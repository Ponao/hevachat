// App
import React from 'react'
import Modal from 'react-modal';

// Material
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';

// Redux
import { connect } from 'react-redux'
import * as usersActions from '../Redux/actions/users'
import { bindActionCreators } from 'redux'
import { withCookies } from 'react-cookie'
import { CircularProgress, Button, withStyles } from '@material-ui/core';
import PaymentRoundedIcon from '@material-ui/icons/PaymentRounded';
import { withRouter } from 'react-router-dom';
import { withLang } from 'react-multi-language';
import languages from '../languages';
import { urlApi } from '../config';
import IconButton from '@material-ui/core/IconButton';
import Scrollbars from 'react-custom-scrollbars';
import DeleteOutlineRoundedIcon from '@material-ui/icons/DeleteOutlineRounded';
import { LastMessageDate } from '../Controllers/TimeController';
import ReceiptRoundedIcon from '@material-ui/icons/ReceiptRounded';

const PayButton = withStyles((theme) => ({
    root: {
      color: '#008FF7',
    },
}))(IconButton);

const DeleteButton = withStyles((theme) => ({
    root: {
      color: '#FF3333',
    },
}))(IconButton);

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

class ComPayment extends React.Component {
    render() {
        return <div className={`payment-item`}>
            <div style={{display: 'flex', flexDirection: 'column'}}>
                <p style={{margin: 0, fontSize: 14, fontWeight: 500}}>{this.props.payment.status === 'wait' ? this.props.langProps.booked : this.props.langProps.paid}:</p>
                <p style={{margin: 0, fontSize: 14, fontWeight: 500}}>{LastMessageDate(this.props.payment.updateAt)}</p>
            </div>
            <div style={{display: 'flex', flex: '1', alignItems: 'center', justifyContent: 'center'}}>{this.props.payment.tariff.title}</div>
            {/* <div style={{display: 'flex', flex: '1'}}></div> */}

            {this.props.payment.status === 'wait' && <>
                <PayButton aria-label="upload picture" component="span" onClick={() => {
                    window.location.href = this.props.payment.formUrl
                }}>
                    <PaymentRoundedIcon />
                </PayButton>

                <DeleteButton aria-label="upload picture" component="span" onClick={() => {
                    this.props.delete(this.props.payment._id)
                }}>
                    <DeleteOutlineRoundedIcon />
                </DeleteButton>
            </>}

            {this.props.payment.status === 'success' && <>
                <div className="payment-status-active">
                    {this.props.langProps.active}
                </div>
            </>}

            {this.props.payment.status === 'ended' && <>
                <div className="payment-status-inactive">
                    {this.props.langProps.ended}
                </div>
            </>}
        </div>
    }
}

const Payment = withLang(languages)(ComPayment)

class Payments extends React.Component {
    state = {
        payments: [],
        isFetching: true
    }

    componentDidMount() {
        fetch(`${urlApi}/api/payment/get-my`, {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.props.user.apiToken}`,
            },
        })
        .then(response => response.json())
        .then(payments => {
            this.setState({isFetching: false, payments: payments.reverse()})
        })
    }

    delete(paymentId) {
        this.setState({isFetching: true, payments: [...this.state.payments.filter(x => x._id !== paymentId)]})
        fetch(`${urlApi}/api/payment/delete-my`, {
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.props.user.apiToken}`,
            },
            body: JSON.stringify({
                paymentId
            })
        })
        .then(() => {
            this.setState({isFetching: false})
        })
    } 

    render() {
        return <Modal
            isOpen={this.props.isOpen}
            onRequestClose={() => {this.props.close()}}
            style={customStylesModal}
            contentLabel="Payments"
        >
            <span className="modal-back" onClick={(e) => {
                this.props.history.goBack()
            }}>
                <CloseOutlinedIcon style={{color: '#99AABB'}} />
            </span>
            
            <h2 className="modal-title">{this.props.langProps.my_orders}</h2>

            <Scrollbars
                ref={(ref) => {this.roomsBlock = ref}}
                renderTrackVertical={props => <div className="track-vertical"/>}
                renderThumbVertical={props => <div className="thumb-vertical"/>}
                className="scroll"
                style={{height: 340}}
                autoHide
            >
                {!this.state.isFetching && this.state.payments.map(payment => {
                    return <Payment payment={payment} delete={(id) => {this.delete(id)}} />
                })}
                
                {this.state.isFetching && <CircularProgress style={{
                    color: '#008FF7',
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    margin: 'auto',
                    top: 'calc(50% - 20px)'
                }} />}

                {!this.state.isFetching && !this.state.payments.length && <div className="data-empty">
                    <ReceiptRoundedIcon style={{color: '#B8C3CF', fontSize: 54, margin: '0 auto', display: 'block'}} />

                    <p>{this.props.langProps.here_will_your_orders}</p>
                </div>}
            </Scrollbars>
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