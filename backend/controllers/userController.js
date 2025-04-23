const bcrypt = require("bcrypt");
  const jwt = require("jsonwebtoken");
  const {validationResult} = require("express-validator");
  const nodemailer = require("nodemailer");
  const User = require("../models/userModel");

  const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
  };

  // Signup Controller
  const signup = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, username } = req.body;
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    try {
      
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
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  };


  // Login Controller
  const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ 
                success: false,
                message: "Email and password are required" 
            });
        }
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid credentials" 
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid credentials" 
            });
        }

        //JWT token
        const token = jwt.sign(
            { 
                id: user._id,
                email: user.email,
                name: user.name 
            },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false,
            message: "An error occurred during login" 
        });
    }
};

  // Logout Controller
  const logout = async (req, res) => {
    try {
      req.user = null;
      res.status(200).json({ message: "Logout successful" });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  };

  // Delete Account Controller
  const deleteAccount = async (req, res) => {
    try {
      const userId = req.user.id;

      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const user = await User.findByIdAndDelete(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
      console.error("Error in deleteAccount controller:", error);
      return res.status(500).json({ error: "Server error" });
    }
  };

  const getProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select("name email username avatar");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  // Forgot Password Controller
  const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
      
      const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset Request - Educonnect",
        html: `
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your Educonnect account.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" style="
            background-color: #4A63D3;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
            margin: 20px 0;
          ">Reset Password</a>
          <p>This link will expire in 15 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: "Password reset link sent to email" });
    } catch (err) {
      console.error("Error in forgotPassword:", err);
      res.status(500).json({ message: "Error sending reset email", error: err.message });
    }
  };

  // Reset Password Controller
  const resetPassword = async (req, res) => {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      user.password = hashedPassword;
      await user.save();

      res.json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Reset password error:", error);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Reset link has expired" });
      }
      res.status(500).json({ message: "Error resetting password" });
    }
  };
  
  const sendFriendRequest = async (req, res) => {
    const { recipientId } = req.body;
    try {
      const recipient = await User.findById(recipientId);

      if (!recipient) {
        return res.status(404).json({ message: "User not found" });
      }

      if (recipient._id.toString() === req.user.id) {
        return res.status(400).json({ message: "You cannot send a friend request to yourself" });
      }

      if (recipient.friendRequests.includes(req.user.id)) {
        return res.status(400).json({ message: "Friend request already sent" });
      }

      recipient.friendRequests.push(req.user.id);
      await recipient.save();

      res.status(200).json({ message: `Friend request sent to ${recipient.username}` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  };

  // Accept Friend Request Controller
  const acceptFriendRequest = async (req, res) => {
    const { senderId } = req.body;
    try {
      const recipient = await User.findById(req.user.id);
      const sender = await User.findById(senderId);

      if (!sender) {
        return res.status(404).json({ message: "Sender not found" });
      }

      if (!recipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }

      if (!recipient.friendRequests.includes(senderId)) {
        return res.status(400).json({ message: "Friend request not found" });
      }

      recipient.friendRequests = recipient.friendRequests.filter(id => id.toString() !== senderId);
      recipient.friends.push(senderId);
      await recipient.save();

      sender.friends.push(req.user.id);
      await sender.save();

      res.status(200).json({ message: `Friend request accepted from ${sender.username}` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  };

  // Reject Friend Request Controller
  const rejectFriendRequest = async (req, res) => {
    const { requesterId } = req.body;
    try {
      const recipient = await User.findById(req.user.id);

      if (!recipient) {
        return res.status(404).json({ message: "User not found" });
      }

      recipient.friendRequests = recipient.friendRequests.filter(id => id.toString() !== requesterId);
      await recipient.save();

      res.status(200).json({ message: "Friend request rejected" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  };

  // recent activity
  const getRecentActivity = async (req, res) => {
    try {
      const userId = req.user.id;

      const registeredEvents = await Event.find({ "registrations.userId": userId })
        .sort({ date: -1 })
        .limit(5);

      const recentNotes = await Note.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5);

      const recentCommunities = await Community.find({ "members.userId": userId })
        .sort({ createdAt: -1 })
        .limit(5);

      res.json({ registeredEvents, recentNotes, recentCommunities });
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      res.status(500).json({ message: "Failed to fetch recent activity", error: error.message });
    }
  };

  // friend list
  const getFriendsList = async (req, res) => {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId).populate("friends", "name username avatar");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(user.friends);
    } catch (error) {
      console.error("Error fetching friends list:", error);
      res.status(500).json({ message: "Failed to fetch friends list", error: error.message });
    }
  };

  const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({ message: "Both fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const verifyToken = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.json({ valid: false });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.json({ valid: false });
        }

        res.json({ valid: true });
    } catch (error) {
        res.json({ valid: false });
    }
};

  module.exports = {
    signup,
    login,
    logout,
    getProfile,
    deleteAccount,
    forgotPassword,
    resetPassword,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    getRecentActivity,
    getFriendsList,
    updatePassword,
    verifyToken
  };

