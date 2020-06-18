/**
 * call.js
 * Author: Roman Shuvalov
 */
'use strict';

const router = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const CallController = require('../controllers/CallController')

router.post('/call', verifyToken, CallController.call);
router.post('/stop', verifyToken, CallController.stop);
router.post('/check', verifyToken, CallController.check);
router.post('/accept', verifyToken, CallController.accept);

module.exports = router;