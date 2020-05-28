/**
 * Message.js
 * Author: Roman Shuvalov
 */
"use strict";

const mongoose = require("../database");
const Schema = mongoose.Schema;

// The number of rounds to use when hashing a password with bcrypt

const MessageSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, default: '' },
    images: [
        { type: Object }
    ],
    sounds: [
        { type: Object }
    ],
    files: [
        { type: Object }
    ],
    recentMessages: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Message' }
    ],
    isRead: { type: Boolean, default: false },
    isEdit: { type: Boolean, default: false },
    isDelete: { type: Boolean, default: false },
    pushId: { type: String, default: '' },
    dialogId: { type: String },
    createdAt: { type: Date, default: Date.now },
    buff: Buffer
});

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;
