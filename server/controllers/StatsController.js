/**
 * RoomController.js
 * Author: Roman Shuvalov
 */
'use strict';

const request = require('request')

const Payment = require('../models/Payment')
const Tariff = require('../models/Tariff')
const User = require('../models/User')
const Room = require('../models/Room')

module.exports = {
    getStatsUsers: async (req, res, next) => {
        let count = await User.find().countDocuments()
        let users = await User.aggregate([
            {
                $addFields: {
                    yearCreatedAt: {
                        $year: "$createdAt"
                    }
                }
            },
            {
                $match: {
                    yearCreatedAt: new Date().getFullYear()
                }
            },
            {
                $group: {
                    _id: {
                        month: {
                            $month: '$createdAt'
                        },
                    },
                    count: { $sum: 1 }
                }
            },
        ])

        return res.json({users,count})
    },

    getStatsPayments: async (req, res, next) => {
        let tariffs = await Tariff.find({}, ['title', 'price']);
        let payments = await Payment.aggregate([
            {
                $lookup: {
                    from: 'tariffs',
                    localField: 'tariff',
                    foreignField: '_id',
                    as: 'tariff'
                }
            },
            {
                $addFields: {
                    yearCreatedAt: {
                        $year: "$createdAt"
                    }
                }
            },
            {
                $match: {
                    yearCreatedAt: new Date().getFullYear()
                }
            },
            {
                $group: {
                    _id: {
                        tariff: '$tariff.title',
                        status: '$status',
                        price: '$tariff.price'
                    },
                    count: { $sum: 1 },
                }
            },
        ])

        return res.json({payments, tariffs})
    },

    getStatsRooms: async (req, res, next) => {
        let rooms = await Room.aggregate([
            {
                $group: {
                    _id: {
                        lang: '$lang',
                    },
                    count: { $sum: 1 },
                }
            },
        ])

        let users = await Room.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'users',
                    foreignField: '_id',
                    as: 'users'
                }
            },
            {
                $unwind: '$users'
            },
            {
                $group: {
                    _id: {
                        lang: '$lang',
                    },
                    users: { $push: '$users' },
                }
            },
            {
                $project: {
                    _id: '$_id.lang',
                    count: {
                        $size: '$users'
                    }
                }
            }
        ])

        return res.json({rooms, users})
    },
}

function randomInteger(min, max) {
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
}