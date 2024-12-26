const express = require("express");
const router = express.Router();
const { addToHistory, getUserHistory } = require("../controllers/historyController"); // Import the controller

// Add a video to history route
router.post("/", addToHistory); // Use the addToHistory controller function

// Get user's watch history route
router.get("/:userId", getUserHistory); // Use the getUserHistory controller function

module.exports = router;
