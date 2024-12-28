const mongoose = require("mongoose");

const workSchema = new mongoose.Schema(
  {
    task: {
      type: String,
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
  },
  { timestamps: true }
);

const Work = mongoose.model("Work", workSchema);

module.exports = Work;
