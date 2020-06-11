/**
 * RoomController.js
 * Author: Roman Shuvalov
 */
'use strict';

const Notification = require('../models/Notification');

module.exports = {
    getAll: async (req, res, next) => {
        const { user } = res.locals;

        try {
            const notifications = await Notification.find({userId: user._id}).populate('user').sort({createdAt: 'DESC'});

            return res.json(notifications);
        } catch (e) {
            return next(new Error(e));
        }
    }
}