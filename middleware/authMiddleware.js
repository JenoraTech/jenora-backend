const supabase = require("../config/supabase");

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

    // 🔥 FIX: Proper Supabase user verification
    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      console.error("❌ Auth Error:", error.message);
      return res
        .status(401)
        .json({ message: "Invalid token", details: error.message });
    }

    if (!data?.user) {
      return res.status(401).json({ message: "User not found from token" });
    }

    req.user = data.user;
    next();
  } catch (err) {
    console.error("❌ Auth Middleware Crash:", err);
    return res
      .status(500)
      .json({ message: "Auth middleware error", error: err.message });
  }
};
