const jwt = require('jsonwebtoken');

// Middleware to verify token
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Access Denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(400).json({ success: false, message: "Invalid token." });
  }
};

// Middleware to verify SuperAdmin
exports.verifySuperAdmin = (req, res, next) => {
  if (req.user?.role === "superadmin") {
    next();
  } else {
    return res.status(403).json({ success: false, message: "Access Denied. Only SuperAdmins allowed." });
  }
};


exports.adminAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.admin = decoded; // 💥 attach decoded user
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
