/**
 * room.js
 * Author: Roman Shuvalov
 */
'use strict';

const router = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const RoomControllet = require('../controllers/RoomControllet')

// Get the user for this user
router.get('/get-all', verifyToken, RoomControllet.getAll);
router.post('/create', verifyToken, RoomControllet.create);
router.post('/delete', verifyToken, RoomControllet.delete);
router.post('/edit', verifyToken, RoomControllet.edit);

module.exports = router;