/**
 * room.js
 * Author: Roman Shuvalov
 */
'use strict';

const router = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const NotificationController = require('../controllers/NotificationController')

router.post('/get-all', verifyToken, NotificationController.getAll);
router.post('/read', verifyToken, NotificationController.read);

module.exports = router;