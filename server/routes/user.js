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
router.post('/get', verifyToken, UserController.get);
router.post('/request', verifyToken, UserController.requestFriend)
router.post('/accept-request', verifyToken, UserController.acceptRequest)
router.post('/remove-request', verifyToken, UserController.declineRequest)
router.post('/get-online', verifyToken, UserController.getOnline)
router.get('/get-friends', verifyToken, UserController.getFriends)
router.get('/get-requested', verifyToken, UserController.getRequested)
router.get('/get-pending', verifyToken, UserController.getPending)
router.post('/search', verifyToken, UserController.search)
// router.get('/load-friends', verifyToken, UserController.loadFriends)
// router.get('/load-requested', verifyToken, UserController.loadRequested)
// router.get('/load-pending', verifyToken, UserController.loadPending)

module.exports = router;