/**
 * room.js
 * Author: Roman Shuvalov
 */
'use strict';

const router = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const RoomController = require('../controllers/RoomController')

// Get the user for this user
router.post('/get-all', verifyToken, RoomController.getAll);
router.post('/get', verifyToken, RoomController.get);
router.post('/create', verifyToken, RoomController.create);
router.post('/delete', verifyToken, RoomController.delete);
router.post('/edit', verifyToken, RoomController.edit);
router.post('/send-message', verifyToken, RoomController.sendMessage);
router.post('/delete-message', verifyToken, RoomController.deleteMessage);

module.exports = router;