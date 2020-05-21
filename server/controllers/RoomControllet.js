/**
 * UserController.js
 * Author: Roman Shuvalov
 */
'use strict';

const Room = require('../models/Room');

module.exports = {
    getAll: async (req, res, next) => {
        const { user } = res.locals;

        const rooms = await Room.find({lang: user.roomLang});

        try {
            if (rooms) {
                return res.json(rooms);
            }
            const err = new Error(`User ${userId} not found.`);
            err.notFound = true;
            return next(err);
        } catch (e) {
            return next(new Error(e));
        }
    },


    create: async (req, res, next) => {
        // Get this account as JSON
        const { user } = res.locals;
        const { lang, title, isPrivate } = req.body;

        const room = new Room()

        room.title = title
        room.lang = lang
        room.isPrivate = isPrivate
        room.ownerId = user._id

        await room.save()

        try {
            if (room) {
                return res.json(room);
            }
            const err = new Error(`User ${userId} not found.`);
            err.notFound = true;
            return next(err);
        } catch (e) {
            return next(new Error(e));
        }
    },

    delete: async (req, res, next) => {
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

    edit: async (req, res, next) => {
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
}