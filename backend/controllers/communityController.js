const Community = require("../models/communityModel");
const User = require("../models/userModel");

const createCommunity = async (req, res) => {
  try {
    const community = new Community({
      name: req.body.name,
      description: req.body.description,
      creator: req.user._id,
    });

    await community.save();
    res.status(201).json(community);
  } catch (error) {
    res.status(500).json({ message: "Error creating community", error: error.message });
  }
};

//upload avatar
const processAvatarUpload = async (req, res) => {
  try {
    const { communityId } = req.params;
    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Check if the logged-in user is the creator
    if (community.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to upload avatar" });
    }

    // Assuming the avatar is stored in 'req.file'
    community.avatar = req.file.path;

    await community.save();
    res.status(200).json({ message: "Avatar uploaded successfully", avatarUrl: community.avatar });
  } catch (error) {
    res.status(500).json({ message: "Error uploading avatar", error: error.message });
  }
};

//delete community
const deleteCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId);

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    if (community.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this community" });
    }

    await community.remove();
    res.status(200).json({ message: "Community deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting community", error: error.message });
  }
};


//update community
const updateCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId);

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Check if the logged-in user is the creator
    if (community.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to update this community" });
    }

    // Update the community name
    community.name = req.body.name || community.name;
    community.description = req.body.description || community.description;

    // Save updated community
    await community.save();
    res.status(200).json(community);
  } catch (error) {
    res.status(500).json({ message: "Error updating community", error: error.message });
  }
};


//invite to community
const inviteToCommunity = async (req, res) => {
  const { communityId } = req.params;
  const { friendIds } = req.body; // Extract friendIds from request body

  if (!friendIds || !Array.isArray(friendIds)) {
    return res.status(400).json({ message: "friendIds should be an array" });
  }

  try {
    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Ensure friendIds is initialized as an array before pushing
    if (!community.invitedFriends) {
      community.invitedFriends = [];
    }

    // Push friends into the invitedFriends array
    friendIds.forEach((friendId) => {
      if (!community.invitedFriends.includes(friendId)) {
        community.invitedFriends.push(friendId); // Invite friend only if not already invited
      }
    });

    await community.save();
    res.status(200).json({ message: "Friends invited successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error inviting friends", error: err.message });
  }
};


//request to join
const requestToJoin = async (req, res) => {
  try {
    const { communityId } = req.params;
    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Check if the user is already a member
    if (community.members.includes(req.user._id)) {
      return res.status(400).json({ message: "You are already a member of this community" });
    }

    // Check if the user has already requested to join
    if (community.joinRequests.includes(req.user._id)) {
      return res.status(400).json({ message: "You have already requested to join this community" });
    }

    // Add user to join requests
    community.joinRequests.push(req.user._id);
    await community.save();

    res.status(200).json({ message: "Join request sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error sending join request", error: error.message });
  }
};

//accept join request   
const acceptJoinRequest = async (req, res) => {
  try {
    const { communityId, userId } = req.params;
    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Check if the logged-in user is the creator
    if (community.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to accept join requests" });
    }

    // Check if the user has requested to join
    if (!community.joinRequests.includes(userId)) {
      return res.status(400).json({ message: "No join request found for this user" });
    }

    // Remove from join requests and add to members
    community.joinRequests = community.joinRequests.filter(
      (request) => request.toString() !== userId
    );
    community.members.push(userId);

    await community.save();
    res.status(200).json({ message: "User added to community" });
  } catch (error) {
    res.status(500).json({ message: "Error accepting join request", error: error.message });
  }
};

//reject join request  
const rejectJoinRequest = async (req, res) => {
  try {
    const { communityId, userId } = req.params;
    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Check if the logged-in user is the creator
    if (community.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to reject join requests" });
    }

    // Check if the user has requested to join
    if (!community.joinRequests.includes(userId)) {
      return res.status(400).json({ message: "No join request found for this user" });
    }

    // Remove from join requests
    community.joinRequests = community.joinRequests.filter(
      (request) => request.toString() !== userId
    );

    await community.save();
    res.status(200).json({ message: "User request rejected" });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting join request", error: error.message });
  }
};

//kick user
const kickUser = async (req, res) => {
  try {
    const { communityId, userId } = req.params;
    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Check if the logged-in user is the creator
    if (community.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to kick users" });
    }

    // Remove user from members
    community.members = community.members.filter((member) => member.toString() !== userId);

    await community.save();
    res.status(200).json({ message: "User kicked out of community" });
  } catch (error) {
    res.status(500).json({ message: "Error kicking user", error: error.message });
  }
};


//get community members
const getCommunityMembers = async (req, res) => {
  try {
    const { communityId } = req.params;
    const community = await Community.findById(communityId).populate("members", "name");

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    res.status(200).json(community.members);
  } catch (error) {
    res.status(500).json({ message: "Error fetching community members", error: error.message });
  }
};

// Get all communities
const getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.find().populate("creator", "name"); // Optionally, populate creator's name
    res.status(200).json(communities);
  } catch (error) {
    res.status(500).json({ message: "Error fetching communities", error: error.message });
  }
};


module.exports = {
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
  getAllCommunities
};
