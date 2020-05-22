/**
 * Room.js
 * Author: Roman Shuvalov
 */
"use strict";

const mongoose = require("../database");
const Schema = mongoose.Schema;

// The number of rounds to use when hashing a password with bcrypt

const RoomSchema = new Schema({
  lang: { type: String },
  title: { type: String },
  ownerId: { type: String },
  createdAt: { type: Date, default: Date.now },
  isPrivate: { type: Boolean, default: false },
  color: { type: String },
  users: { type: Array },
  buff: Buffer
});

const Room = mongoose.model('Room', RoomSchema);

module.exports = Room;
