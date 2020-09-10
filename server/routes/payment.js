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
router.post('/get-my', verifyToken, PaymentController.getMy);
router.get('/check-order', PaymentController.check)
router.post('/delete-my', verifyToken, PaymentController.deleteMy)

module.exports = router;