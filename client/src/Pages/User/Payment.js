// App
import React from 'react'

import {PageSettings} from '../PageSettings'
import '../../Css/Partials/Payment.css'

// Redux
import { connect } from 'react-redux'
import { urlApi } from '../../config';
import { CircularProgress } from '@material-ui/core';
import { withRouter } from 'react-router-dom';

class Payment extends React.Component {
    static contextType = PageSettings;

    state = {
        isFetching: true,
        tariffs: [],
        redirect: false
    }

    componentDidMount() {
        this.context.toggleHeader(false)

        fetch(`${urlApi}/api/payment/get-all`, {
            method: "post",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.props.user.apiToken}`,
            }
        })
        .then((response) => response.json())
        .then((tariffs) => {
            this.setState({isFetching: false, tariffs})
        })
    }

    componentWillUnmount() {
        this.context.toggleHeader(false)
    }

    buy(tariffId) {
        this.setState({isFetching: true})
        fetch(`${urlApi}/api/payment/buy`, {
            method: "post",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.props.user.apiToken}`,
            },
            body: JSON.stringify({
                tariffId
            })
        })
        .then((response) => response.json())
        .then((answer) => {
            if(!answer.error) {
                this.setState({isFetching: false})
                this.props.history.push('/')
            }
        })
    }

    render() {
        return (
            <> 
                <div className="payment-page">
                    <h2 className="payment-title">Hi {this.props.user.name.first}</h2>
                    <p className="payment-subtitle">Pick a plan to continue</p>

                    <div className="payment-tariffs">
                        {this.state.isFetching && <CircularProgress style={{
                            color: '#fff',
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            margin: 'auto',
                            top: 'calc(50% - 20px)'
                        }} />}

                        {!this.state.isFetching && <div className="row">
                            {this.state.tariffs.map(tariff => {
                                return <div className="col-12 col-md-6 col-lg-3 col-xl-2 payment-tariff-container">
                                    <div className="payment-tariff">
                                        <p className="payment-tariff-title">{tariff.title}</p>
                                        <p className="payment-tariff-price">{tariff.price === 0 ? "Free" : tariff.price}</p>

                                        <button className="button-gray" onClick={() => {
                                            this.buy(tariff._id)
                                        }} style={{width: '80%', margin: '0 10% 0 10%'}}>Buy</button>
                                    </div>
                                </div>
                            })}
                        </div>}
                    </div>
                </div>        
            </>
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.user,
    }
}

export default connect(mapStateToProps)(withRouter(Payment))
