/**
 * Investment.js
 * Author: Roman Shuvalov
 */
"use strict";

const mongoose = require("../database");
const Schema = mongoose.Schema;

// The number of rounds to use when hashing a password with bcrypt

const InvestmentSchema = new Schema({
    data: { type: Object },
    type: { type: String },
    dialogId: { type: String },
    createdAt: { type: Date, default: Date.now },
    buff: Buffer
});

const Investment = mongoose.model('Investment', InvestmentSchema);

module.exports = Investment;
