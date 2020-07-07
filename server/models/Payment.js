/**
 * Room.js
 * Author: Roman Shuvalov
 */
"use strict";

const mongoose = require("../database");
const Schema = mongoose.Schema;

// The number of rounds to use when hashing a password with bcrypt

const PaymentSchema = new Schema({
  userId: { type: String },
  tariff: { type: mongoose.Schema.Types.ObjectId, ref: 'Tariff' },
  expiriesAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  buff: Buffer
});

const Payment = mongoose.model('Payment', PaymentSchema);

module.exports = Payment;
