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
  dialog: { type: mongoose.Schema.Types.ObjectId, ref: 'Dialog' },
  createdAt: { type: Date, default: Date.now },
  isPrivate: { type: Boolean, default: false },
  color: { type: String },
  users: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ],
  buff: Buffer
});

const Room = mongoose.model('Room', RoomSchema);

module.exports = Room;
