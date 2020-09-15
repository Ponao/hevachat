/**
 * RoomController.js
 * Author: Roman Shuvalov
 */
'use strict';

const Dialog = require('../models/Dialog');
const Message = require('../models/Message');
const Investment = require('../models/Investment');
const User = require('../models/User');
const sizeOf = require('image-size');
const { promisify } = require('util')
const imageThumbnail = require('image-thumbnail');
const fs = require('fs');

const {sendMessageDialog, readMessageDialog, editMessageDialog, deleteMessageDialog} = require('./SocketController');
const { sendPushNotification, removePushNotification } = require('./PushNotificationsController');
const languages = require('../languages');
// const readdir = util.promisify(fs.readdir);
module.exports = {
    getAll: async (req, res, next) => {
        const { user } = res.locals;

        try {
            const dialogs = await Dialog.find({'users': {'$all': [user._id]}}).populate([
                {
                    path: 'users',
                    select: ['_id', 'name', 'online', 'onlineAt', 'color']
                },
                {
                    path: 'lastMessage',
                    populate: {
                        path: 'user'
                    }
                },
            ]).sort({updatedAt: 'DESC'}).limit(20);

            return res.json(dialogs);
        } catch (e) {
            return next(new Error(e));
        }
    },

    get: async (req, res, next) => {
        const { user } = res.locals;
        let { userId } = req.body;

        try {
            if(userId.match(/^[0-9a-fA-F]{24}$/)) {
                let existUser = await User.findById(userId)

                if(!existUser) {
                    const err = {};
                    err.param = `all`;
                    err.msg = `User not found`;
                    return res.status(401).json({ dialog: {error: true}, errors: [err] });
                } 
            } else {
                const err = {};
                err.param = `all`;
                err.msg = `User not found`;
                return res.status(401).json({ dialog: {error: true}, errors: [err] });
            }

            let query = userId == user._id ? {'$eq': [user._id]} : {'$all': [user._id, userId]}

            let dialog = await Dialog.findOne({'users': query}).populate([
                {
                    path: 'users',
                    select: ['_id', 'name', 'online', 'onlineAt', 'color']
                },
                {
                    path: 'messages'
                },
                {
                    path: 'lastMessage',
                },
            ]).sort({createdAt: 'DESC'});

            if(!dialog) {
                dialog = new Dialog()
                let userTo = await User.findById(userId)

                dialog.users = userId == user._id ? [user] : [user, userTo]

                await dialog.save()
            }

            let messages = await Message
            .find({dialogId: dialog._id, isDelete: false})
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
        
            return res.json({dialog, messages});
        } catch (e) {
            return next(new Error(e));
        }
    },

    load: async (req, res, next) => {
        const { user } = res.locals;
        let { lastDialogId, firstDialogId } = req.body;

        try {
            let dialog = await Dialog.findById(lastDialogId)
            const dialogs = await Dialog.find({'users': {'$all': [user._id]}, 'lastMessage': {$exists: true}, updatedAt: { $lt: dialog.updatedAt }}).populate([
                {
                    path: 'users',
                    select: ['_id', 'name', 'online', 'color', 'onlineAt']
                },
                {
                    path: 'lastMessage',
                    populate: {
                        path: 'user'
                    }
                },
            ]).sort({updatedAt: 'ASC'}).limit(20);

            return res.json(dialogs);
        } catch (e) {
            return next(new Error(e));
        }
    },

    sendMessage: async (req, res, next) => {
        const { user } = res.locals;
        let { userId, text, socketId, recentMessages } = req.body;

        try {
            let query = userId == user._id ? {'$eq': [user._id]} : {'$all': [user._id, userId]}
            let dialog = await Dialog.findOne({'users': query}).populate('lastMessage')
            const dialogId = String(dialog._id)
            let otherUser = await User.findOne({_id: userId}).select('+pushToken')

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
                        let mv = () => {
                            return new Promise((resolve, reject) => {
                                req.files['images'+i].mv('./uploads/' + user._id + '/' +fileName+'.' + req.files['images'+i].name.split('.').pop(), async (err, pathd) => {
                                    if (err)
                                        reject(err);

                                    let options = { responseType: 'base64', width: 50, height: 50 }
                                    let imageBuffer = fs.readFileSync(__dirname + '/../uploads/' + user._id + '/' +fileName+'.' + req.files['images'+i].name.split('.').pop());
                                    let thumbnail = await imageThumbnail(imageBuffer, options);

                                    fs.writeFile(__dirname + '/../uploads/' + user._id + '/' +fileName+'-50.' + req.files['images'+i].name.split('.').pop(), thumbnail, 'base64', function(err) {
                                        console.log(err);
                                    });
                                    
                                    resolve()
                                })
                            })
                        }
                        await mv();

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

                    let typeSound = req.files['sounds'+i].name.split('.').pop()
                    if(
                        typeSound === 'mp3' || 
                        typeSound === 'ogg' || 
                        typeSound === 'wav' ||
                        typeSound === 'flac') {
                        typeSound = 'mp3'
                    }
                    if(req.files['sounds'+i].size / 1000 <= 10000) {
                        req.files['sounds'+i].mv('./uploads/' + user._id + '/' +fileName+'.' + typeSound, function(err) {
                            if (err)
                            return res.status(500).send(err);
                        });

                        let investment = new Investment()

                        investment.dialogId = dialogId
                        investment.type = 'sound'
                        investment.data = {
                            path: process.env.API_URL + '/media/' + user._id + '/'  + fileName + '.' + typeSound,
                            name: req.files['sounds'+i].name
                        }
                        
                        await investment.save()
                        
                        sounds.push({
                            path: process.env.API_URL + '/media/' + user._id + '/'  + fileName + '.' + typeSound,
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

            dialog.lastMessage = message
            dialog.noRead = dialog.noRead + 1
            dialog.updatedAt = new Date()

            await dialog.save()

            if(otherUser.pushToken) {
                if(!text.length) {
                    if(!!recentMessages.length) {
                        text = languages[otherUser.lang].attach_message
                    }

                    if(!!message.sounds.length) {
                        text = languages[otherUser.lang].sound
                    }

                    if(!!message.files.length) {
                        text = languages[otherUser.lang].file
                    }

                    if(!!message.images.length) {
                        text = languages[otherUser.lang].photo
                    }
                }

                let data = { 
                    text,
                    push_ids: [otherUser.pushToken.id],
                    icon: 'message_icon',
                    color: '008FF7',
                    header_text: `${user.name.first} ${user.name.last}`,
                    avatar: user.avatar ? user.avatar.min : '',
                    group_id: `dialog${user._id}`,
                    channel_id: '5949773e-fddd-4b91-b3c9-3e4a9f9526b8',
                    group_name: 'message',
                    additional: {
                        userId: user._id,
                        type: 'message'
                    },
                    os: otherUser.pushToken.os
                };
        
                sendPushNotification(data).then(async (id) => {
                    if(id)
                        message.pushId = id
                        
                    sendMessageDialog({userId: user._id, otherId: userId, socketId, message, noRead: dialog.noRead})
                    await message.save()
                })
            } else {
                sendMessageDialog({userId: user._id, otherId: userId, socketId, message, noRead: dialog.noRead})
            }

            return res.json(message);
        } catch (e) {
            return next(new Error(e));
        }
    },

    editMessage: async (req, res, next) => {
        const { user } = res.locals;
        let { _id, text, oldImages, oldSounds, oldFiles, socketId, userId, recentMessages } = req.body;    
        
        try {
            let query = {'$all': [user._id, userId]}
            let dialog = await Dialog.findOne({'users': query})
            const dialogId = String(dialog._id)

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
                        let mv = () => {
                            return new Promise((resolve, reject) => {
                                req.files['images'+i].mv('./uploads/' + user._id + '/' +fileName+'.' + req.files['images'+i].name.split('.').pop(), async (err, pathd) => {
                                    if (err)
                                        reject(err);
                                        
                                    let options = { responseType: 'base64', width: 50, height: 50 }
                                    let imageBuffer = fs.readFileSync(__dirname + '/../uploads/' + user._id + '/' +fileName+'.' + req.files['images'+i].name.split('.').pop());
                                    let thumbnail = await imageThumbnail(imageBuffer, options);

                                    fs.writeFile(__dirname + '/../uploads/' + user._id + '/' +fileName+'-50.' + req.files['images'+i].name.split('.').pop(), thumbnail, 'base64', function(err) {
                                        console.log(err);
                                    });
                                    
                                    resolve()
                                })
                            })
                        }
                        await mv();
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
                    let typeSound = req.files['sounds'+i].name.split('.').pop()
                    if(
                        typeSound === 'mp3' || 
                        typeSound === 'ogg' || 
                        typeSound === 'wav' ||
                        typeSound === 'flac') {
                        typeSound = 'mp3'
                    }

                    if(req.files['sounds'+i].size / 1000 <= 10000) {
                        req.files['sounds'+i].mv('./uploads/' + user._id + '/' +fileName+'.' + typeSound, function(err) {
                            if (err)
                            return res.status(500).send(err);
                        });

                        let investment = new Investment()

                        investment.dialogId = dialogId
                        investment.type = 'sound'
                        investment.data = {
                            path: process.env.API_URL + '/media/' + user._id + '/'  + fileName + '.' + typeSound,
                            name: req.files['sounds'+i].name
                        }
                        
                        await investment.save()
                        
                        message.sounds.push({
                            path: process.env.API_URL + '/media/' + user._id + '/'  + fileName + '.' + typeSound,
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

            editMessageDialog({userId: user._id, socketId, message, dialogId, otherId: userId})

            return res.json(message);
        } catch (e) {
            return next(new Error(e));
        }
    },

    loadMessage: async (req, res, next) => {
        const { user } = res.locals;
        let { dialogId, lastMessageId } = req.body;

        try {
            let dialog = await Dialog.findOne({_id: dialogId, 'users': {'$all': [user._id]}})

            let messages = await Message
                .find({dialogId: dialog._id, isDelete: false, _id: { $lt: lastMessageId }})
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

    deleteMessage: async (req, res, next) => {
        const { user } = res.locals;
        const { socketId, otherId, messageIds, dialogId } = req.body;

        try {
            let cancelNoReadCount = await Message.find({_id: {'$in': messageIds}, 'user': { _id: user._id }, isRead: false}).countDocuments()

            let result = await Message.updateMany({_id: {'$in': messageIds}, 'user': { _id: user._id } }, {"$set":{"isDelete": true}})

            let lastMessage = await Message.findOne({dialogId: dialogId, 'isDelete': false}).sort({ field: 'asc', _id: -1 }).populate([
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
            ]).limit(1)

            let noRead = false
            if(lastMessage) {
                let dialog = await Dialog.findById(dialogId)

                dialog.updatedAt = lastMessage.createdAt
                
                if(cancelNoReadCount) {
                    dialog.noRead = dialog.noRead - cancelNoReadCount
                }

                if(dialog.noRead < 0) {
                    dialog.noRead = 0
                }

                dialog.lastMessage = lastMessage

                await dialog.save()

                noRead = dialog.noRead
            } else {
                lastMessage = false

                await Dialog.update({_id: dialogId}, {$unset: {lastMessage: 1}})
            }

            let noReadCount = 0

            const noReadDialogs = await Dialog.find({noRead: {'$ne': 0}, 'users': {'$all': [otherId]}, 'lastMessage': {$exists: true}}).populate([
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
                if(String(x.lastMessage.user._id) != String(otherId)) {
                    noReadCount++
                } 
            })
            }
            

            if(result.nModified === messageIds.length) {
                deleteMessageDialog({userId: user._id, otherId, socketId, messageIds, dialogId, lastMessage, noRead, noReadCount})
            }
            return next()
        } catch (e) {
            return next(new Error(e));
        }
    },

    readMessages: async (req, res, next) => {
        const { user } = res.locals;
        const { otherId, socketId } = req.body;

        try {
            let query = {'$all': [user._id, otherId]}
            let dialog = await Dialog.findOne({'users': query}).populate('lastMessage')
            const dialogId = String(dialog._id)
            let messages = await Message.find({dialogId, 'user': { "$ne": user._id }, isRead: false })
            let result = await Message.updateMany({dialogId, 'user': { "$ne": user._id } }, {"$set":{"isRead": true}})
            
            dialog.noRead = 0
            
            if(messages) {
                messages.map(x => {
                    removePushNotification(x.pushId)
                })
            }

            await dialog.save()
            
            if(result.nModified) {
                readMessageDialog({otherId, dialogId, userId: user._id, socketId})
            }

            return next()
        } catch (e) {
            return next(new Error(e));
        }
    },

    getInvestments: async(req, res, next) => {
        const { user } = res.locals;
        const { type, userId } = req.body;

        try {
            if(!userId.match(/^[0-9a-fA-F]{24}$/)) {
                return res.json([]);
            }

            let query = {'$all': [user._id, userId]}
            let dialog = await Dialog.findOne({'users': query}).populate('lastMessage')

            if(!dialog) {
                return res.json([]);
            }

            const dialogId = String(dialog._id)

            let investments = await Investment.find({dialogId, type}).sort({createdAt: 'DESC'})

            if(investments) {
                return res.json(investments);
            } else {
                return res.json([]);
            }
        } catch(e) {
            return next(new Error(e));
        }
    }
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