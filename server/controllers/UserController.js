/**
 * UserController.js
 * Author: Roman Shuvalov
 */
'use strict';

const User = require('../models/User');
const Message = require('../models/Message');
const Dialog = require('../models/Dialog');

module.exports = {
    // Get user data
    user: async (req, res, next) => {
        // Get this account as JSON
        const { user } = res.locals;

        try {
            const dialogs = await Dialog.find({'users': {'$all': [user._id]}}).populate([
                {
                    path: 'users',
                    select: ['_id', 'name', 'online', 'color']
                },
                {
                    path: 'messages'
                },
                {
                    path: 'lastMessage',
                    populate: {
                        path: 'user'
                    }
                },
            ]).sort({updatedAt: 'DESC'});

            let noReadCount = 0

            const noReadDialogs = await Dialog.find({noRead: {'$ne': 0}, 'users': {'$all': [user._id]}}).populate([
            {
                path: 'users',
                select: ['_id']
            },
            {
                path: 'lastMessage',
                populate: {
                    path: 'user'
                }
            },
        ]);

            if(noReadDialogs) {
            noReadDialogs.map(x => {
                if(x.lastMessage.user._id != user._id && x.isRead) {
                    noReadCount++
                } 
            })
            }
            
            if (user) {
                return res.json({user, dialogs, noReadCount});
            }
            const err = new Error(`User ${userId} not found.`);
            err.notFound = true;
            return next(err);
        } catch (e) {
            return next(new Error(e));
        }
    },

    updateRoomLang: async (req, res, next) => {
        // Get this account as JSON
        const { user } = res.locals;
        const { lang } = req.body;

        try {
            user.roomLang = lang;
            await user.save()
            if (user) {
                return res.json(user);
            }
            const err = new Error(`User ${userId} not found.`);
            err.notFound = true;
            return next(err);
        } catch (e) {
            return next(new Error(e));
        }
    }
}