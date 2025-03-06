const Work = require("../models/workModel");

const createWork = async (req, res) => {
  try {
    const { task } = req.body;

    if (!task) {
      return res.status(400).json({ message: "Task description is required." });
    }

    const newWork = new Work({
      task,
      createdBy: req.user.id, 
    });

    await newWork.save();
    res.status(201).json(newWork);
  } catch (error) {
    console.error("Error creating work:", error);
    res.status(500).json({ message: "Error creating task", error: error.message });
  }
};

const getAllWork = async (req, res) => {
  try {
    const workList = await Work.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(workList);
  } catch (error) {
    console.error("Error fetching work:", error);
    res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
};


const getWorkSummary = async (req, res) => {
  try {
    const totalTasks = await Work.countDocuments({ createdBy: req.user.id });
    const completedTasks = await Work.countDocuments({ createdBy: req.user.id, isCompleted: true });
    const remainingTasks = totalTasks - completedTasks;

    res.status(200).json({
      totalTasks,
      completedTasks,
      remainingTasks
    });
  } catch (error) {
    console.error("Error fetching work summary:", error);
    res.status(500).json({ message: "Error fetching work summary", error: error.message });
  }
};

const updateWork = async (req, res) => {
  try {
    const { id } = req.params;
    const work = await Work.findById(id);

    if (!work) {
      return res.status(404).json({ message: "Work not found" });
    }

    work.isCompleted = !work.isCompleted;

    await work.save();

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

module.exports = { createWork, getAllWork, updateWork, getWorkSummary };
