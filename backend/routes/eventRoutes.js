const express = require("express");
const router = express.Router();
const {
  createEvent,
  getAllEvents,
  registerForEvent,
  downloadRegistrations,
  deleteEvent,
  getUpcomingEvents,
  searchEvents,
} = require("../controllers/eventController");
const eventController = require('../controllers/eventController');
const { protect } = require("../middleware/authMiddleware"); 
const authenticate = require('../middleware/authMiddleware');


// create an event
router.post("/create", protect, createEvent);

// get all events
router.get("/", getAllEvents);

// register for an event
router.post('/register/:eventId', protect, registerForEvent);


// download event registrations
router.get('/download/:id', protect, downloadRegistrations);

// delete an event
router.delete("/:id", protect, deleteEvent);


// get upcoming events
router.get("/upcoming", protect, getUpcomingEvents);

// Search for events
router.get("/search", protect, searchEvents);

module.exports = router;
