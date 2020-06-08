/**
 * RoomController.js
 * Author: Roman Shuvalov
 */
'use strict';

const Dialog = require('../models/Dialog');
const Message = require('../models/Message');
const User = require('../models/User');

const {sendMessageDialog, readMessageDialog, editMessageDialog, deleteMessageDialog} = require('./SocketController')

module.exports = {
    getAll: async (req, res, next) => {
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
            ]).sort({createdAt: 'DESC'});

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
                    select: ['_id', 'name', 'online', 'color']
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

    sendMessage: async (req, res, next) => {
        const { user } = res.locals;
        let { userId, text, dialogId, socketId, recentMessages } = req.body;
        
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

            let dialog = await Dialog.findById(dialogId).populate('lastMessage')

            dialog.lastMessage = message
            dialog.noRead = dialog.noRead + 1
            dialog.updatedAt = new Date()

            await dialog.save()

            sendMessageDialog({userId: user._id, otherId: userId, socketId, message})

            return res.json(message);
        } catch (e) {
            return next(new Error(e));
        }
    },

    editMessage: async (req, res, next) => {
        const { user } = res.locals;
        let { _id, text, oldImages, oldSounds, oldFiles, dialogId, socketId, userId, recentMessages } = req.body;    
        
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
                .find({dialogId: dialog._id, isDelete: false, _id: { $lte: lastMessageId }})
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
            }

            let noReadCount = 0

            const noReadDialogs = await Dialog.find({noRead: {'$ne': 0}, 'users': {'$all': [otherId]}}).populate([
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
        const { otherId, dialogId, socketId } = req.body;

        try {
            let result = await Message.updateMany({dialogId, 'user': { "$ne": user._id } }, {"$set":{"isRead": true}})

            let dialog = await Dialog.findById(dialogId)

            dialog.noRead = 0

            await dialog.save()
            
            if(result.nModified) {
                readMessageDialog({otherId, dialogId, userId: user._id, socketId})
            }

            return next()
        } catch (e) {
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