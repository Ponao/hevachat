/**
 * user.js
 * Author: Roman Shuvalov
 */
'use strict';

const router = require('express').Router();
const verifyToken = require('../middleware/verifyToken');
const PaymentController = require('../controllers/PaymentController')

// Get the user for this user
router.post('/get-all', verifyToken, PaymentController.getAll);
router.post('/buy', verifyToken, PaymentController.buy);

module.exports = router;