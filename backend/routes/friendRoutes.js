const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendsList,
} = require("../controllers/userController");

const router = express.Router();

// Send Friend Request Route
router.post("/send-request", protect, sendFriendRequest);

// Accept Friend Request Route
router.post("/accept-request", protect, acceptFriendRequest); 

// Reject Friend Request Route
router.post("/reject-request", protect, rejectFriendRequest);

// Get Friends List Route
router.get("/friends", protect, getFriendsList);


module.exports = router;
