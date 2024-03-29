/**
 * verifyToken.js
 * Author: Roman Shuvalov
 */
'use strict';

const jwt = require('jsonwebtoken')
const User = require('../models/User');
const Limit = require('../models/Limit');

module.exports = async (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept');
    // Check if an `Authorization` header was included
    const header = req.headers.authorization
    const {apiToken} = req.body
    if ((!header || !header.startsWith('Bearer')) && !apiToken) {
        // Failed: no token provided
        const err = new Error('No `Authorization` header provided.')
        err.authFailed = true
        return next(err)
    }

    let token

    if (header && header.startsWith('Bearer')) {
        token = header.replace(/^Bearer /, '')
    }
    
    if(apiToken) {
        token = apiToken
    }
    
    let user = null
    try {
        user = jwt.verify(token, process.env.JWT_SECRET)
    } catch (e) {
        // Failed: wrong token
        const err = new Error('JWT token verification failed.')
        err.authFailed = true
        return next(err)
    }

    // Failed: no account found in decoded data
    if (!user.data.userId) {
        const err = new Error('JWT is missing user data.')
        err.authFailed = true
        return next(err)
    }

    // Success: include decoded data in the request
    res.locals.user = await User.findById(user.data.userId).select('+email').select('+lang').select('+role').select('+roomLang').select("-friends")
    
    

    let ban = await Limit.findOne({userId: user.data.userId, type: 'ban', date: {$gte: new Date()}})
            
    if(ban) {
        return res.json({numDate: ban.numDate, date: ban.date, ban: true})
    }
    
    res.locals.user.onlineAt = Date.now()
    res.locals.user.online = true
    
    await res.locals.user.save()

    return next()
}