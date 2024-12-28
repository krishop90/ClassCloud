// activityRoutes.js
const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activityController");
const { protect } = require("../middleware/authMiddleware");
// Route to get recent activity of a user
router.get("/recent-activity", protect , activityController.getRecentActivity);

module.exports = router;
