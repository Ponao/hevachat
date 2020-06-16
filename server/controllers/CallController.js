/**
 * CallController.js
 * Author: Roman Shuvalov
 */
'use strict';

const { addUserCall, stopCall, checkBusy } = require("./WebRtcController");
const { sendUserCall, stopUserCall, getIO } = require("./SocketController");
const Dialog = require('../models/Dialog');
const Message = require('../models/Message');
const User = require('../models/User');

module.exports = {
    call: async (req, res, next) => {
        const { user } = res.locals;
        const { id, socketId } = req.body;

        try {
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
            let call = checkBusy(user._id)
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
    }
}