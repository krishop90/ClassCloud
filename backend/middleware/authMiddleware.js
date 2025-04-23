const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'Authentication required',
        invalidToken: true,
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          message: 'User not found',
          invalidToken: true,
        });
      }

      req.user = user;
      next();
    } catch (tokenError) {
      // Handle specific token errors
      if (tokenError.code === 'ECONNRESET') {
        console.error('Connection reset error during token verification:', tokenError);
        return res.status(503).json({
          message: 'Service temporarily unavailable',
          error: 'Connection issue',
          invalidToken: false
        });
      }

      return res.status(401).json({
        message: 'Invalid or expired token',
        invalidToken: true,
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      message: 'Server error during authentication',
      error: error.message
    });
  }
};

module.exports = { protect };
