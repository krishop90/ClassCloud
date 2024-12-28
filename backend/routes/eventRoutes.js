const express = require("express");
const router = express.Router();
const {
  createEvent,
  getAllEvents,
  registerForEvent,
  downloadRegistrations,
  deleteEvent,
  getUpcomingEvents,
} = require("../controllers/eventController");
const eventController = require('../controllers/eventController');
const { protect } = require("../middleware/authMiddleware"); 
const authenticate = require('../middleware/authMiddleware');


// Route to create an event (only accessible to authenticated users)
router.post("/create", protect, createEvent);

// Route to get all events
router.get("/events", getAllEvents);

// Route to register for an event
router.post("/register", registerForEvent);

// Route to download event registrations
router.get('/download/:id', protect, downloadRegistrations);

// Route to delete an event
router.delete("/:id", protect, deleteEvent);


// Route to get upcoming events
router.get("/upcoming", eventController.getUpcomingEvents);

module.exports = router;
