/**
 * CallController.js
 * Author: Roman Shuvalov
 */
'use strict';

const { addUserCall, stopCall, checkBusy, checkIncominmgCall, acceptCall } = require("./WebRtcController");
const { sendUserCall, stopUserCall, getIO, sendUserAcceptCall } = require("./SocketController");
const Dialog = require('../models/Dialog');
const Message = require('../models/Message');
const User = require('../models/User');
const Payment = require('../models/Payment');

module.exports = {
    call: async (req, res, next) => {
        const { user } = res.locals;
        const { id, socketId } = req.body;

        try {
            let payment = await Payment.findOne({userId: user._id, expiriesAt: {'$gte': Date.now()}})
            
            if(!payment) {
                return res.json({error: 'dont_have_payment'});
            }

            if(checkBusy(user._id) || user._id == id) {
                return res.json({error: 'exist'});
            }

            if(checkBusy(id)) {
                return res.json({error: 'busy'});
            }

            addUserCall(user._id, id, socketId)

            sendUserCall({userId: user._id, otherId: id, socketId})

            return res.json({error: false});
        } catch (e) {
            return next(new Error(e));
        }
    },

    check: async (req, res, next) => {
        const { user } = res.locals;

        try {
            let call = checkIncominmgCall(user._id)
            if(call) {
                return res.json({call, have: true});
            }

            return res.json({have: false});
        } catch (e) {
            return next(new Error(e));
        }
    },

    stop: async (req, res, next) => {
        const { user } = res.locals;
        const { socketId } = req.body;

        try {
            let io = getIO()
            stopCall(socketId, user._id, stopUserCall, io, true)

            return res.json({error: false});
        } catch (e) {
            return next(new Error(e));
        }
    },
    
    accept: async (req, res, next) => {
        const { user } = res.locals;
        const { userId, socketId } = req.body;

        try {
            let payment = await Payment.findOne({userId: user._id, expiriesAt: {'$gte': Date.now()}})
            
            if(!payment) {
                let io = getIO()
                stopCall(socketId, user._id, stopUserCall, io, true)
                return res.json({error: 'dont_have_payment'});
            }
            
            acceptCall(user._id, userId, socketId)
            sendUserAcceptCall({userId: user._id, otherId: userId, socketId})
            return res.json({error: false});
        } catch(err) {
            return next(new Error(e));
        }
    }
}