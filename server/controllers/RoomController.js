/**
 * RoomController.js
 * Author: Roman Shuvalov
 */
'use strict';

const Room = require('../models/Room');
const Dialog = require('../models/Dialog');
const Limit = require('../models/Limit');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { validationResult } = require("express-validator");
const Investment = require('../models/Investment');
const Payment = require('../models/Payment');
const sizeOf = require('image-size');

const {sendMessageRoom, deleteMessageRoom, readMessageRoom, editMessageRoom, findBySocketId, sendNotification, editRoom, deleteRoom, muteRoom, unmuteRoom, banRoom} = require('./SocketController')
const {getUserExistById, addUserRoom, muteUserRoom, unmuteUserRoom, checkBusy} = require('./WebRtcController');
const { sendPushNotification } = require('./PushNotificationsController');
const User = require('../models/User');

module.exports = {
    getAll: async (req, res, next) => {
        const { user } = res.locals;
        const { lang } = req.body;

        try {
            const rooms = await Room.find({lang: lang}).populate('users').sort({createdAt: 'DESC'}).limit(20);

            return res.json(rooms);
        } catch (e) {
            return next(new Error(e));
        }
    },

    get: async (req, res, next) => {
        const { user } = res.locals;
        let { id, socketId } = req.body;

        try {
            let payment = await Payment.findOne({userId: user._id, expiriesAt: {'$gte': Date.now()}})

            if(!payment) {
                const err = {};
                err.param = `all`;
                err.msg = `dont_have_payment`;
                return res.status(401).json({ error: true, errors: [err] });
            }

            if(!findBySocketId(socketId)) {
                const err = {};
                err.param = `all`;
                err.msg = `something_goes_wrong`;
                return res.status(401).json({ error: true, errors: [err] });
            }

            id = id + ''

            if(!id.match(/^[0-9a-fA-F]{24}$/)) {
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

            let muted = await Limit.findOne({room: room._id, userId: user._id, type: 'mute', date: {$gte: new Date()}})
            
            if(muted) {
                muted = {numDate: muted.numDate, date: muted.date}
            } else {
                muted = false
            }

            let ban = await Limit.findOne({room: room._id, userId: user._id, type: 'banroom', date: {$gte: new Date()}})

            if(ban) {
                const err = {};
                err.param = `all`;
                err.msg = `you_banned_in_this_room`;
                err.ban = {numDate: ban.numDate, date: ban.date}
                return res.status(401).json({ error: true, errors: [err] });
            }

            if(room.isPrivate) {
                let existInvite = await Notification.findOne({type: 'invite', userId: user._id, room: {_id: room._id}})

                if(!existInvite && room.ownerId != String(user._id)) {
                    const err = {};
                    err.param = `all`;
                    err.msg = `you_are_not_invited`;
                    return res.status(401).json({ error: true, errors: [err] });
                }
            }

            if(getUserExistById(user._id) || checkBusy(user._id)) {
                const err = {};
                err.param = `all`;
                err.msg = `have_active_call`;
                return res.status(401).json({ error: true, errors: [err] });
            } else {
                addUserRoom(room._id, user._id, socketId, muted)
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
        
            return res.json({room, muted});
        } catch (e) {
            return next(new Error(e));
        }
    },

    load: async (req, res, next) => {
        const { user } = res.locals;
        const { lastRoomId, lang } = req.body;

        try {
            const rooms = await Room.find({ _id: { $lt: lastRoomId}, lang: lang})
            .populate('users')
            .sort({createdAt: 'DESC'})
            .limit(20);

            return res.json(rooms);
        } catch (e) {
            return next(new Error(e));
        }
    },

    search: async (req, res, next) => {
        const { user } = res.locals;
        const { q } = req.body;

        let searchFirst = false
        let searchLast = false
        let search = false

        try {
            let search = new RegExp(q, 'ig')

            let rooms = false
            
            if(search)
                rooms = await Room.find(
                    {'$or': [{'title': search}]}
                )

            if(rooms)
                return res.json(rooms);
        } catch (err) {
            return next(new Error(err));
        }
    },

    loadMessage: async (req, res, next) => {
        const { user } = res.locals;
        let { dialogId, lastMessageId } = req.body;

        try {
            let messages = await Message
                .find({dialogId, isDelete: false, _id: { $lt: lastMessageId }})
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

            return res.json(messages);
        } catch (e) {
            return next(new Error(e));
        }
    },

    create: async (req, res, next) => {
        // Get this account as JSON
        const { user } = res.locals;
        const { lang, title, isPrivate, selectUsers } = req.body;

        const existRoom = await Room.findOne({title})

        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ error: true, errors: errors.array() });
            }

            if(existRoom) {
                const err = {};
                err.param = `title`;
                err.msg = `room_exist`;
                return res.status(409).json({ error: true, errors: [err] });
            }

            const countRooms = await Room.find({ownerId: user._id}).countDocuments()

            if(countRooms >= 5) {
                const err = {};
                err.param = `title`;
                err.msg = `have_max_rooms`;
                return res.status(409).json({ error: true, errors: [err] });
            }

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

            selectUsers.map(async id => {
                if(user._id != id) {
                    let notification = new Notification()

                    notification.user = user
                    notification.userId = id
                    notification.type = 'invite'
                    notification.room = room

                    let otherUser = await User.findOne({_id: id}).select('+pushToken')
                    if(otherUser && otherUser.pushToken) {
                        let data = { 
                            text: room.title,
                            push_ids: [otherUser.pushToken.id],
                            icon: 'invite_icon',
                            color: '008FF7',
                            header_text: `${user.name.first} ${user.name.last}`,
                            avatar: user.avatar ? user.avatar.min : '',
                            group_id: `invite${user._id}`,
                            channel_id: 'b5453baa-e480-4e17-b916-d5c20e82be43',
                            group_name: 'invite',
                            additional: {
                                roomId: room._id,
                                type: 'invite'
                            },
                            os: otherUser.pushToken.os
                        };
                
                        sendPushNotification(data).then(async (id) => {
                            
                        })
                    }

                    sendNotification({userId: id, notification})

                    await notification.save()
                }
            })

            return res.json(room);
        } catch (e) {
            return next(new Error(e));
        }
    },

    invite: async (req, res, next) => {
        const { user } = res.locals;
        const { id, selectUsers } = req.body;

        try{
            const room = await Room.findById(id)

            selectUsers.map(async userId => {
                let exist = await Notification.findOne({type: 'invite', userId, room: {_id: room._id}})
                if(!exist) {
                    if(user._id != userId) {
                        let notification = new Notification()
                        
                        notification.user = user
                        notification.userId = userId
                        notification.type = 'invite'
                        notification.room = room

                        let otherUser = await User.findOne({_id: userId}).select('+pushToken')
                        if(otherUser && otherUser.pushToken) {
                            let data = { 
                                text: room.title,
                                push_ids: [otherUser.pushToken.id],
                                icon: 'invite_icon',
                                color: '008FF7',
                                header_text: `${user.name.first} ${user.name.last}`,
                                avatar: user.avatar ? user.avatar.min : '',
                                group_id: `invite${user._id}`,
                                channel_id: 'b5453baa-e480-4e17-b916-d5c20e82be43',
                                group_name: 'invite',
                                additional: {
                                    roomId: room._id,
                                    type: 'invite'
                                },
                                os: otherUser.pushToken.os
                            };
                    
                            sendPushNotification(data).then(async (id) => {
                                
                            })
                        }

                        sendNotification({userId, notification})

                        await notification.save()
                    }
                }
            })

            return res.json();
        } catch (e) {
            return next(new Error(e));
        }
    },

    delete: async (req, res, next) => {
        // Get this account as JSON
        const { user } = res.locals;
        const { id } = req.body;

        try {
            const room = await Room.findById(id)

            if(room && (user._id == room.ownerId  || user.role == 'admin' || user.role == 'moder')) {
                await Room.deleteOne({_id: id})

                deleteRoom({roomId: id, lang: room.lang})

                await Limit.deleteMany({room: {_id: id}})
                await Notification.deleteMany({type: 'invite', room: {_id: room._id}})
            }

            return res.json();
        } catch (e) {
            return next(new Error(e));
        }
    },

    edit: async (req, res, next) => {
        // Get this account as JSON
        const { user } = res.locals;
        const { title, isPrivate, id } = req.body;

        try {
            const existRoom = await Room.findOne({title})
            const room = await Room.findById(id)

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ error: true, errors: errors.array() });
            }

            if(existRoom && room.title != title) {
                const err = {};
                err.param = `title`;
                err.msg = `room_exist`;
                return res.status(409).json({ error: true, errors: [err] });
            }

            if(user._id != room.ownerId && (user.role != 'admin' && user.role != 'moder')) {
                const err = {};
                err.param = `title`;
                err.msg = `dont_have_permissions`;
                return res.status(409).json({ error: true, errors: [err] });
            }

            editRoom({roomId: room._id, lang: room.lang, room: {isPrivate, title, _id: room._id}})

            room.title = title
            room.isPrivate = isPrivate

            await room.save()
            
            return res.json({error: false});
        } catch (e) {
            return next(new Error(e));
        }
    },

    sendMessage: async (req, res, next) => {
        const { user } = res.locals;
        let { text, dialogId, socketId, roomId, recentMessages } = req.body;
        
        try {
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

                    if(req.files['images'+i].size / 1000 <= 10000) {
                        let mv = (path) => {
                            return new Promise((resolve, reject) => {
                                req.files['images'+i].mv(path, (err) => {
                                    if (err)
                                        reject(err);
                                    
                                    resolve()
                                })
                            })
                        }
                        await mv('./uploads/' + user._id + '/' +fileName+'.' + req.files['images'+i].name.split('.').pop());
                        
                        let dimensions = sizeOf('./uploads/' + user._id + '/' +fileName+'.' + req.files['images'+i].name.split('.').pop());

                        let investment = new Investment()

                        investment.dialogId = dialogId
                        investment.type = 'image'
                        investment.data = {
                            path: process.env.API_URL + '/media/' + user._id + '/'  + fileName + '.' + req.files['images'+i].name.split('.').pop(),
                            dimensions
                        }
                        
                        await investment.save()
                        
                        images.push({
                            path: process.env.API_URL + '/media/' + user._id + '/'  + fileName + '.' + req.files['images'+i].name.split('.').pop(),
                            name: req.files['images'+i].name,
                            dimensions
                        })
                        nowCount++
                    } else {
                        let err = {};
                        err.param = `all`;
                        err.msg = `max_size`;
                        return res.status(401).json({ error: true, errors: [err] });
                    }
                }

                for (let i = 0; i < 10; i++) {
                    let fileName = randomString(24)

                    if(!req.files['sounds'+i] || nowCount >= maxCount)
                        break

                    if(req.files['sounds'+i].size / 1000 <= 10000) {
                        req.files['sounds'+i].mv('./uploads/' + user._id + '/' +fileName+'.' + req.files['sounds'+i].name.split('.').pop(), function(err) {
                            if (err)
                            return res.status(500).send(err);
                        });

                        let investment = new Investment()

                        investment.dialogId = dialogId
                        investment.type = 'sound'
                        investment.data = {
                            path: process.env.API_URL + '/media/' + user._id + '/'  + fileName + '.' + req.files['sounds'+i].name.split('.').pop(),
                            name: req.files['sounds'+i].name
                        }
                        
                        await investment.save()
                        
                        sounds.push({
                            path: process.env.API_URL + '/media/' + user._id + '/'  + fileName + '.' + req.files['sounds'+i].name.split('.').pop(),
                            name: req.files['sounds'+i].name
                        })
                        nowCount++
                    } else {
                        let err = {};
                        err.param = `all`;
                        err.msg = `max_size`;
                        return res.status(401).json({ error: true, errors: [err] });
                    }
                }

                for (let i = 0; i < 10; i++) {
                    let fileName = randomString(24)

                    if(!req.files['files'+i] || nowCount >= maxCount)
                        break

                    if(req.files['files'+i].size / 1000 <= 10000) {
                        req.files['files'+i].mv('./uploads/' + user._id + '/' + fileName+'.' + req.files['files'+i].name.split('.').pop(), function(err) {
                            if (err)
                            return res.status(500).send(err);
                        });

                        let investment = new Investment()

                        investment.dialogId = dialogId
                        investment.type = 'file'
                        investment.data = {
                            path: process.env.API_URL + '/media/' + user._id + '/'  + fileName + '.' + req.files['files'+i].name.split('.').pop(),
                            name: req.files['files'+i].name,
                            size: req.files['files'+i].size / 1000
                        }
                        
                        await investment.save()
                        
                        files.push({
                            path: process.env.API_URL + '/media/' + user._id + '/'  + fileName + '.' + req.files['files'+i].name.split('.').pop(),
                            name: req.files['files'+i].name,
                            size: req.files['files'+i].size / 1000
                        })
                        nowCount++
                    } else {
                        let err = {};
                        err.param = `all`;
                        err.msg = `max_size`;
                        return res.status(401).json({ error: true, errors: [err] });
                    }
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

            return res.json(message);
        } catch (e) {
            return next(new Error(e));
        }
    },

    editMessage: async (req, res, next) => {
        const { user } = res.locals;
        let { _id, text, oldImages, oldSounds, oldFiles, dialogId, socketId, roomId, recentMessages } = req.body;    
        
        try {
            if(!/\S/.test(text) && !recentMessages.length && !oldImages.length && !oldSounds.length && !oldFiles.length && !req.files) {
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

            let message = await Message.findOne({_id, 'user': {_id: user._id}})

            if(!message) {
                let err = {};
                err.param = `all`;
                err.msg = `message_not_found`;
                return res.status(401).json({ error: true, errors: [err] });
            }

            message.images = message.images.filter((x, i) => oldImages.find(y => String(y) === String(i)))
            message.files = message.files.filter((x, i) => oldFiles.find(y => String(y) === String(i)))
            message.sounds = message.sounds.filter((x, i) => oldSounds.find(y => String(y) === String(i)))

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

                    if(req.files['images'+i].size / 1000 <= 10000) {
                        let mv = (path) => {
                            return new Promise((resolve, reject) => {
                                req.files['images'+i].mv(path, (err) => {
                                    if (err)
                                        reject(err);
                                    
                                    resolve()
                                })
                            })
                        }
                        await mv('./uploads/' + user._id + '/' +fileName+'.' + req.files['images'+i].name.split('.').pop());
                        
                        let dimensions = sizeOf('./uploads/' + user._id + '/' +fileName+'.' + req.files['images'+i].name.split('.').pop());

                        let investment = new Investment()

                        investment.dialogId = dialogId
                        investment.type = 'image'
                        investment.data = {
                            path: process.env.API_URL + '/media/' + user._id + '/'  + fileName + '.' + req.files['images'+i].name.split('.').pop(),
                            dimensions
                        }
                        
                        await investment.save()
                        
                        message.images.push({
                            path: process.env.API_URL + '/media/' + user._id + '/'  + fileName + '.' + req.files['images'+i].name.split('.').pop(),
                            name: req.files['images'+i].name,
                            dimensions
                        })
                        nowCount++
                    } else {
                        let err = {};
                        err.param = `all`;
                        err.msg = `max_size`;
                        return res.status(401).json({ error: true, errors: [err] });
                    }
                }

                let soundI = 0
                if(oldSounds.length)
                    soundI = oldSounds.length
                for (let i = soundI; i < 10; i++) {
                    let fileName = randomString(24)

                    if(!req.files['sounds'+i] || nowCount >= maxCount)
                        break

                    if(req.files['sounds'+i].size / 1000 <= 10000) {
                        req.files['sounds'+i].mv('./uploads/' + user._id + '/' +fileName+'.' + req.files['sounds'+i].name.split('.').pop(), function(err) {
                            if (err)
                            return res.status(500).send(err);
                        });

                        let investment = new Investment()

                        investment.dialogId = dialogId
                        investment.type = 'sound'
                        investment.data = {
                            path: process.env.API_URL + '/media/' + user._id + '/'  + fileName + '.' + req.files['sounds'+i].name.split('.').pop(),
                            name: req.files['sounds'+i].name
                        }
                        
                        await investment.save()
                        
                        message.sounds.push({
                            path: process.env.API_URL + '/media/' + user._id + '/'  + fileName + '.' + req.files['sounds'+i].name.split('.').pop(),
                            name: req.files['sounds'+i].name
                        })
                        nowCount++
                    } else {
                        let err = {};
                        err.param = `all`;
                        err.msg = `max_size`;
                        return res.status(401).json({ error: true, errors: [err] });
                    }
                }

                let fileI = 0
                if(oldFiles.length)
                    fileI = oldFiles.length
                for (let i = fileI; i < 10; i++) {
                    let fileName = randomString(24)

                    if(!req.files['files'+i] || nowCount >= maxCount)
                        break

                    if(req.files['files'+i].size / 1000 <= 10000) {
                        req.files['files'+i].mv('./uploads/' + user._id + '/' + fileName+'.' + req.files['files'+i].name.split('.').pop(), function(err) {
                            if (err)
                            return res.status(500).send(err);
                        });

                        let investment = new Investment()

                        investment.dialogId = dialogId
                        investment.type = 'file'
                        investment.data = {
                            path: process.env.API_URL + '/media/' + user._id + '/'  + fileName + '.' + req.files['files'+i].name.split('.').pop(),
                            name: req.files['files'+i].name,
                            size: req.files['files'+i].size / 1000
                        }
                        
                        await investment.save()
                        
                        message.files.push({
                            path: process.env.API_URL + '/media/' + user._id + '/'  + fileName + '.' + req.files['files'+i].name.split('.').pop(),
                            name: req.files['files'+i].name,
                            size: req.files['files'+i].size / 1000
                        })
                        nowCount++
                    } else {
                        let err = {};
                        err.param = `all`;
                        err.msg = `max_size`;
                        return res.status(401).json({ error: true, errors: [err] });
                    }
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

            return res.json(message);
        } catch (e) {
            return next(new Error(e));
        }
    },

    deleteMessage: async (req, res, next) => {
        const { user } = res.locals;
        const { socketId, roomId, messageIds } = req.body;

        try {
            let result = await Message.updateMany({_id: {'$in': messageIds}, 'user': { _id: user._id } }, {"$set":{"isDelete": true}})
    
            if(result.nModified === messageIds.length) {
                deleteMessageRoom({roomId, socketId, messageIds})
            }

            return next()
        } catch (e) {
            return next(new Error(e));
        }
    },

    readMessages: async (req, res, next) => {
        const { user } = res.locals;
        const { roomId, dialogId } = req.body;
        try {
            let result = await Message.updateMany({dialogId, 'user': { "$ne": user._id } }, {"$set":{"isRead": true}})
            
            if(result.nModified) {
                readMessageRoom({roomId})
            }

            return next()
        } catch (e) {
            return next(new Error(e));
        }
    },

    getInvestments: async(req, res, next) => {
        const { user } = res.locals;
        const { type, roomId } = req.body;

        try {
            if(!roomId.match(/^[0-9a-fA-F]{24}$/)) {
                return res.json([]);
            }

            let room = await Room.findById(roomId).populate('dialog')
            
            if(!room) {
                return res.json([]);
            }

            if(room.isPrivate) {
                let existInvite = await Notification.findOne({type: 'invite', userId: user._id, room: {_id: room._id}})

                if(!existInvite && room.ownerId != String(user._id)) {
                    return res.json([]);
                }
            }

            const dialogId = String(room.dialog._id)

            let investments = await Investment.find({dialogId, type}).sort({createdAt: 'DESC'})

            if(investments) {
                return res.json(investments);
            } else {
                return res.json([]);
            }
        } catch(e) {
            return next(new Error(e));
        }
    },

    mute: async (req, res, next) => {
        const { user } = res.locals;
        const { userId, roomId, time } = req.body;

        try {
            if(user.role == 'moder' || user.role == 'admin') {
                await Limit.deleteOne({userId: userId, room: {_id: roomId}, type: 'mute'})

                let limit = new Limit()
                limit.userId = userId
                limit.room = await Room.findOne({_id: roomId})
                limit.date = new Date(Date.now() + time*1000)
                limit.numDate = time
                limit.type = 'mute'
                await limit.save()

                let muted  = {numDate: limit.numDate, date: limit.date}

                muteUserRoom(roomId, userId)
                muteRoom({roomId, muted, userId})
                return res.json({error: false});
            } else {
                return res.json({error: true});
            }
        } catch(e) {
            return next(new Error(e));
        }
    },

    unmute: async (req, res, next) => {
        const { user } = res.locals;
        const { userId, roomId } = req.body;

        try {
            if(user.role == 'moder' || user.role == 'admin') {
                await Limit.deleteOne({userId: userId, room: {_id: roomId}, type: 'mute'})

                unmuteUserRoom(roomId, userId)
                unmuteRoom({roomId, userId})
                return res.json({error: false});
            } else {
                return res.json({error: true});
            }
        } catch(e) {
            return next(new Error(e));
        }
    },

    ban: async (req, res, next) => {
        const { user } = res.locals;
        const { userId, roomId, time } = req.body;

        try {
            if(user.role == 'moder' || user.role == 'admin') {
                await Limit.deleteOne({userId: userId, room: {_id: roomId}, type: 'banroom'})

                let limit = new Limit()
                limit.userId = userId
                limit.room = await Room.findOne({_id: roomId})
                limit.date = new Date(Date.now() + time*1000)
                limit.numDate = time
                limit.type = 'banroom'
                await limit.save()

                let ban  = {numDate: limit.numDate, date: limit.date}

                banRoom({roomId, ban, userId})
                return res.json({error: false});
            } else {
                return res.json({error: true});
            }
        } catch(e) {
            return next(new Error(e));
        }
    },

    unban: async (req, res, next) => {
        const { user } = res.locals;
        const { userId, roomId } = req.body;

        try {
            if(user.role == 'moder' || user.role == 'admin') {
                await Limit.deleteOne({userId: userId, room: {_id: roomId}, type: 'banroom'})

                return res.json({error: false});
            } else {
                return res.json({error: true});
            }
        } catch(e) {
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