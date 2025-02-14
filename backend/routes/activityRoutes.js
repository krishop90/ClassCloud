const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getRecentActivity } = require('../controllers/activityController');

router.get('/recent', protect, getRecentActivity);

module.exports = router;
