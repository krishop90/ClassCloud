const express = require("express");
const router = express.Router();
const { addToHistory, getUserHistory } = require("../controllers/historyController"); 

// Add a video to history route
router.post("/", addToHistory); 

// Get user's watch history route
router.get("/:userId", getUserHistory); 

module.exports = router;
