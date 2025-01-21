const express = require("express");
const router = express.Router();
const { createWork, getAllWork, updateWork, getWorkSummary } = require("../controllers/workController");
const { protect } = require("../middleware/authMiddleware"); 

router.post("/create", protect, createWork);

router.get("/", protect, getAllWork);

router.put("/:id", protect, updateWork);

router.get("/summary", protect, getWorkSummary);

module.exports = router;
