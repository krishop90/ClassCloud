const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                message: 'Authentication required',
                invalidToken: true 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ 
                message: 'User not found',
                invalidToken: true 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ 
            message: 'Invalid or expired token',
            invalidToken: true 
        });
    }
};

module.exports = { protect };
