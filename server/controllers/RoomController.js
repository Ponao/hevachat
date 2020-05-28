/**
 * RoomController.js
 * Author: Roman Shuvalov
 */
'use strict';

const Room = require('../models/Room');
const Dialog = require('../models/Dialog');
const Message = require('../models/Message');

const {sendMessageRoom, deleteMessageRoom, readMessageRoom, editMessageRoom} = require('./SocketController')

module.exports = {
    getAll: async (req, res, next) => {
        const { user } = res.locals;
        const { lang } = req.body;

        const rooms = await Room.find({lang: lang}).populate('users').sort({createdAt: 'DESC'});

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
        
        let room = await Room.findOne({_id: id}).populate('users').populate('dialog');

        if(room === null) {
            const err = {};
            err.param = `all`;
            err.msg = `room_delete_or_not_found`;
            return res.status(401).json({ error: true, errors: [err] });
        }

        let result = await Message.updateMany({"isRead": false, "dialogId": room.dialog._id, 'user': { "$ne": user._id }}, {"$set":{"isRead": true}})

        if(result.nModified) {
            readMessageRoom({roomId: id})
        }

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
            .sort({createdAt: 'DESC'})
            .limit(50)
            
        try {
            return res.json(room);
        } catch (e) {
            return next(new Error(e));
        }
    },

    loadMessage: async (req, res, next) => {
        const { user } = res.locals;
        let { dialogId, lastMessageId } = req.body;

        let messages = await Message
            .find({dialogId, isDelete: false, _id: { $lte: lastMessageId }})
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
            .sort({createdAt: 'DESC'})
            .limit(50)

        try {
            return res.json(messages);
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
        let { text, dialogId, socketId, roomId, recentMessages } = req.body;
        
        if(!/\S/.test(text) && !recentMessages.length && !req.files) {
            let err = {};
            err.param = `all`;
            err.msg = `empty_message`;
            return res.status(401).json({ error: true, errors: [err] });
        }

        if(recentMessages)
            recentMessages = recentMessages.split(',')
        else
            recentMessages = []

        let message = new Message()

        let images = []
        let sounds = []
        let files = []

        if(req.files) {
            let maxCount = 10
            let nowCount = 1

            for (let i = 0; i < 10; i++) {
                let fileName = randomString(24)

                if(!req.files['images'+i] || nowCount >= maxCount)
                    break

                req.files['images'+i].mv('./uploads/' + user._id + '/' +fileName+'.' + req.files['images'+i].name.split('.').pop(), function(err) {
                    if (err)
                    return res.status(500).send(err);
                });
                
                images.push({
                    path: process.env.API_URL + '/media/' + user._id + '/'  + fileName + '.' + req.files['images'+i].name.split('.').pop(),
                    name: req.files['images'+i].name
                })
                nowCount++
            }

            for (let i = 0; i < 10; i++) {
                let fileName = randomString(24)

                if(!req.files['sounds'+i] || nowCount >= maxCount)
                    break

                req.files['sounds'+i].mv('./uploads/' + user._id + '/' +fileName+'.' + req.files['sounds'+i].name.split('.').pop(), function(err) {
                    if (err)
                    return res.status(500).send(err);
                });
                
                sounds.push({
                    path: process.env.API_URL + '/media/' + user._id + '/'  + fileName + '.' + req.files['sounds'+i].name.split('.').pop(),
                    name: req.files['sounds'+i].name
                })
                nowCount++
            }

            for (let i = 0; i < 10; i++) {
                let fileName = randomString(24)

                if(!req.files['files'+i] || nowCount >= maxCount)
                    break

                req.files['files'+i].mv('./uploads/' + user._id + '/' + fileName+'.' + req.files['files'+i].name.split('.').pop(), function(err) {
                    if (err)
                    return res.status(500).send(err);
                });
                
                files.push({
                    path: process.env.API_URL + '/media/' + user._id + '/'  + fileName + '.' + req.files['files'+i].name.split('.').pop(),
                    name: req.files['files'+i].name,
                    size: req.files['files'+i].size / 1000
                })
                nowCount++
            }
        }
        
        message.text = text
            .replace(/(^\s*(?!.+)\n+)|(\n+\s+(?!.+)$)/g, "")
            .replace(/(\r\n|\r|\n){2,}/g, '$1\n')
        message.user = user
        message.dialogId = dialogId
        message.images = images
        message.sounds = sounds
        message.files = files
        
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
        const { user } = res.locals;
        let { _id, text, oldImages, oldSounds, oldFiles, dialogId, socketId, roomId, recentMessages } = req.body;    
        
        if(!/\S/.test(text) && !recentMessages.length && !req.files) {
            let err = {};
            err.param = `all`;
            err.msg = `empty_message`;
            return res.status(401).json({ error: true, errors: [err] });
        }

        if(oldImages)
            oldImages = oldImages.split(',')
        else
            oldImages = []
        
        if(oldSounds)
            oldSounds = oldSounds.split(',')
        else
            oldSounds = []

        if(oldFiles)
            oldFiles = oldFiles.split(',')
        else
            oldFiles = []

        if(recentMessages)
            recentMessages = recentMessages.split(',')
        else
            recentMessages = []

        let message = await Message.findById(_id)

        message.images = message.images.filter((x, i) => oldImages.find(y => y !== i))
        message.files = message.files.filter((x, i) => oldFiles.find(y => y !== i))
        message.sounds = message.sounds.filter((x, i) => oldSounds.find(y => y !== i))

        if(req.files) {
            let maxCount = 10
            let nowCount = message.images.length + message.files.length + message.sounds.length

            let imageI = 0
            if(oldImages.length)
                imageI = oldImages.length
            for (let i = imageI; i < 10; i++) {
                let fileName = randomString(24)

                if(!req.files['images'+i] || nowCount >= maxCount)
                    break

                req.files['images'+i].mv('./uploads/' + user._id + '/' +fileName+'.' + req.files['images'+i].name.split('.').pop(), function(err) {
                    if (err)
                    return res.status(500).send(err);
                });
                
                message.images.push({
                    path: process.env.API_URL + '/media/' + user._id + '/'  + fileName + '.' + req.files['images'+i].name.split('.').pop(),
                    name: req.files['images'+i].name
                })
                nowCount++
            }

            let soundI = 0
            if(oldSounds.length)
                soundI = oldSounds.length
            for (let i = soundI; i < 10; i++) {
                let fileName = randomString(24)

                if(!req.files['sounds'+i] || nowCount >= maxCount)
                    break

                req.files['sounds'+i].mv('./uploads/' + user._id + '/' +fileName+'.' + req.files['sounds'+i].name.split('.').pop(), function(err) {
                    if (err)
                    return res.status(500).send(err);
                });
                
                message.sounds.push({
                    path: process.env.API_URL + '/media/' + user._id + '/'  + fileName + '.' + req.files['sounds'+i].name.split('.').pop(),
                    name: req.files['sounds'+i].name
                })
                nowCount++
            }

            let fileI = 0
            if(oldFiles.length)
                fileI = oldFiles.length
            for (let i = fileI; i < 10; i++) {
                let fileName = randomString(24)

                if(!req.files['files'+i] || nowCount >= maxCount)
                    break

                req.files['files'+i].mv('./uploads/' + user._id + '/' + fileName+'.' + req.files['files'+i].name.split('.').pop(), function(err) {
                    if (err)
                    return res.status(500).send(err);
                });
                
                message.files.push({
                    path: process.env.API_URL + '/media/' + user._id + '/'  + fileName + '.' + req.files['files'+i].name.split('.').pop(),
                    name: req.files['files'+i].name,
                    size: req.files['files'+i].size / 1000
                })
                nowCount++
            }
        }
        
        message.text = text
            .replace(/(^\s*(?!.+)\n+)|(\n+\s+(?!.+)$)/g, "")
            .replace(/(\r\n|\r|\n){2,}/g, '$1\n')
        message.user = user
        message.dialogId = dialogId
        message.isEdit = true

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

        editMessageRoom({roomId, socketId, message})

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

    deleteMessage: async (req, res, next) => {
        const { user } = res.locals;
        const { socketId, roomId, messageIds } = req.body;

        let result = await Message.updateMany({_id: {'$in': messageIds}, 'user': { _id: user._id } }, {"$set":{"isDelete": true}})

        if(result.deletedCount === messageIds.length) {
            deleteMessageRoom({roomId, socketId, messageIds})
        }
    },

    readMessages: async (req, res, next) => {
        const { user } = res.locals;
        const { roomId, dialogId } = req.body;

        let result = await Message.updateMany({dialogId, 'user': { "$ne": user._id } }, {"$set":{"isRead": true}})
        
        if(result.nModified) {
            readMessageRoom({roomId})
        }

        // res.json({dasd: 123})
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