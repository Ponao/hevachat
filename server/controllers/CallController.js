/**
 * CallController.js
 * Author: Roman Shuvalov
 */
'use strict';

const { addUserCall, stopCall, checkBusy, checkIncominmgCall, acceptCall, getUserExistById } = require("./WebRtcController");
const { sendUserCall, stopUserCall, getIO, sendUserAcceptCall } = require("./SocketController");
const User = require('../models/User');
const Payment = require('../models/Payment');
const { sendPushNotification } = require("./PushNotificationsController");
const languages = require("../languages");

module.exports = {
    call: async (req, res, next) => {
        const { user } = res.locals;
        const { id, socketId } = req.body;

        try {
            let payment = await Payment.findOne({userId: user._id, expiriesAt: {'$gte': Date.now()}})
            
            if(!payment) {
                return res.json({error: 'dont_have_payment'});
            }

            if(checkBusy(user._id) || user._id == id || getUserExistById(user._id)) {
                return res.json({error: 'exist'});
            }

            if(checkBusy(id)) {
                return res.json({error: 'busy'});
            }

            addUserCall(user._id, id, socketId)

            sendUserCall({userId: user._id, otherId: id, socketId})

            let otherUser = await User.findOne({_id: id}).select('+pushToken').select('+lang')
            if(otherUser && otherUser.pushToken) {
                let data = { 
                    text: languages[otherUser.lang].incoming_call,
                    push_ids: [otherUser.pushToken.id],
                    icon: 'phone_icon',
                    color: '008FF7',
                    header_text: `${user.name.first} ${user.name.last}`,
                    avatar: user.avatar ? user.avatar.min : '',
                    group_id: `call${user._id}`,
                    channel_id: 'd8fcc2a5-a5b8-443a-9faf-01e1ebd3b955',
                    group_name: 'call',
                    additional: {
                        userId: user._id,
                        type: 'call'
                    },
                    os: otherUser.pushToken.os
                };
        
                sendPushNotification(data).then(async (id) => {
                    
                })
            }

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

            if(getUserExistById(user._id)){
                // stopCall(socketId, user._id, stopUserCall, io, true)
                return res.json({error: 'exist'});
            }
            acceptCall(user._id, userId, socketId)
            sendUserAcceptCall({userId: user._id, otherId: userId, socketId})
            return res.json({error: false});
        } catch(err) {
            return next(new Error(e));
        }
    }
}