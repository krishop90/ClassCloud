const Work = require("../models/workModel");

// Create a new work/task
const createWork = async (req, res) => {
  try {
    const { task } = req.body;

    if (!task) {
      return res.status(400).json({ message: "Task description is required." });
    }

    const newWork = new Work({
      task,
      createdBy: req.user.id, // Assuming user is logged in and the ID is available in req.user
    });

    await newWork.save();
    res.status(201).json(newWork);
  } catch (error) {
    console.error("Error creating work:", error);
    res.status(500).json({ message: "Error creating task", error: error.message });
  }
};

// Get all work/tasks for the logged-in user
const getAllWork = async (req, res) => {
  try {
    const workList = await Work.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(workList);
  } catch (error) {
    console.error("Error fetching work:", error);
    res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
};

// Update task (mark as completed)
const updateWork = async (req, res) => {
  try {
    const { id } = req.params;
    const work = await Work.findById(id);

    if (!work) {
      return res.status(404).json({ message: "Work not found" });
    }

    // Mark as completed (toggle the isCompleted field)
    work.isCompleted = !work.isCompleted;

    await work.save();

    // If completed, delete the task
    if (work.isCompleted) {
      await work.deleteOne();
      return res.status(200).json({ message: "Task completed and deleted" });
    }

    res.status(200).json(work);
  } catch (error) {
    console.error("Error updating work:", error);
    res.status(500).json({ message: "Error updating task", error: error.message });
  }
};

// Export the controller functions
module.exports = { createWork, getAllWork, updateWork };
