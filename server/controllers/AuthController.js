/**
 * AuthController.js
 * Author: Roman Shuvalov
 */
"use strict";

const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Dialog = require('../models/Dialog');

module.exports = {
  // Register method
  register: async (req, res, next) => {
    // This route expects the body parameters:
    //  - email: User's email
    //  - firstName: User's firstName
    //  - lastName: User's lastName
    //  - password: User's password
    const user = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: true, errors: errors.array() });
    }

    try {
      // Make sure there isn't an existing user in our database
      const existingUserEmail = await User.findOne({email: user.email});
      
      if (existingUserEmail) {
        // Conflict: the resource already exists (HTTP 409)
        const err = {};
        err.param = `all`;
        err.msg = `email_already`;
        return res.status(409).json({ error: true, errors: [err] });
      }

      const newUser = new User();

      newUser.name = {
        first: user.firstName,
        last: user.lastName
      }
      newUser.email = user.email
      newUser.password = await bcrypt.hash(user.password, 12)

      let colors = ["26, 188, 156",'46, 204, 113','52, 152, 219','155, 89, 182','233, 30, 99','241, 196, 15','230, 126, 34','231, 76, 60']

      newUser.color = colors[randomInteger(0,7)]

      await newUser.save()

      let token = generateToken(newUser._id);

      const dialogs = await Dialog.find({'users': {'$all': [newUser._id]}, 'lastMessage': {$exists: true}}).populate([
        {
            path: 'users',
            select: ['_id', 'name', 'online', 'color', 'onlineAt']
        },
        {
            path: 'messages'
        },
        {
            path: 'lastMessage',
            populate: {
                path: 'user'
            }
        },
    ]).sort({updatedAt: 'DESC'});

    let noReadCount = 0

    const noReadDialogs = await Dialog.find({noRead: {'$ne': 0}, 'users': {'$all': [newUser._id]}, 'lastMessage': {$exists: true}}).populate([
      {
          path: 'users',
          select: ['_id']
      },
      {
        path: 'lastMessage',
        populate: {
            path: 'user'
        }
    },
  ]);

    if(noReadDialogs) {
      noReadDialogs.map(x => {
        if(String(x.lastMessage.user._id) != String(newUser._id)) {
          noReadCount++
        } 
      })
    }

      return res.json({ token, user: newUser, dialogs, noReadCount });
    } catch (e) {
      console.log(e);
      return next(new Error(e));
    }
  },
  // Login method
  login: async (req, res, next) => {
    // This route expects the body parameters:
    //  - email: username's email
    //  - password: username's password
    const { email, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: true, errors: errors.array() });
    }

    try {
      // Get the user for this email address
      const user = await User.findOne({email}).select('+password').select('+email').select('+roomLang');
      if (user) {
        const verifiedPassword = await bcrypt.compare(password, user.password);

        if (verifiedPassword) {
          // Success: generate and respond with the JWT
          let token = generateToken(user.id);

          const dialogs = await Dialog.find({'users': {'$all': [user._id]}, 'lastMessage': {$exists: true}}).populate([
            {
                path: 'users',
                select: ['_id', 'name', 'online', 'color', 'onlineAt']
            },
            {
                path: 'messages'
            },
            {
                path: 'lastMessage',
                populate: {
                    path: 'user'
                }
            },
        ]).sort({updatedAt: 'DESC'});

        let noReadCount = 0

    const noReadDialogs = await Dialog.find({noRead: {'$ne': 0}, 'users': {'$all': [user._id]}, 'lastMessage': {$exists: true}}).populate([
      {
          path: 'users',
          select: ['_id']
      },
      {
        path: 'lastMessage',
        populate: {
            path: 'user'
        }
    },
  ]);

    if(noReadDialogs) {
      noReadDialogs.map(x => {
        if(String(x.lastMessage.user._id) != String(user._id)) {
          noReadCount++
        } 
      })
    }
          
          return res.json({ token, user, dialogs, noReadCount });
        }
      }
    } catch (e) {
      return next(new Error(e));
    }
    // Unauthorized (HTTP 401)
    const err = {};
    err.param = `all`;
    err.msg = `email_or_password_wrong`;
    return res.status(401).json({ error: true, errors: [err] });
  },
  forgot: async (req, res, next) => {
    // This route expects the body parameters:
    //  - email: username's email
    const { email } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: true, errors: errors.array() });
    }
    try {
      // Make sure there is an existing user in our database
      const existingUserEmail = await User.getByEmail(email);
      if (existingUserEmail) {
        if (existingUserEmail.user.resetPasswordExpires < Date.now()) {
          let ResetToken = User.generatePasswordReset(email);
          //Отправка на почту письма
          return res.json({
            status: "sended",
            email: email,
          });
        }
        //Уже отправлено
        else {
          return res.json({
            status: "waiting",
            email: email,
            time: existingUserEmail.user.resetPasswordExpires - Date.now(),
          });
        }
      } else {
        // Conflict: the resource already exists (HTTP 409)
        const err = {};
        err.param = `email`;
        err.msg = `Пользователь с данной почтой не найден`;
        return res.status(409).json({ error: true, errors: [err] });
      }
    } catch (e) {
      console.log(e);
      return next(new Error(e));
    }
  },
  reset: async (req, res, next) => {
    // This route expects the body parameters:
    //  - email: username's email
    const { password, token } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: true, errors: errors.array() });
    }
    try {
      // Make sure there is an existing user in our database
      const existingUserEmail = await User.getByResetPasswordToken(token);
      
      if (existingUserEmail) {
        existingUserEmail.updatePassword(password);
        // Сообщение о сбросе пароля
        return res.json({
          status: "success"
        });
      } else {
        // Conflict: the resource already exists (HTTP 409)
        const err = {};
        err.param = `all`;
        err.msg = `Неверный токен`;
        return res.status(409).json({ error: true, errors: [err] });
      }
    } catch (e) {
      console.log(e);
      return next(new Error(e));
    }
  },
};

// Generates a signed JWT that encodes a user ID
// This function requires:
//  - userId: user to include in the token
function generateToken(userId) {
  // Include some data and an expiration timestamp in the JWT
  return jwt.sign(
    {
      data: { userId },
    },
    process.env.JWT_SECRET
  );
}

function randomInteger(min, max) {
  let rand = min + Math.random() * (max + 1 - min);
  return Math.floor(rand);
}