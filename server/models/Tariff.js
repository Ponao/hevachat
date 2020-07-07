/**
 * Room.js
 * Author: Roman Shuvalov
 */
"use strict";

const mongoose = require("../database");
const Schema = mongoose.Schema;

// The number of rounds to use when hashing a password with bcrypt

const TariffSchema = new Schema({
  title: { type: String },
  price: { type: Number },
  days: { type: Number },
  createdAt: { type: Date, default: Date.now },
  active: { type: Boolean },
  buff: Buffer
});

const Tariff = mongoose.model('Tariff', TariffSchema);

module.exports = Tariff;
