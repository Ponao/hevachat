/**
 * RoomController.js
 * Author: Roman Shuvalov
 */
'use strict';

const Room = require('../models/Room');
const Dialog = require('../models/Dialog');
const Message = require('../models/Message');

const {sendMessageRoom, deleteMessageRoom} = require('./SocketController')

module.exports = {
    getAll: async (req, res, next) => {
        const { user } = res.locals;
        const { lang } = req.body;

        const rooms = await Room.find({lang: lang}).sort({createdAt: 'DESC'});

        try {
            return res.json(rooms);
        } catch (e) {
            return next(new Error(e));
        }
    },

    get: async (req, res, next) => {
        const { user } = res.locals;
        let { id } = req.body;

        id = id + ''

        if(id.length !== 24) {
            const err = {};
            err.param = `all`;
            err.msg = `room_not_found`;
            return res.status(401).json({ error: true, errors: [err] });
        }
        
        let room = await Room.findOne({_id: id}).populate('dialog');

        if(room === null) {
            const err = {};
            err.param = `all`;
            err.msg = `room_delete_or_not_found`;
            return res.status(401).json({ error: true, errors: [err] });
        }

        await Message.updateMany({"isRead": false, "dialogId": room.dialog._id, 'user': { "$ne": user._id }}, {"$set":{"isRead": true}})

        room.dialog.messages = await Message
            .find({dialogId: room.dialog._id, isDelete: false})
            .populate([
                {
                    path: 'user',
                    select: ['_id', 'email', 'name', 'online', 'color']
                },
                {
                    path: 'recentMessages', 
                    populate: [
                        {
                            path: 'user',
                            select: ['_id', 'email', 'name', 'online', 'color']
                        }, 
                        {
                            path: 'recentMessages',
                            populate: {
                                path: 'user',
                                select: ['_id', 'email', 'name', 'online', 'color']
                            }
                        }
                    ]
                }
            ])
            
        try {
            return res.json(room);
        } catch (e) {
            return next(new Error(e));
        }
    },

    create: async (req, res, next) => {
        // Get this account as JSON
        const { user } = res.locals;
        const { lang, title, isPrivate } = req.body;

        const dialog = new Dialog()
        await dialog.save()
        
        const room = new Room()

        let colors = ["26, 188, 156",'46, 204, 113','52, 152, 219','155, 89, 182','233, 30, 99','241, 196, 15','230, 126, 34','231, 76, 60']

        room.title = title
        room.lang = lang
        room.isPrivate = isPrivate
        room.ownerId = user._id
        room.dialog = dialog
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

    sendMessage: async (req, res, next) => {
        const { user } = res.locals;
        const { text, dialogId, socketId, roomId, recentMessages } = req.body;        

        let message = new Message()
        
        message.text = text,
        message.user = user,
        message.dialogId = dialogId,
        

        message.recentMessages = await Message.find({_id: {"$in": recentMessages}}).populate([
            {
                path: 'user',
                select: ['_id', 'email', 'name', 'online', 'color']
            },
            {
                path: 'recentMessages', 
                populate: [
                    {
                        path: 'user',
                        select: ['_id', 'email', 'name', 'online', 'color']
                    }, 
                    {
                        path: 'recentMessages',
                        populate: {
                            path: 'user',
                            select: ['_id', 'email', 'name', 'online', 'color']
                        }
                    }
                ]
            }
        ])
        
        await message.save()

        sendMessageRoom({roomId, socketId, message})

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
    },

    editMessage: async (req, res, next) => {
        
    },

    deleteMessage: async (req, res, next) => {
        const { user } = res.locals;
        const { socketId, roomId, messageIds } = req.body;

        let result = await Message.updateMany({_id: {'$in': messageIds}, user: {_id: user._id}}, {"$set":{"isDelete": true}})
        
        if(result.nModified === messageIds.length) {
            deleteMessageRoom({roomId, socketId, messageIds})
        }
    },
}

function randomInteger(min, max) {
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
}