const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        console.log("User not found for token:", decoded.id);
        return res.status(404).json({ message: "User not found" });
      }

      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        console.log("User not found for ID:", decoded.id);
        return res.status(404).json({ message: "User not found" });
      }

      req.user = user;

      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    console.log("No token provided");
    res.status(401).json({ message: "Not authorized, no token" });
  }
};


module.exports = { protect };
