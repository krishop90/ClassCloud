// activityRoutes.js
const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activityController");
const { protect } = require("../middleware/authMiddleware");

router.get("/recent-activity", protect , activityController.getRecentActivity);

module.exports = router;
