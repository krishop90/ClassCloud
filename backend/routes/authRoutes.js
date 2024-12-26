const express = require("express");
const { body, validationResult } = require("express-validator");
const { signup, login, forgotPassword, resetPassword } = require("../controllers/userController"); // Import the controller functions

const router = express.Router();

// Signup Route
router.post(
  "/signup",
  [
    body("email").isEmail().withMessage("Enter a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    body("username").isLength({ min: 3, max: 20 }).withMessage("Username must be between 3 and 20 characters"),
  ],
  signup // Use the signup controller function
);

// Login Route
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Enter a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  login // Use the login controller function
);

// Forgot Password Route
router.post("/forgot-password", forgotPassword);

// Reset Password Route
router.post("/reset-password/:token", resetPassword);

module.exports = router;
