/**
 * UserController.js
 * Author: Roman Shuvalov
 */
'use strict';

const User = require('../models/User');
const Message = require('../models/Message');
const Dialog = require('../models/Dialog');
const Limit = require('../models/Limit');
const Friend = require('../models/Friends')
const { validationResult } = require("express-validator");
const Notification = require('../models/Notification');
const mongoose = require("../database");
const {sendRequestFriend, sendAcceptFriend, sendRemoveFriend, sendNotification, removeNotification, sendWarning, sendBan} = require('./SocketController')
const imageThumbnail = require('image-thumbnail');
const fs = require('fs');
const { sendPushNotification } = require('./PushNotificationsController');
const languages = require('../languages');
const Payment = require('../models/Payment');

module.exports = {
    // Get user data
    user: async (req, res, next) => {
        // Get this account as JSON
        const { user } = res.locals;

        try {
            const dialogs = await Dialog.find({'users': {'$all': [user._id]}, 'lastMessage': {$exists: true}}).populate([
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
            ]).sort({updatedAt: 'DESC'}).limit(20);

            let noReadCount = 0

            const noReadDialogs = await Dialog.find({noRead: {'$ne': 0}, 'users': {'$all': [user._id]}, 'lastMessage': {$exists: true}}).populate([
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
                    if(String(x.lastMessage.user._id) != String(user._id)) {
                        noReadCount++
                    } 
                })
            }

            let oneweekago = new Date() - (7 * 24 * 60 * 60 * 1000);
            
            const noReadNotifications = await Notification.find({userId: user._id, isRead: false, createdAt: {"$gte": oneweekago} }).count()
            
            let payment = await Payment.findOne({userId: user._id, status: 'success', expiriesAt: {'$gte': Date.now()}})

            let leftDays = 0

            if(payment) {
                leftDays = (new Date(payment.expiriesAt) - Date.now()) / (24 * 60 * 60 * 1000)
            }

            if (user) {
                return res.json({user, dialogs, noReadCount, noReadNotifications, leftDays});
            }
            const err = new Error(`User ${userId} not found.`);
            err.notFound = true;
            return next(err);
        } catch (e) {
            return next(new Error(e));
        }
    },

    getOnline: async(req, res, next) => {
        const { userId } = req.body;
        
        try {
            let user = await User.findById(userId).select(['online', 'onlineAt'])
            
            return res.json(user);
        } catch (e) {
            return next(new Error(e));
        }
    },

    get: async(req, res, next) => {
        const { user } = res.locals;
        const { userId } = req.body;

        try {
        const friend = await User.aggregate([
            { "$match": { "_id": user._id } },
            { "$lookup": {
              "from": Friend.collection.name,
              "let": { "friends": "$friends" },
              "pipeline": [
                { "$match": {
                  "recipient": mongoose.Types.ObjectId(userId),
                  "$expr": { "$in": [ "$_id", "$$friends" ] }
                }},
                { "$project": { "status": 1 } }
              ],
              "as": "friends"
            }},
            { "$addFields": {
              "friendsStatus": {
                "$ifNull": [ { "$min": "$friends.status" }, 0 ]
              }
            }}
          ])

        
            const userGet = await User.findById(userId)

            if (userGet) {
                return res.json({user: userGet, friendStatus: friend[0].friendsStatus});
            }
            const err = new Error(`User ${userId} not found.`);
            err.notFound = true;
            return next(err);
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
            let words = q.split(' ')

            for (let i = 0; i < 2; i++) {
                if(words[i]) {
                    if(/\S/.test(words[i]) && i === 0)
                        searchFirst = new RegExp(words[i], 'ig')
                    if(/\S/.test(words[i]) && i === 1)
                        searchLast = new RegExp(words[i], 'ig')
                }
            }

            if(searchFirst && searchLast) {
                search = [
                    {'name.first': searchFirst, 'name.last': searchLast}, 
                    {'name.first': searchLast, 'name.last': searchFirst}, 
                ]
            }

            if(searchFirst && !searchLast) {
                search = [
                    {'name.first': searchFirst}, 
                    {'name.last': searchFirst}, 
                ]
            }

            if(!searchFirst && searchLast) {
                search = [
                    {'name.first': searchLast}, 
                    {'name.last': searchLast}, 
                ]
            }

            let users = false
            
            if(searchFirst || searchLast)
                users = await User.find(
                    {'$or': search}
                )

            if(users)
                return res.json(users);
        } catch (err) {
            return next(new Error(err));
        }
    },

    getMute: async(req, res, next) => {
        const { user } = res.locals;
        const { userId, roomId } = req.body;

        try {
            if(user.role == 'moder' || user.role == 'admin') {
                let limits = await Limit.find({userId: userId, type: 'mute', date: {$gte: new Date()}}).populate('room')

                if(!limits) {
                    limits = []
                }

                return res.json(limits);
            } else {
                return res.json({error: true});
            }
        } catch(e) {
            return next(new Error(e));
        }
    },

    getBanroom: async(req, res, next) => {
        const { user } = res.locals;
        const { userId, roomId } = req.body;

        try {
            if(user.role == 'moder' || user.role == 'admin') {
                let limits = await Limit.find({userId: userId, type: 'banroom', date: {$gte: new Date()}}).populate('room')

                if(!limits) {
                    limits = []
                }

                return res.json(limits);
            } else {
                return res.json({error: true});
            }
        } catch(e) {
            return next(new Error(e));
        }
    },

    getFriends: async(req, res, next) => {
        const { user } = res.locals;
        
        try {
            const friends = await User.findById(user._id).populate({
                path: 'friends',
                populate: [
                    {path: 'recipient', options: {select: ['-friends']}}, 
                    {path: 'requester', options: {select: ['-friends']}}
                ],
                options: {where: {status: 3}, sort: {updatedAt: 'DESC'}}
            })

            if(friends)
                return res.json(friends.friends);
        } catch (e) {
            return next(new Error(e));
        }
    },

    getRequested: async(req, res, next) => {
        const { user } = res.locals;
        
        try {
            const friends = await User.findById(user._id).populate({
                path: 'friends',
                populate: [
                    {path: 'recipient', options: {select: ['-friends']}}, 
                    {path: 'requester', options: {select: ['-friends']}}
                ],
                options: {where: {status: 2}, sort: {updatedAt: 'DESC'}}
            })

            if(friends)
                return res.json(friends.friends);
        } catch (e) {
            return next(new Error(e));
        }
    },

    getPending: async(req, res, next) => {
        const { user } = res.locals;
        
        try {
            const friends = await User.findById(user._id).populate({
                path: 'friends',
                populate: [
                    {path: 'recipient', options: {select: ['-friends']}}, 
                    {path: 'requester', options: {select: ['-friends']}}
                ],
                options: {where: {status: 1}, sort: {updatedAt: 'DESC'}}
            })

            if(friends)
                return res.json(friends.friends);
        } catch (e) {
            return next(new Error(e));
        }
    },

    requestFriend: async(req, res, next) => {
        const { user } = res.locals;
        const { userId } = req.body;

        const docA = await Friend.findOneAndUpdate(
            { requester: {_id: user._id}, recipient: {_id: userId} },
            { $set: { status: 1 }},
            { upsert: true, new: true }
        )
        const docB = await Friend.findOneAndUpdate(
            { recipient: {_id: user._id}, requester: {_id: userId} },
            { $set: { status: 2 }},
            { upsert: true, new: true }
        )
        const updateUserA = await User.findOneAndUpdate(
            { _id: user._id },
            { $push: { friends: docA._id }}
        )
        const updateUserB = await User.findOneAndUpdate(
            { _id: userId },
            { $push: { friends: docB._id }}
        )

        let otherUser = await User.findOne({_id: userId}).select('+pushToken').select('+lang')
        if(otherUser && otherUser.pushToken) {
            let data = { 
                text: languages[otherUser.lang].send_you_friend_request,
                push_ids: [otherUser.pushToken.id],
                icon: 'friend_icon',
                color: '008FF7',
                header_text: `${user.name.first} ${user.name.last}`,
                avatar: user.avatar ? user.avatar.min : '',
                group_id: `request${user._id}`,
                channel_id: 'd8fcc2a5-a5b8-443a-9faf-01e1ebd3b955',
                group_name: 'request',
                additional: {
                    userId: user._id,
                    type: 'request'
                },
                os: otherUser.pushToken.os
            };
    
            sendPushNotification(data).then(async (id) => {
                
            })
        }

        let notification = new Notification()

        notification.user = user
        notification.userId = userId
        notification.type = 'request'

        sendNotification({userId, notification})

        await notification.save()

        sendRequestFriend({userId: user._id, otherId: userId, friendStatus: 2})

        return res.json(1)
    },

    acceptRequest: async(req, res, next) => {
        const { user } = res.locals;
        const { userId } = req.body;

        await Friend.findOneAndUpdate(
            { requester: {_id: user._id}, recipient: {_id: userId} },
            { $set: { status: 3, updatedAt: new Date() }}
        )
        await Friend.findOneAndUpdate(
            { recipient: {_id: user._id}, requester: {_id: userId} },
            { $set: { status: 3, updatedAt: new Date() }}
        )

        let notification = new Notification()

        notification.user = user
        notification.userId = userId
        notification.type = 'accept'

        let otherUser = await User.findOne({_id: userId}).select('+pushToken').select('+lang')
        if(otherUser && otherUser.pushToken) {
            let data = { 
                text: languages[otherUser.lang].accept_your_friend_request,
                push_ids: [otherUser.pushToken.id],
                icon: 'friend_icon',
                color: '008FF7',
                header_text: `${user.name.first} ${user.name.last}`,
                avatar: user.avatar ? user.avatar.min : '',
                group_id: `accept${user._id}`,
                channel_id: 'd8fcc2a5-a5b8-443a-9faf-01e1ebd3b955',
                group_name: 'accept',
                additional: {
                    userId: user._id,
                    type: 'accept'
                },
                os: otherUser.pushToken.os
            };
    
            sendPushNotification(data).then(async (id) => {
                
            })
        }

        sendNotification({userId, notification})

        await notification.save()

        let removeNotificationD = await Notification.findOne({user: {_id: userId}, userId: user._id, type: 'request'})
        
        if(removeNotificationD) {
            let read = removeNotificationD.isRead
            removeNotification({userId: user._id, id: removeNotificationD._id, read})
    
            await Notification.deleteOne({user: {_id: userId}, userId: user._id, type: 'request'})
        }
            

        sendAcceptFriend({userId: user._id, otherId: userId, friendStatus: 3})

        return res.json(3)
    },

    declineRequest: async(req, res, next) => {
        const { user } = res.locals;
        const { userId } = req.body;

        const friend = await User.aggregate([
            { "$match": { "_id": user._id } },
            { "$lookup": {
              "from": Friend.collection.name,
              "let": { "friends": "$friends" },
              "pipeline": [
                { "$match": {
                  "recipient": mongoose.Types.ObjectId(userId),
                  "$expr": { "$in": [ "$_id", "$$friends" ] }
                }},
                { "$project": { "status": 1 } }
              ],
              "as": "friends"
            }},
            { "$addFields": {
              "friendsStatus": {
                "$ifNull": [ { "$min": "$friends.status" }, 0 ]
              }
            }}
        ])

        let status = 0
        
        if(friend[0].friendsStatus === 3) {
            const docA = await Friend.findOneAndUpdate(
                { requester: {_id: user._id}, recipient: {_id: userId} },
                { $set: { status: 2, updatedAt: new Date() }}
            )
            const docB = await Friend.findOneAndUpdate(
                { recipient: {_id: user._id}, requester: {_id: userId} },
                { $set: { status: 1, updatedAt: new Date() }}
            )
            status = 2
            
            sendRemoveFriend({userId: user._id, otherId: userId, friendStatus: 1})
        } else {
            const docA = await Friend.findOneAndRemove(
                { requester: {_id: user._id}, recipient: {_id: userId} }
            )
            const docB = await Friend.findOneAndRemove(
                { recipient: {_id: user._id}, requester: {_id: userId} }
            )

            const updateUserA = await User.findOneAndUpdate(
                { _id: user._id },
                { $pull: { friends: docA._id }}
            )
            const updateUserB = await User.findOneAndUpdate(
                { _id: userId },
                { $pull: { friends: docB._id }}
            )

            sendRemoveFriend({userId: user._id, otherId: userId, friendStatus: 0})
        }

        if(status === 0) {
            let removeNotificationA = await Notification.findOne({user: {_id: user._id}, userId: userId, type: 'request'})
            
            if(removeNotificationA) {
                let read = removeNotificationA.isRead
                removeNotification({userId: userId, id: removeNotificationA._id, read})
                await Notification.deleteOne({user: {_id: user._id}, userId: userId, type: 'request'})
            }

            let removeNotificationR = await Notification.findOne({user: {_id: userId}, userId: user._id, type: 'request'})
            
            if(removeNotificationR) {
                let read = removeNotificationR.isRead
                removeNotification({userId: user._id, id: removeNotificationR._id, read})
                await Notification.deleteOne({user: {_id: userId}, userId: user._id, type: 'request'})
            }
        } else {
            let removeNotificationR = await Notification.findOne({user: {_id: userId}, userId: user._id, type: 'request'})
            
            if(removeNotificationR) {
                let read = removeNotificationR.isRead
                removeNotification({userId: user._id, id: removeNotificationR._id, read})
                await Notification.deleteOne({user: {_id: userId}, userId: user._id, type: 'request'})
            }
            
            let removeNotificationA = await Notification.findOne({user: {_id: user._id}, userId: userId, type: 'accept'})
            
            if(removeNotificationA) {
                let read = removeNotificationA.isRead
                removeNotification({userId: userId, id: removeNotificationA._id, read})
                await Notification.deleteOne({user: {_id: user._id}, userId: userId, type: 'accept'})
            }

            let removeNotificationS = await Notification.findOne({user: {_id: userId}, userId: user._id, type: 'accept'})
            
            if(removeNotificationS) {
                let read = removeNotificationS.isRead
                removeNotification({userId: user._id, id: removeNotificationS._id, read})
                await Notification.deleteOne({user: {_id: userId}, userId: user._id, type: 'accept'})
            }
        }
        

        return res.json(status)
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

    uploadAvatar: async (req, res, next) => {
        // Get this account as JSON
        const { user } = res.locals;

        try {
            if(req.files) {
                if(req.files['avatar']) {
                    if(req.files['avatar'].size / 1000 <= 10000) {
                        let fileName = randomString(24)
                        let thubmName = randomString(24)
                        req.files['avatar'].mv('./uploads/' + user._id + '/' + fileName+'.' + req.files['avatar'].name.split('.').pop(), async (err) => {
                            if (err)
                            return res.status(500).send(err);

                            let options = { responseType: 'base64' }
                            const imageBuffer = fs.readFileSync(__dirname + '/../uploads/' + user._id + '/' + fileName+'.' + req.files['avatar'].name.split('.').pop());
                            const thumbnail = await imageThumbnail(imageBuffer, options);

                            require("fs").writeFile(__dirname + '/../uploads/' + user._id + '/' + thubmName+'.' + req.files['avatar'].name.split('.').pop(), thumbnail, 'base64', function(err) {
                                console.log(err);
                            });

                            user.avatar = {
                                original: process.env.API_URL + '/media/' + user._id + '/'  + fileName + '.' + req.files['avatar'].name.split('.').pop(), 
                                min: process.env.API_URL + '/media/' + user._id + '/'  + thubmName + '.' + req.files['avatar'].name.split('.').pop()
                            }

                            await user.save()
                        });
                    } else {
                        let err = {};
                        err.param = `all`;
                        err.msg = `max_size`;
                        return res.status(401).json({ error: true, errors: [err] });
                    }
                }
            } else {

            }         

            res.json({ error: false }); 
        } catch (e) {
            return next(new Error(e));
        }
    },

    edit: async (req, res, next) => {
        const { user } = res.locals;
        const { firstName, lastName, city, email } = req.body;

        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ error: true, errors: errors.array() });
            }

            const existingUserEmail = await User.findOne({email: email, _id: {$ne: user._id}});

            if (existingUserEmail) {
                const err = {};
                err.param = `email`;
                err.msg = `email_already`;
                return res.status(409).json({ error: true, errors: [err] });
            }

            user.name.first = firstName
            user.name.last = lastName
            user.city = city
            user.email = email

            await user.save()

            res.json({ error: false }); 
        } catch (e) {
            return next(new Error(e));
        }
    },

    setLang: async (req, res, next) => {
        const { user } = res.locals;
        const { lang } = req.body;

        try {
            user.lang = lang

            await user.save()

            res.json({ error: false }); 
        } catch (e) {
            return next(new Error(e));
        }
    },

    sendWarning: async (req, res, next) => {
        const { user } = res.locals;
        const { warning, userId } = req.body;

        try {
            if(user.role == 'moder' || user.role == 'admin') {
                sendWarning({userId, warning})

                res.json({ error: false });
            } else {
                return res.json({error: true});
            }
        } catch (e) {
            return next(new Error(e));
        }
    },

    addPushId: async (req, res, next) => {
        const { user } = res.locals;
        const { id, os } = req.body;

        if(id) {
            user.pushToken = {
                os,
                id
            }
        } else {
            user.pushToken = false
        }

        await user.save()

        return res.json({error: false});
    },

    ban: async (req, res, next) => {
        const { user } = res.locals;
        const { userId, time } = req.body;

        try {
            if(user.role == 'moder' || user.role == 'admin') {
                await Limit.deleteOne({userId: userId, type: 'ban'})

                let limit = new Limit()
                limit.userId = userId
                limit.date = new Date(Date.now() + time*1000)
                limit.numDate = time
                limit.type = 'ban'
                await limit.save()

                let ban  = {numDate: limit.numDate, date: limit.date}
                if(time !== 1)
                sendBan({userId})
                return res.json({error: false});
            } else {
                return res.json({error: true});
            }
        } catch(e) {
            return next(new Error(e));
        }
    },
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