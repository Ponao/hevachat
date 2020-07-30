/**
 * User.js
 * Author: Roman Shuvalov
 */
"use strict";

const mongoose = require("../database");
const Schema = mongoose.Schema;

// The number of rounds to use when hashing a password with bcrypt
const NUM_ROUNDS = 12;

const UserSchema = new Schema({
  name: {
    first: String,
    last: String
  },
  email: { type: String,  },// false
  avatar: { type: Object, select: true },
  password: { type: String, select: false }, // false
  pushId: { type: String, select: false }, // false
  roomLang: { type: String, default: 'eng', },// false
  online: { type: Boolean, default: true },
  onlineAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now,  },// false
  friends: [{ type: Schema.Types.ObjectId, ref: 'Friend'}],
  city: { type: String, default: '',  },
  role: { type: String, default: 'user',  },// false
  lang: { type: String, default: 'en',  },// false
  color: { type: String },
  pushToken: { type: Schema.Types.Mixed, select: false },
  buff: Buffer
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
