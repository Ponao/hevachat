/**
 * user.js
 * Author: Roman Shuvalov
 */
'use strict';

const router = require('express').Router();
const StatsController = require('../controllers/StatsController');
const verifyAdmin = require('../middleware/verifyAdmin');

// Get the user for this user
router.post('/get-users', verifyAdmin, StatsController.getStatsUsers);
router.post('/get-payments', verifyAdmin, StatsController.getStatsPayments);
router.post('/get-rooms', verifyAdmin, StatsController.getStatsRooms)

// router.get('/load-friends', verifyToken, UserController.loadFriends)
// router.get('/load-requested', verifyToken, UserController.loadRequested)
// router.get('/load-pending', verifyToken, UserController.loadPending)

module.exports = router;