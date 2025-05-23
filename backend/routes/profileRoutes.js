const express = require("express");
const { body, validationResult } = require("express-validator");
const { protect } = require("../middleware/authMiddleware");
const User = require("../models/userModel");
const { deleteAccount } = require("../controllers/userController");
const { getProfile } = require("../controllers/userController");
const { updatePassword } = require("../controllers/userController");

const router = express.Router();

router.put(
  "/me",
  protect,
  [
    body("name").optional().isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters."),
    body("bio").optional().isLength({ max: 200 }).withMessage("Bio cannot exceed 200 characters."),
    body("avatar").optional().isURL().withMessage("Avatar must be a valid URL."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, bio, avatar } = req.body;

    try {
      const updatedProfile = await User.findByIdAndUpdate(
        req.user.id,
        { name, bio, avatar },
        { new: true, runValidators: true }
      );

      if (!updatedProfile) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(updatedProfile);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
);

router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/" , protect, getProfile);

router.delete("/delete-profile", protect, deleteAccount);

router.put("/update-password", protect, updatePassword);

module.exports = router;
