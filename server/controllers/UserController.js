/**
 * UserController.js
 * Author: Roman Shuvalov
 */
'use strict';

const User = require('../models/User');
const Message = require('../models/Message');

module.exports = {
    // Get user data
    user: async (req, res, next) => {
        // Get this account as JSON
        const { user } = res.locals;
        try {
            if (user) {
                return res.json(user);
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
    },

    test: async (req, res, next) => {
        // Get this account as JSON
        const { user } = res.locals;

        let message = new Message({
            user: user,
            text: 'TEST',
        })

        await message.save()

        console.log(message)

        try {
            if (message) {
                return res.json(message);
            }
            const err = new Error(`User ${userId} not found.`);
            err.notFound = true;
            return next(err);
        } catch (e) {
            return next(new Error(e));
        }
    }
}