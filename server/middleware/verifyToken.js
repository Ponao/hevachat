/**
 * verifyToken.js
 * Author: Roman Shuvalov
 */
'use strict';

const jwt = require('jsonwebtoken')
const User = require('../models/User');

module.exports = async (req, res, next) => {
    // Check if an `Authorization` header was included
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer')) {
        // Failed: no token provided
        const err = new Error('No `Authorization` header provided.')
        err.authFailed = true
        return next(err)
    }

    const token = header.replace(/^Bearer /, '')
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
    res.locals.user = await User.findById(user.data.userId)
    return next()
}