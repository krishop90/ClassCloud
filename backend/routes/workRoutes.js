const express = require("express");
const router = express.Router();
const { createWork, getAllWork, updateWork } = require("../controllers/workController");
const { protect } = require("../middleware/authMiddleware"); // Assuming you have this middleware for authentication

// Route to create a new work/task (only accessible to authenticated users)
router.post("/create", protect, createWork);

// Route to get all work/tasks (only accessible to authenticated users)
router.get("/", protect, getAllWork);

// Route to update work (mark as completed and delete)
router.put("/:id", protect, updateWork);

module.exports = router;
