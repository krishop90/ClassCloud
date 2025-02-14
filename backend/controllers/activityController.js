// activityController.js
const User = require("../models/userModel");
const Event = require("../models/eventModel");
const Note = require("../models/noteModel");
const Community = require("../models/communityModel");

const getRecentActivity = async (req, res) => {
  try {
    const userId = req.user._id;
    const timeAgo = (date) => {
      const seconds = Math.floor((new Date() - date) / 1000);
      
      if (seconds < 60) return 'just now';
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes} minutes ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours} hours ago`;
      const days = Math.floor(hours / 24);
      return `${days} days ago`;
    };

    // Get registered events with timestamps
    const registeredEvents = await Event.find({ "registrations.user": userId })
      .sort({ "registrations.registeredAt": -1 })
      .limit(5)
      .select('title registrations')
      .lean();

    // Get recent notes
    const recentNotes = await Note.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title createdAt')
      .lean();

    // Get recently joined communities
    const recentCommunities = await Community.find({ "members": userId })
      .sort({ "members.joinedAt": -1 })
      .limit(5)
      .select('name createdAt')
      .lean();

    // Format the activities with relative time
    const activities = [
      ...registeredEvents.map(event => ({
        type: 'event',
        title: event.title,
        time: timeAgo(new Date(event.registrations[0].registeredAt)),
        action: 'Registered for event'
      })),
      ...recentNotes.map(note => ({
        type: 'note',
        title: note.title,
        time: timeAgo(new Date(note.createdAt)),
        action: 'Created note'
      })),
      ...recentCommunities.map(community => ({
        type: 'community',
        title: community.name,
        time: timeAgo(new Date(community.createdAt)),
        action: 'Joined community'
      }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json(activities);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({ message: "Failed to fetch recent activity" });
  }
};

module.exports = {getRecentActivity};
