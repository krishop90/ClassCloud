const Event = require("../models/eventModel");
const { parse } = require('json2csv');
const {fs} = require('fs');
const User = require("../models/userModel");
// Create a new event
const createEvent = async (req, res) => {
  const { title, description, venue, date, time, capacity } = req.body;

  if (!title || !description || !venue || !date || !time || !capacity) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const newEvent = new Event({
      title,
      description,
      venue,
      date,
      time,
      capacity,
      createdBy: req.user._id  // Updated to use _id instead of id
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
};

// Get all events
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate("createdBy", "username email").sort({ date: -1 });
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Failed to fetch events", error: error.message });
  }
};

// Register for an event
const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    if (event.registrations.length >= event.capacity) {
      return res.status(400).json({ message: "Event capacity reached" });
    }

    // Get full user details including email
    const user = await User.findById(req.user._id).select('name email');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Store both user reference and email
    event.registrations.push({
      user: user._id,
      name: user.name,
      email: user.email
    });

    await event.save();
    res.status(200).json({ message: "Registration successful" });
  } catch (error) {
    console.error("Error registering for event:", error);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

// download registration sheet
const downloadRegistrations = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('registrations.user', 'email name');

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (String(event.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const csvRows = [];
    csvRows.push("Name,Email");

    for (const reg of event.registrations) {
      const name = reg.name || (reg.user && reg.user.name) || 'N/A';
      const email = reg.email || (reg.user && reg.user.email) || 'N/A';
      csvRows.push(`${name},${email}`);
    }

    const csvData = csvRows.join("\n");
    res.header("Content-Type", "text/csv");
    res.attachment("registrations.csv");
    return res.send(csvData);
  } catch (error) {
    console.error("Error downloading registration sheet:", error);
    return res.status(500).json({ message: "Error downloading registration sheet" });
  }
};

// Delete an event
const deleteEvent = async (req, res) => {
  try {
    const eventId =   req.params.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (String(event.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await event.deleteOne();
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: 'Error deleting event', error: error.message });
  }
};

const getUpcomingEvents = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fifteenDaysFromNow = new Date(today);
    fifteenDaysFromNow.setDate(fifteenDaysFromNow.getDate() + 15);
    fifteenDaysFromNow.setHours(23, 59, 59, 999);

    console.log("Fetching events between:", today, "and", fifteenDaysFromNow);

    const events = await Event.find({
      date: {
        $gte: today,
        $lte: fifteenDaysFromNow
      }
    })
    .sort({ date: 1 })
    .populate('createdBy', 'username');

    console.log("Found upcoming events:", events);
    res.json(events);
  } catch (error) {
    console.error("Error in getUpcomingEvents:", error);
    res.status(500).json({ message: "Error fetching upcoming events" });
  }
};

const searchEvents = async (req, res) => {
  try {
    const { title, venue, date, creator } = req.query;

    // Build a dynamic query object
    const query = {};

    if (title) {
      query.title = { $regex: title, $options: "i" }; // Case-insensitive regex
    }
    if (venue) {
      query.venue = { $regex: venue, $options: "i" };
    }
    if (date) {
      query.date = new Date(date); // Exact date match
    }
    if (creator) {
      query.createdBy = creator;
    }

    const events = await Event.find(query)
      .populate("createdBy", "username email") 
      .sort({ date: 1 }); 

    res.status(200).json(events);
  } catch (error) {
    console.error("Error searching for events:", error);
    res.status(500).json({ message: "Failed to search for events", error: error.message });
  }
};

module.exports = { createEvent, getAllEvents, registerForEvent , downloadRegistrations , deleteEvent , getUpcomingEvents , searchEvents};
