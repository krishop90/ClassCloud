const History = require("../models/historyModel");

// Add a video to history
const addToHistory = async (req, res) => {
  try {
    const { userId, videoId, watchDuration, completed } = req.body;

    const newHistory = await History.create({
      user: userId,
      video: videoId,
      watchDuration,
      completed,
    });

    res.status(201).json(newHistory);
  } catch (error) {
    res.status(500).json({ message: "Failed to add to history", error });
  }
};

// Get user's watch history
const getUserHistory = async (req, res) => {
  try {
    const userId = req.params.userId;

    const history = await History.find({ user: userId })
      .populate("video", "title thumbnail")
      .sort({ watchedAt: -1 });

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch history", error });
  }
};

module.exports = { addToHistory, getUserHistory };
