const jwt = require("jsonwebtoken");

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: true, message: "Token required" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log("Token verification failed:", err); // Log verification errors
      return res.status(403).json({ error: true, message: "Invalid token" });
    }

    console.log("Decoded data:", decoded); // Log the entire decoded data

    // Ensure the decoded token has user information before attaching
    if (decoded && (decoded.user || (decoded._id && decoded.role))) {
      req.user = decoded.user || decoded; // Attach the user data
      console.log("User data attached to req.user:", req.user); // Log req.user for confirmation
    } else {
      console.log("No user data found in decoded token"); // Log if no user data found
      return res
        .status(403)
        .json({ error: true, message: "Invalid token payload" });
    }

    next();
  });
}

// Middleware to check role
function checkRole(requiredRoles) {
  return (req, res, next) => {
    console.log(
      "User role in checkRole middleware:",
      req.user ? req.user.role : "undefined"
    ); // Log role for confirmation

    if (req.user && requiredRoles.includes(req.user.role)) {
      return next();
    }
    {
      return res.status(403).json({ error: true, message: "Access denied" });
    }
  };
}

module.exports = {
  authenticateToken,
  checkRole,
};
