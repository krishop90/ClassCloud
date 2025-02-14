const express = require("express");
const router = express.Router();
const { uploadAvatar } = require("../middleware/fileUploadMiddleware"); 
const { uploadAvatar: uploadAvatarController } = require("../controllers/communityController"); 
const { protect } = require("../middleware/authMiddleware");
const {
  createCommunity,
  deleteCommunity,
  updateCommunity,
  inviteToCommunity,
  requestToJoin,
  acceptJoinRequest,
  rejectJoinRequest,
  processAvatarUpload,
  kickUser,
  getCommunityMembers,
  getAllCommunities,
  searchCommunities,
  getMessages,
  sendMessage,
  joinCommunity,
  getCommunityById
} = require("../controllers/communityController");

// Create community
router.post("/create", protect, createCommunity);

// Delete community (only creator can delete)
router.delete("/:communityId", protect, deleteCommunity);

// Update community name (once a year)
router.put("/:communityId", protect, updateCommunity);

// Invite friends
router.post("/invite/:communityId", protect, inviteToCommunity);

// Request to join a community
router.post("/:communityId/request", protect, requestToJoin);

// Accept/Reject join request
router.put("/:communityId/request/:userId", protect, acceptJoinRequest);
router.delete("/:communityId/request/:userId", protect, rejectJoinRequest);

// Upload community avatar
router.post("/:communityId/avatar", protect, uploadAvatar.single('avatar'), processAvatarUpload);
// Kick user out of community
router.delete("/:communityId/kick/:userId", protect, kickUser);

// Get list of community members
router.get("/:communityId/members", protect, getCommunityMembers);

// Get all communities
router.get("/", getAllCommunities);

// Search communities
router.get("/search", protect, searchCommunities);

// Get community messages
router.get("/:communityId/messages", protect, getMessages);

// Send message to community
router.post("/:communityId/messages", protect, sendMessage);

// Join community
router.post('/:communityId/join', protect, joinCommunity);

router.get("/:communityId", protect, getCommunityById);

module.exports = router;
