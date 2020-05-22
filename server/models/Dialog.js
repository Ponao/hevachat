/**
 * Dialog.js
 * Author: Roman Shuvalov
 */
"use strict";

const mongoose = require("../database");
const Schema = mongoose.Schema;

// The number of rounds to use when hashing a password with bcrypt

const DialogSchema = new Schema({
    users: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    ],
    createdAt: { type: Date, default: Date.now },
    buff: Buffer
});

const Dialog = mongoose.model('Dialog', DialogSchema);

module.exports = Dialog;