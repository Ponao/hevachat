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
const Notification = require('../models/Notification');
const Limit = require("../models/Limit");
const https = require('https');
const { resolve } = require("path");
const VK_APP_ID = process.env.VK_APP_ID;
const VK_APP_KEY = process.env.VK_APP_KEY;
const VK_VERSION_API = process.env.VK_VERSION_API;
const VK_REDIRECT_URI = process.env.VK_REDIRECT_URI;
const VK_CLIENT_REDIRECT_URI = process.env.VK_CLIENT_REDIRECT_URI;

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
            path: 'lastMessage',
            populate: {
                path: 'user'
            }
        },
    ]).sort({updatedAt: 'DESC'}).limit(20);

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
    let oneweekago = new Date() - (7 * 24 * 60 * 60 * 1000);
            
    const noReadNotifications = await Notification.find({userId: user._id, isRead: false, createdAt: {"$gte": oneweekago} }).count()

      return res.json({ token, user: newUser, dialogs, noReadCount, noReadNotifications });
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
      const user = await User.findOne({email}).select('+password').select('+email').select('+roomLang').select('+lang').select('+role');
      if (user) {
        const verifiedPassword = await bcrypt.compare(password, user.password);

        if (verifiedPassword) {
          // Success: generate and respond with the JWT
          let token = generateToken(user.id);

          let ban = await Limit.findOne({userId: user._id, type: 'ban', date: {$gte: new Date()}})
            
          if(ban) {
              return res.json({numDate: ban.numDate, date: ban.date, ban: true, token})
          }

          const dialogs = await Dialog.find({'users': {'$all': [user._id]}, 'lastMessage': {$exists: true}}).populate([
            {
                path: 'users',
                select: ['_id', 'name', 'online', 'color', 'onlineAt']
            },
            {
                path: 'lastMessage',
                populate: {
                    path: 'user'
                }
            },
        ]).sort({updatedAt: 'DESC'}).limit(20);

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
        let oneweekago = new Date() - (7 * 24 * 60 * 60 * 1000);
                
        const noReadNotifications = await Notification.find({userId: user._id, isRead: false, createdAt: {"$gte": oneweekago} }).count()
          
          return res.json({ token, user, dialogs, noReadCount, noReadNotifications });
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
  loginVk: async (req, res, next) => {    
    res.writeHead(301, { "Location": `http://oauth.vk.com/authorize?client_id=${VK_APP_ID}&redirect_uri=${VK_REDIRECT_URI}&response_type=code&scope=photos,offline` });
    res.end()
  },
  authVk: async (req, res, next) => {
    const { code } = req.query;
    
    try {
      let token = await getTokenFromVkUser(code)

      if(token)
        res.writeHead(301, { "Location": `${VK_CLIENT_REDIRECT_URI}?token=${token}&uuid=${randomInteger(0, 1000000)}` });
      else 
        res.writeHead(301, { "Location": `${VK_CLIENT_REDIRECT_URI}` });

      res.end()
    } catch (e) {
      return next(new Error(e));
    }
  },
  authVkApp: async (req, res, next) => {
    const { data } = req.body;

    try {
      let token = await getVkUserFromToken(data)

      return res.json({token})
    } catch (e) {
      return next(new Error(e));
    }
  },
  loginFb: async (req, res, next) => {

  },
  authFb: async (req, res, next) => {

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

function getTokenFromVkUser(code) {
  return new Promise((resolve) => {
    let params = {
      client_id: VK_APP_ID,
      client_secret: VK_APP_KEY,
      code: code,
      redirect_uri: VK_REDIRECT_URI
    }

    let searchParameters = new URLSearchParams();

    Object.keys(params).forEach(function(parameterName) {
        searchParameters.append(parameterName, params[parameterName]);
    });

    let optionsRequest = {
        host: `oauth.vk.com`,
        port: 443,
        path: `/access_token?${searchParameters}`,
        method: "GET",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        }
    };

    let req1 = https.request(optionsRequest, function(res) {  
        res.on('data', function(data) {
            data = JSON.parse(data)
            if(data.access_token) {
              getVkUserFromToken(data).then(token => {
                resolve(token)
              })
            } else {
              resolve(false)
            }
        });
    });

    req1.on('error', function(e) {
        console.log("ERROR:");
        console.log(e);
        resolve(false)
    });

    req1.end();
  })
}

function getVkUserFromToken(data) {
  return new Promise((resolve) => {
    let params = {
      v: VK_VERSION_API,
      access_token: data.access_token,
      user_ids: data.user_id,
      fields: 'photo_big,bdate'
    }

    let searchParameters = new URLSearchParams();

    Object.keys(params).forEach(function(parameterName) {
        searchParameters.append(parameterName, params[parameterName]);
    });

    let optionsRequest = {
      host: `api.vk.com`,
      port: 443,
      path: `/method/users.get?${searchParameters}`,
      method: "GET",
      headers: {
          "Content-Type": "application/json; charset=utf-8",
      }
    };

    let req2 = https.request(optionsRequest, async (res) => {  
      res.on('data', async (data) => {
        data = JSON.parse(data).response
        
        if(data && data[0] && data[0].id) {
          let user = await User.findOne({email: data[0].id}).select('+email');
          if(user) {
            let token = generateToken(user.id);
            resolve(token)
          } else {
            const newUser = new User();

            newUser.name = {
              first: data[0].first_name,
              last: data[0].last_name
            }
            newUser.email = data[0].id
            newUser.password = await bcrypt.hash(String(data[0].id), 12)

            let colors = ["26, 188, 156",'46, 204, 113','52, 152, 219','155, 89, 182','233, 30, 99','241, 196, 15','230, 126, 34','231, 76, 60']

            newUser.color = colors[randomInteger(0,7)]

            newUser.avatar = {
              original: data[0].photo_big, 
              min: data[0].photo_big
            }

            await newUser.save()

            let token = generateToken(newUser.id);
            resolve(token)
          }
        } else {
          resolve(false)
        }
      })
    })

    req2.on('error', function(e) {
        console.log("ERROR:");
        console.log(e);
        resolve(false)
    });

    req2.end();
  })
}