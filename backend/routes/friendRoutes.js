const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
} = require("../controllers/userController");

const router = express.Router();

// Send Friend Request Route
router.post("/send-request", protect, sendFriendRequest);

// Accept Friend Request Route
router.post("/accept-request", protect, acceptFriendRequest); 

// Reject Friend Request Route
router.post("/reject-request", protect, rejectFriendRequest);

module.exports = router;
