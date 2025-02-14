const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: String,
  email: String,
  registeredAt: {
    type: Date,
    default: Date.now
  }
});

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  venue: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  registrations: [registrationSchema],
  capacity: { type: Number, required: true },
});

module.exports = mongoose.model("Event", eventSchema);
