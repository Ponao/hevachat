/**
 * RoomController.js
 * Author: Roman Shuvalov
 */
'use strict';

const Room = require('../models/Room');

module.exports = {
    getAll: async (req, res, next) => {
        const { user } = res.locals;
        const { lang } = req.body;

        const rooms = await Room.find({lang: lang}).sort({createdAt: 'DESC'});

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

    get: async (req, res, next) => {
        const { id } = req.body;
        let room = await Room.findById(id);

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

    create: async (req, res, next) => {
        // Get this account as JSON
        const { user } = res.locals;
        const { lang, title, isPrivate } = req.body;

        const room = new Room()

        let colors = ["26, 188, 156",'46, 204, 113','52, 152, 219','155, 89, 182','233, 30, 99','241, 196, 15','230, 126, 34','231, 76, 60']

        room.title = title
        room.lang = lang
        room.isPrivate = isPrivate
        room.ownerId = user._id
        room.color = colors[randomInteger(0,7)]        

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

function randomInteger(min, max) {
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
}