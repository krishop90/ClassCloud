const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const User = require("../models/userModel");

const router = express.Router();

// Send Friend Request Route
router.post("/send-request", protect, async (req, res) => {
  const { recipientId } = req.body;  // Change to recipientId

  try {
    const recipient = await User.findById(recipientId);

    if (!recipient) {
      return res.status(404).json({ message: "User not found" });
    }

    if (recipient._id.toString() === req.user.id) {
      return res.status(400).json({ message: "You cannot send a friend request to yourself" });
    }

    if (recipient.friendRequests.includes(req.user.id)) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    recipient.friendRequests.push(req.user.id);
    await recipient.save();

    res.status(200).json({ message: `Friend request sent to ${recipient.username}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Accept Friend Request Route
router.post("/accept-request", protect, async (req, res) => {
  const { senderId } = req.body;  

  try {
    const recipient = await User.findById(req.user.id);  
    const sender = await User.findById(senderId); 

    if (!sender) {
      return res.status(404).json({ message: "Sender not found" });
    }

    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    if (!recipient.friendRequests.includes(senderId)) {
      return res.status(400).json({ message: "Friend request not found" });
    }

    recipient.friendRequests = recipient.friendRequests.filter(id => id.toString() !== senderId);
    recipient.friends.push(senderId);
    await recipient.save();
    
    sender.friends.push(req.user.id);
    await sender.save();

    res.status(200).json({ message: `Friend request accepted from ${sender.username}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// Reject Friend Request
router.post("/reject-request", protect, async (req, res) => {
  const { requesterId } = req.body;

  try {
    const recipient = await User.findById(req.user.id);

    if (!recipient) {
      return res.status(404).json({ message: "User not found" });
    }

    recipient.friendRequests = recipient.friendRequests.filter(
      (id) => id.toString() !== requesterId
    );

    await recipient.save();

    res.status(200).json({ message: "Friend request rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
