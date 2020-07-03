/**
 * room.js
 * Author: Roman Shuvalov
 */
'use strict';

const router = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const { check } = require('express-validator');
const RoomController = require('../controllers/RoomController')

router.post('/get-all', verifyToken, RoomController.getAll);
router.post('/get', verifyToken, RoomController.get);
router.post('/load', verifyToken, RoomController.load)
router.post('/create', verifyToken, [
    check('title')
        .notEmpty().withMessage('title_not_empty')
        .isLength({ max: 50 }).withMessage('title_is_max'),
], RoomController.create);
router.post('/delete', verifyToken, RoomController.delete);
router.post('/edit', verifyToken, verifyToken, [
    check('title')
        .notEmpty().withMessage('title_not_empty')
        .isLength({ max: 50 }).withMessage('title_is_max'),
], RoomController.edit);
router.post('/invite', verifyToken, RoomController.invite);
router.post('/search', verifyToken, RoomController.search)
router.post('/send-message', verifyToken, RoomController.sendMessage);
router.post('/delete-message', verifyToken, RoomController.deleteMessage);
router.post('/read-messages', verifyToken, RoomController.readMessages);
router.post('/edit-message', verifyToken, RoomController.editMessage);
router.post('/load-messages', verifyToken, RoomController.loadMessage);
router.post('/get-investments', verifyToken, RoomController.getInvestments);
router.post('/mute', verifyToken, RoomController.mute)
router.post('/unmute', verifyToken, RoomController.unmute)

module.exports = router;