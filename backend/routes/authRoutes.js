const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { body, validationResult } = require("express-validator");
const User = require("../models/userModel");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Signup Route
router.post(
  "/signup",
  [
    body("email").isEmail().withMessage("Enter a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    body("username").isLength({ min: 3, max: 20 }).withMessage("Username must be between 3 and 20 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, username } = req.body;

    try {
      // Check for existing email or username
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already in use" });
      }

      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ error: "Username already in use" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ name, email, password: hashedPassword, username });
      await newUser.save();

      res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }
);


// Login Route
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Enter a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Forgot Password Route
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the user exists with the provided email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Generate a password reset URL with the token
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${encodeURIComponent(token)}`;

    const transporter = nodemailer.createTransport({
      service: "gmail", 
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      text: `You requested a password reset. Please click the link below to reset your password:\n\n${resetUrl}`,
    };

    // Send the reset password email
    await transporter.sendMail(mailOptions);

    // Return a success response
    res.status(200).json({
      message: "Password reset link sent to email",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Reset Password Route
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params; 
  const { newPassword } = req.body;  

  
  console.log('Token received:', token); 

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Invalid or expired token" });
  }
});


module.exports = router;
