const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  let token;

  // Check if the authorization header contains a bearer token
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1]; // Extract token from the header
      
      // Verify the token using JWT secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user based on the decoded token id and exclude the password field
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        console.log("User not found for ID:", decoded.id);
        return res.status(404).json({ message: "User not found" });
      }

      // Attach the user object to the request
      req.user = user;

      next(); // Proceed to the next middleware or route handler
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
