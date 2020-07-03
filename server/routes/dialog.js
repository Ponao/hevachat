/**
 * dialog.js
 * Author: Roman Shuvalov
 */
'use strict';

const router = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const DialogController = require('../controllers/DialogController')

router.post('/get-all', verifyToken, DialogController.getAll);
router.post('/get', verifyToken, DialogController.get);
router.post('/send-message', verifyToken, DialogController.sendMessage);
router.post('/read-messages', verifyToken, DialogController.readMessages);
router.post('/get-investments', verifyToken, DialogController.getInvestments);
// router.post('/create', verifyToken, DialogController.create);
// router.post('/delete', verifyToken, DialogController.delete);
// router.post('/edit', verifyToken, DialogController.edit);
// router.post('/send-message', verifyToken, DialogController.sendMessage);
router.post('/delete-message', verifyToken, DialogController.deleteMessage);
// router.post('/read-messages', verifyToken, DialogController.readMessages);
router.post('/edit-message', verifyToken, DialogController.editMessage);
router.post('/load-messages', verifyToken, DialogController.loadMessage);
router.post('/load', verifyToken, DialogController.load)

module.exports = router;