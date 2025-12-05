const jwt = require("jsonwebtoken");

const adminAuth = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check admin role ONLY
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    req.admin = decoded; // attach admin details
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};


module.exports = adminAuth;
