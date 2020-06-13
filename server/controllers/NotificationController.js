/**
 * RoomController.js
 * Author: Roman Shuvalov
 */
'use strict';

const Notification = require('../models/Notification');
const {readNotification} = require('./SocketController')

module.exports = {
    getAll: async (req, res, next) => {
        const { user } = res.locals;

        try {
            let oneweekago = new Date() - (7 * 24 * 60 * 60 * 1000);
            
            const notifications = await Notification.find({userId: user._id, createdAt: {"$gte": oneweekago} }).populate([
                {
                    path: 'user', 
                    select: ['_id', 'email', 'name', 'online', 'color']
                },
                {
                    path: 'room'
                }
            ]).sort({createdAt: 'DESC'});

            return res.json(notifications);
        } catch (e) {
            return next(new Error(e));
        }
    },

    read: async (req, res, next) => {
        const { user } = res.locals;
        const { id, socketId } = req.body;

        try {
            await Notification.updateOne({userId: user._id, _id: id }, {isRead: true})

            readNotification({socketId, userId: user._id, id})

            return res.json();
        } catch (e) {
            return next(new Error(e));
        }
    }
}