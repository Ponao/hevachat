/**
 * verifyToken.js
 * Author: Roman Shuvalov
 */
'use strict';

const User = require('../models/User');
const bcrypt = require("bcryptjs");

module.exports = async (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept');

    const {admin} = req.body
    try {
        if (!admin.email || !admin.password) {
            const err = new Error('No `Authorization.')
            err.authFailed = true
            return next(err)
        }
    
    
        // Success: include decoded data in the request
        res.locals.user = await User.findOne({email: admin.email, role: 'admin'}).select('+email').select('+password')

        if(!res.locals.user) {
            const err = new Error('No `Authorization.')
            err.authFailed = true
            return next(err)
        }

        const verifiedPassword = await bcrypt.compare(admin.password, res.locals.user.password);
    
        if (verifiedPassword) {
            return next()
        } else {
            const err = new Error('No `Authorization.')
            err.authFailed = true
            return next(err)
        }
    } catch (error) {
        const err = new Error('No `Authorization.')
        err.authFailed = true
        return next(err)
    }
}