/**
 * user.js
 * Author: Roman Shuvalov
 */
'use strict';

const router = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const UserController = require('../controllers/UserController')

// Get the user for this user
router.get('/me', verifyToken, UserController.user);
router.post('/update-room-lang', verifyToken, UserController.updateRoomLang);

module.exports = router;