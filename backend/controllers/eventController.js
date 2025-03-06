const Event = require("../models/eventModel");
const { parse } = require('json2csv');
const {fs} = require('fs');
const User = require("../models/userModel");
const nodemailer = require('nodemailer');

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

    // Get all users except the creator
    const users = await User.find({ 
      _id: { $ne: req.user._id } 
    }).select('email name');

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Format date and time for email
    const eventDate = new Date(date).toLocaleDateString();
    const eventLink = `${process.env.CLIENT_URL}/events/${newEvent._id}`;

    // Send emails to all users
    for (const user of users) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `New Event: ${title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4A63D3;">New Event Alert: ${title}!</h2>
            <p>Hello ${user.name},</p>
            <p>A new event has been created that you might be interested in:</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">${title}</h3>
              <p>${description}</p>
              <p><strong>Venue:</strong> ${venue}</p>
              <p><strong>Date:</strong> ${eventDate}</p>
              <p><strong>Time:</strong> ${time}</p>
            </div>

            <a href="${eventLink}" style="
              background-color: #4A63D3;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 5px;
              display: inline-block;
              margin: 20px 0;
            ">Register Now</a>

            <p style="color: #666; font-size: 0.9em;">
              If you're not logged in, you'll be directed to the login page first.
            </p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
    }

    res.status(201).json({ 
      message: 'Event created and notifications sent successfully',
      event: newEvent 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Error creating event or sending notifications', 
      error: error.message 
    });
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


    const events = await Event.find({
      date: {
        $gte: today,
        $lte: fifteenDaysFromNow
      }
    })
    .sort({ date: 1 })
    .populate('createdBy', 'username');

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
