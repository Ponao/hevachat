/**
 * UserController.js
 * Author: Roman Shuvalov
 */
'use strict';

const User = require('../models/User');
const Message = require('../models/Message');
const Dialog = require('../models/Dialog');
const Friend = require('../models/Friends')
const mongoose = require("../database");
const {sendRequestFriend, sendAcceptFriend, sendRemoveFriend} = require('./SocketController')

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

    getFriends: async(req, res, next) => {
        const { user } = res.locals;
        
        try {
            const friends = await User.findById(user._id).populate({
                path: 'friends',
                populate: [
                    {path: 'recipient', options: {select: ['-friends']}}, 
                    {path: 'requester', options: {select: ['-friends']}}
                ],
                options: {where: {status: 3}, limit: 15, sort: {updatedAt: 'DESC'}}
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
                options: {where: {status: 2}, limit: 15, sort: {updatedAt: 'DESC'}}
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
                options: {where: {status: 1}, limit: 15, sort: {updatedAt: 'DESC'}}
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

    
}