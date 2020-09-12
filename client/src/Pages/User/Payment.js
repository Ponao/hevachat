// App
import React from 'react'

import {PageSettings} from '../PageSettings'
import '../../Css/Partials/Payment.css'

// Redux
import { connect } from 'react-redux'
import { urlApi } from '../../config';
import { CircularProgress } from '@material-ui/core';
import { withRouter } from 'react-router-dom';
import { withLang } from 'react-multi-language';
import languages from '../../languages';
import CheckCircleOutlineRoundedIcon from '@material-ui/icons/CheckCircleOutlineRounded';
import qs from 'qs'

class Payment extends React.Component {
    static contextType = PageSettings;

    state = {
        isFetching: true,
        tariffs: [],
        redirect: false,
        status: '',
        from: qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).from,
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
        .then(({tariffs, status}) => {
            this.setState({isFetching: false, tariffs, status})
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
                tariffId,
                from: this.state.from
            })
        })
        .then((response) => response.json())
        .then((answer) => {
            console.log(answer)
            if(!answer.error) {
                if(answer.formUrl) {
                    window.location.href = answer.formUrl
                } else {
                    this.setState({isFetching: false})
                    this.props.history.push('/')
                }
            }
        })
    }

    render() {
        return (
            <> 
                <div className="payment-page">
                {this.state.status === 'can' && <>
                    <h2 className="payment-title">{this.props.langProps.hi} {this.props.user.name.first}</h2>
                    <p className="payment-subtitle">{this.props.langProps.pick_a_plan_continue}</p>
                </>}

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
                                        }} style={{width: '80%', margin: '0 10% 0 10%'}}>{this.props.langProps.buy}</button>
                                    </div>
                                </div>
                            })}
                        </div>}

                        {this.state.status === 'cant' && <div className="data-empty">
                            <CheckCircleOutlineRoundedIcon style={{color: '#fff', fontSize: 54, margin: '0 auto', display: 'block'}} />

                            <p style={{color: '#fff', fontSize: 18, fontWeight: 600}}>{this.props.langProps.already_tariff}</p>

                            <button className="button-gray" onClick={() => {
                                this.props.history.push('/')
                            }}>
                                {this.props.langProps.back}
                            </button>
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

export default withLang(languages)(connect(mapStateToProps)(withRouter(Payment)))
