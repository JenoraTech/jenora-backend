const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "No authorization header provided" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // 🔥 Decode without verification first (for debugging)
    const decoded = jwt.decode(token);

    if (!decoded) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    req.user = decoded; // Supabase user payload

    next();
  } catch (err) {
    console.error("❌ Auth Middleware Error:", err);
    return res.status(500).json({ message: "Auth error", error: err.message });
  }
};
