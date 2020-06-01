/**
 * RoomController.js
 * Author: Roman Shuvalov
 */
'use strict';

const Dialog = require('../models/Dialog');
const Message = require('../models/Message');

const {sendMessageRoom, deleteMessageRoom, readMessageRoom, editMessageRoom} = require('./SocketController')

module.exports = {
    getAll: async (req, res, next) => {
        const { user } = res.locals;

        const dialogs = await Dialog.find({'users': {'$in': [user._id]}}).populate('users').populate({path: 'messages', options: {limit: 1} }).sort({createdAt: 'DESC'});

        try {
            return res.json(dialogs);
        } catch (e) {
            return next(new Error(e));
        }
    },
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