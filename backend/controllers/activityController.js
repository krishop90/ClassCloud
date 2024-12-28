// activityController.js
const User = require("../models/userModel");
const Event = require("../models/eventModel");
const Note = require("../models/noteModel");
const Community = require("../models/communityModel");

const getRecentActivity = async (req, res) => {
  try {
    const userId = req.user._id; 

    const registeredEvents = await Event.find({ "registrations.userId": userId })
      .sort({ date: -1 })
      .limit(5);

    const recentNotes = await Note.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    const recentCommunities = await Community.find({ "members.userId": userId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      registeredEvents,
      recentNotes,
      recentCommunities,
    });
  } catch (error) {
    console.error("Error fetching recent activity:", error.message);
    res.status(500).json({ message: "Failed to fetch recent activity", error: error.message });
  }
};


module.exports = {getRecentActivity};
