const Event = require("../models/eventModel");
const { parse } = require('json2csv');

// Create a new event
const createEvent = async (req, res) => {
    const { title, description, venue, date, time } = req.body;

    if (!title || !description || !venue || !date || !time) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const newEvent = new Event({
            title,
            description,
            venue,
            date,
            time,
            createdBy: req.user.id
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
    const { eventId, name, email, phone } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.registrations.push({ name, email, phone });
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
    const eventId = req.params.id;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const registrations = event.registrations.map(reg => ({
      name: reg.name,
      email: reg.email,
      phone: reg.phone
    }));

    const csv = parse(registrations);

    res.header('Content-Type', 'text/csv');
    res.attachment('registrations.csv');
    res.send(csv);

  } catch (error) {
    console.error("Error downloading registration sheet:", error);
    res.status(500).json({ message: 'Error downloading registration sheet', error: error.message });
  }
};

// Delete an event
const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.createdBy.toString() !== req.user._id.toString()) {
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
    const fifteenDaysLater = new Date(today);
    fifteenDaysLater.setDate(today.getDate() + 15); 

    const upcomingEvents = await Event.find({
      date: { $gte: today, $lte: fifteenDaysLater }
    })
      .sort({ date: 1 })
      .limit(5); 

    res.json(upcomingEvents);
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    res.status(500).json({ message: "Failed to fetch upcoming events", error: error.message });
  }
};

module.exports = { createEvent, getAllEvents, registerForEvent , downloadRegistrations , deleteEvent , getUpcomingEvents}; 
