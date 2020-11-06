/**
 * RoomController.js
 * Author: Roman Shuvalov
 */
'use strict';

const request = require('request')

const Payment = require('../models/Payment')
const Tariff = require('../models/Tariff')

const orderLink = 'https://securepayments.sberbank.ru/payment/rest/registerPreAuth.do'
const orderLinkGooglePay = 'https://securepayments.sberbank.ru/payment/google/payment.do'
const orderLinkApplePay = 'https://securepayments.sberbank.ru/payment/applepay/payment.do'
const statusLink = "https://securepayments.sberbank.ru/payment/rest/getOrderStatus.do"
const finishLink = "https://securepayments.sberbank.ru/payment/rest/deposit.do"

module.exports = {
    getAll: async (req, res, next) => {
        const { user } = res.locals

        try {
            let payment = await Payment.findOne({userId: user._id, status: 'success', expiriesAt: {'$gte': Date.now()}})

            if(!payment) {
                let payments = await Payment.find({userId: user._id}).populate('tariff')
                let existDemo = payments.find(x => x.tariff.price === 0)

                let tariffs = false
                if(existDemo) 
                    tariffs = await Tariff.find({active: true, price: {'$ne': 0}})
                else
                    tariffs = await Tariff.find({active: true})

                return res.json({tariffs, status: 'can'})
            } else {
                return res.json({tariffs: [], status: 'cant'})
            }
            
        } catch (e) {
            return next(new Error(e))
        }
    },

    getMy: async (req, res, next) => {
        const { user } = res.locals

        let payments = await Payment.find({userId: user._id}).populate('tariff')

        for (let i = 0; i < payments.length; i++) {
            if(new Date(payments[i].expiriesAt).getTime() < Date.now() && payments[i].status === 'success') {
                payments[i].status = 'ended'
            }
        }

        return res.json(payments)
    },

    deleteMy: async (req, res, next) => {
        const { user } = res.locals
        const { paymentId } = req.body

        await Payment.findOneAndDelete({userId: user._id, _id: paymentId})

        return res.json(true)
    },

    buy: async (req, res ,next) => {
        const { user } = res.locals
        const { tariffId, from } = req.body

        try {
            const payment = new Payment()

            let tariff = await Tariff.findOne({_id: tariffId, active: true})

            if(tariff) {
                if(tariff.price === 0) {
                    let payments = await Payment.find({userId: user._id}).populate('tariff')
                    let existDemo = payments.find(x => x.tariff.price === 0)

                    if(existDemo) {
                        const err = {}
                        err.param = `all`
                        err.msg = `already_use_demo`
                        return res.status(401).json({ error: true, errors: [err] })
                    } else {
                        payment.userId = user._id
                        payment.tariff = tariff
                        payment.expiriesAt = Date.now() + (tariff.days * 1000 * 60 * 60 * 24)
                        payment.updateAt = Date.now()
                        payment.orderId = 'none'
                        payment.status = 'success'
                        payment.formUrl = ''
                        
                        await payment.save()

                        return res.json(payment)
                    }
                } else {
                    payment.userId = user._id
                    payment.tariff = tariff
                    payment.expiriesAt = Date.now() + (tariff.days * 1000 * 60 * 60 * 24)
                    payment.updateAt = Date.now()
                    
                    await payment.save()

                    let params = {}

                    params.userName = process.env.SB_USERNAME
                    params.password = process.env.SB_PASSWORD

                    params.orderNumber = payment._id
                    params.amount = tariff.price * 100 // *Умножение на 100 так как стоимость указывается в копейках

                    if(from === 'app') {
                        params.returnUrl = `${process.env.API_URL}/api/payment/check-order?from=app`
                    } else {
                        params.returnUrl = `${process.env.API_URL}/api/payment/check-order`
                    }
                    
                    params.failUrl = `${process.env.CLIENT_URL}`

                    let response = await sendRequest(orderLink, 'GET', params)
                    
                    if(response.orderId) {
                        payment.orderId = response.orderId
                    }

                    if(response.formUrl) {
                        payment.formUrl = response.formUrl
                    }

                    await payment.save()

                    return res.json(response)
                }
            }

            const err = {}
            err.param = `all`
            err.msg = `not_found`

            return res.status(404).json({ error: true, errors: [err] })
        } catch (e) {
            return next(new Error(e))
        }
    },

    buyGooglePay: async (req, res ,next) => {
        const { user } = res.locals
        const { tariffId, paymentToken } = req.body

        try {
            const payment = new Payment()

            let tariff = await Tariff.findOne({_id: tariffId, active: true})

            if(tariff) {
                payment.userId = user._id
                payment.tariff = tariff
                payment.expiriesAt = Date.now() + (tariff.days * 1000 * 60 * 60 * 24)
                payment.updateAt = Date.now()
                
                await payment.save()

                let params = {}

                //     {
                //         paymentToken: base64.encode(JSON.stringify(paymentToken.paymentToken)),
                //         preAuth: true,
                //         merchant: 'ikryanka',
                //         amount: 1500,
                //         orderNumber: 'asdadsw123123fg5g45',
                //         returnUrl: 'https://hevachat.com',
                //         email: 'pffbread@gmail.com'
                //     }

                params.paymentToken = paymentToken
                params.preAuth = true
                params.merchant = 'hevachat'
                params.email = 'pffbread@gmail.com'

                params.orderNumber = payment._id
                params.amount = tariff.price * 100 // *Умножение на 100 так как стоимость указывается в копейках

                params.returnUrl = `${process.env.API_URL}/api/payment/check-order`
                
                params.failUrl = `${process.env.CLIENT_URL}`

                payment.formUrl = ''

                let response = await sendRequest(orderLinkGooglePay, 'POST', params)
                
                if(response.data.orderId) {
                    payment.orderId = response.data.orderId

                    let params1 = {}
                    params1.userName = process.env.SB_USERNAME
                    params1.password = process.env.SB_PASSWORD
                    params1.orderId = response.data.orderId

                    let response2 = await sendRequest(statusLink, 'GET', params1)

                    if(response2.OrderStatus === 1 && payment.status === 'wait') {
                        payment.status = 'hold'
                        payment.updateAt = Date.now()
        
                        await payment.save()
        
                        params1.amount = payment.tariff.price * 100 // *Умножение на 100 так как стоимость указывается в копейках
        
                        let response3 = await sendRequest(finishLink, 'GET', params1)
        
                        if(response3.errorCode === '0') {
                            payment.status = 'success'
                            payment.expiriesAt = Date.now() + (payment.tariff.days * 1000 * 60 * 60 * 24)
                            payment.updateAt = Date.now()
        
                            await payment.save()    
        
                            return res.json({success: true})
                        } else {
                            return res.json({success: false})
                        }
                    }
                } else {
                    return res.json({success: false})
                }
            }

            const err = {}
            err.param = `all`
            err.msg = `not_found`

            return res.status(404).json({ error: true, errors: [err], success: false })
        } catch (e) {
            return next(new Error(e))
        }
    },

    buyApplePay: async (req, res ,next) => {
        const { user } = res.locals
        const { tariffId, paymentData } = req.body

        try {
            const payment = new Payment()

            let tariff = await Tariff.findOne({_id: tariffId, active: true})

            if(tariff) {
                payment.userId = user._id
                payment.tariff = tariff
                payment.expiriesAt = Date.now() + (tariff.days * 1000 * 60 * 60 * 24)
                payment.updateAt = Date.now()
                
                await payment.save()

                let params = {}

                //     {
                //         paymentToken: base64.encode(JSON.stringify(paymentToken.paymentToken)),
                //         preAuth: true,
                //         merchant: 'ikryanka',
                //         amount: 1500,
                //         orderNumber: 'asdadsw123123fg5g45',
                //         returnUrl: 'https://hevachat.com',
                //         email: 'pffbread@gmail.com'
                //     }

                params.paymentToken = paymentData
                params.preAuth = true
                params.merchant = 'hevachat'
                params.language = 'ru'
                params.additionalParameters = {email: 'test@test.ru'}
                params.description = 'ОПИСАНИЕ'
                // params.email = 'pffbread@gmail.com'

                params.orderNumber = payment._id
                //params.amount = tariff.price * 100 Умножение на 100 так как стоимость указывается в копейках

                // params.returnUrl = `${process.env.API_URL}/api/payment/check-order`
                
                // params.failUrl = `${process.env.CLIENT_URL}`

                console.log(JSON.stringify(params))
                console.log(new Date())

                payment.formUrl = ''

                let response = await sendRequest(orderLinkApplePay, 'POST', params)
                
                if(response.data && response.data.orderId) {
                    payment.orderId = response.data.orderId

                    let params1 = {}
                    params1.userName = process.env.SB_USERNAME
                    params1.password = process.env.SB_PASSWORD
                    params1.orderId = response.data.orderId

                    let response2 = await sendRequest(statusLink, 'GET', params1)

                    if(response2.OrderStatus === 1 && payment.status === 'wait') {
                        payment.status = 'hold'
                        payment.updateAt = Date.now()
        
                        await payment.save()
        
                        params1.amount = payment.tariff.price * 100 // *Умножение на 100 так как стоимость указывается в копейках
        
                        let response3 = await sendRequest(finishLink, 'GET', params1)
        
                        if(response3.errorCode === '0') {
                            payment.status = 'success'
                            payment.expiriesAt = Date.now() + (payment.tariff.days * 1000 * 60 * 60 * 24)
                            payment.updateAt = Date.now()
        
                            await payment.save()    
        
                            return res.json({success: true})
                        } else {
                            return res.json({success: false})
                        }
                    }
                } else {
                    return res.json({success: false})
                }
            }

            const err = {}
            err.param = `all`
            err.msg = `not_found`

            return res.status(404).json({ error: true, errors: [err], success: false })
        } catch (e) {
            return next(new Error(e))
        }
    },

    check: async (req, res ,next) => {
        const { orderId, from } = req.query;

        try {   
            let payment = await Payment.findOne({orderId}).populate('tariff')

            let params = {}
            params.userName = process.env.SB_USERNAME
            params.password = process.env.SB_PASSWORD
            params.orderId = orderId

            let response = await sendRequest(statusLink, 'GET', params)

            if(response.OrderStatus === 1 && payment.status === 'wait') {
                payment.status = 'hold'
                payment.updateAt = Date.now()

                await payment.save()

                params.amount = payment.tariff.price * 100 // *Умножение на 100 так как стоимость указывается в копейках

                let response = await sendRequest(finishLink, 'GET', params)

                if(response.errorCode === '0') {
                    payment.status = 'success'
                    payment.expiriesAt = Date.now() + (payment.tariff.days * 1000 * 60 * 60 * 24)
                    payment.updateAt = Date.now()

                    await payment.save()

                    if(from === 'app')
                        res.writeHead(301, { "Location": `${process.env.CLIENT_URL}/?paySuccess=true&from=app&uuid=${randomInteger(0, 1000000)}` })
                    else 
                        res.writeHead(301, { "Location": `${process.env.CLIENT_URL}/?paySuccess=true&uuid=${randomInteger(0, 1000000)}` })
                } else {
                    res.writeHead(301, { "Location": `${process.env.CLIENT_URL}/?paySuccess=false&uuid=${randomInteger(0, 1000000)}` })
                }
            } else {
                res.writeHead(301, { "Location": `${process.env.CLIENT_URL}/?paySuccess=false&uuid=${randomInteger(0, 1000000)}` })
            }
            
            return res.end()
        } catch (error) {
            return next(new Error(error))
        }
    }
}

function sendRequest(url, method, params) {
    return new Promise(resolve => {
        if(method == 'GET') {
            let link = url + '?';

            for(let i in params) {
                if (params.hasOwnProperty(i))
                    link += i + '=' + params[i] + '&';
            }

            if(params)
                link = link.substr(0, link.length - 1);

            
            request(link, function (err, res, body) {
                console.log(JSON.parse(body.toString()))
                resolve(JSON.parse(body.toString()))
            })
        }
        if(method == 'POST') {
            let options = {
                uri: url,
                method,
                json: params
            }

            request.post(options, function (err, res, body) {
                console.log(body)
                resolve(body)
            })
        }
    })
}

function randomInteger(min, max) {
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
}