/**
 * RoomController.js
 * Author: Roman Shuvalov
 */
'use strict';

const Payment = require('../models/Payment');
const Tariff = require('../models/Tariff');

module.exports = {
    getAll: async (req, res, next) => {
        const { user } = res.locals;

        try {
            let payments = await Payment.find({userId: user._id}).populate('tariff')
            let existDemo = payments.find(x => x.tariff.price === 0)

            let tariffs = false
            if(existDemo) 
                tariffs = await Tariff.find({active: true, price: {'$ne': 0}})
            else
                tariffs = await Tariff.find({active: true})

            return res.json(tariffs);
        } catch (e) {
            return next(new Error(e));
        }
    },

    buy: async (req, res ,next) => {
        const { user } = res.locals;
        const { tariffId } = req.body;

        try {
            const payment = new Payment()

            let tariff = await Tariff.findOne({_id: tariffId})

            if(tariff) {
                if(tariff.price === 0) {
                    let payments = await Payment.find({userId: user._id}).populate('tariff')
                    let existDemo = payments.find(x => x.tariff.price === 0)

                    if(existDemo) {
                        const err = {};
                        err.param = `all`;
                        err.msg = `already_use_demo`;
                        return res.status(401).json({ error: true, errors: [err] });
                    }
                }

                payment.userId = user._id
                payment.tariff = tariff
                payment.expiriesAt = Date.now() + (tariff.days * 1000 * 60 * 60 * 24)
                
                await payment.save()
            }

            return res.json(payment);
        } catch (e) {
            return next(new Error(e));
        }
    }
}

function randomInteger(min, max) {
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
}

function randomString(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }