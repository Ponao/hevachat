/**
 * Notification.js
 * Author: Roman Shuvalov
 */
"use strict";

const mongoose = require("../database");
const Schema = mongoose.Schema;

// The number of rounds to use when hashing a password with bcrypt

const NotificationSchema = new Schema({
    userId: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    buff: Buffer
});

const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;