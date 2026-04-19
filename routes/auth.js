const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // 1. Ask Supabase to verify credentials
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(401).json({ error: error.message });
  }

  // 2. Supabase returns a 'session' containing the JWT (access_token)
  res.json({
    token: data.session.access_token,
    user: data.user,
  });
});

// --- NEW: Route for Admin to provision new users ---
router.post("/register", async (req, res) => {
  const { name, email, password, role, clearance } = req.body;

  // Use Supabase Admin API to create the user without requiring them to verify email immediately
  // Note: This requires the Service Role Key in your Supabase client config
  const { data, error } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true, // Automatically confirms the email so staff can log in immediately
    user_metadata: {
      full_name: name,
      role: role || "Staff",
      clearance: clearance || 2,
    },
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({
    message: "User provisioned successfully",
    user: data.user,
  });
});

module.exports = router;
