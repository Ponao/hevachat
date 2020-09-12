/**
 * user.js
 * Author: Roman Shuvalov
 */
'use strict';

const router = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const { check } = require('express-validator');
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
router.post('/get-mute', verifyToken, UserController.getMute)
router.post('/get-roomban', verifyToken, UserController.getBanroom)
router.post('/upload-avatar', verifyToken, UserController.uploadAvatar)
router.post('/send-warning', verifyToken, UserController.sendWarning)
router.post('/add_push_id', verifyToken, UserController.addPushId)
router.post('/ban', verifyToken, UserController.ban)

router.post('/edit', [
    check('firstName')
    .notEmpty().withMessage('first_name_not_empty')
    .isString().withMessage('first_name_is_string')
    .isLength({ min: 2 }).withMessage('first_name_is_min'),
  check('lastName')
    .notEmpty().withMessage('last_name_not_empty')
    .isString().withMessage('last_name_is_string')
    .isLength({ min: 2 }).withMessage('last_name_is_min'),
  check('email')
    .isEmail().withMessage('email_is_invalid')
    .notEmpty().withMessage('email_not_empty'),
], verifyToken, UserController.edit)
router.post('/set-lang', verifyToken, UserController.setLang)
// router.get('/load-friends', verifyToken, UserController.loadFriends)
// router.get('/load-requested', verifyToken, UserController.loadRequested)
// router.get('/load-pending', verifyToken, UserController.loadPending)

module.exports = router;