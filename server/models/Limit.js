/**
 * Dialog.js
 * Author: Roman Shuvalov
 */
"use strict";

const mongoose = require("../database");
const Schema = mongoose.Schema;

// The number of rounds to use when hashing a password with bcrypt

const LimitSchema = new Schema({
    userId: { type: String },
    type: { type: String }, // ban, banroom, mute
    date: { type: Date },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    numDate: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    buff: Buffer
});

const Limit = mongoose.model('Limit', LimitSchema);

module.exports = Limit;