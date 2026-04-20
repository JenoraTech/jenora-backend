// config/supabase.js
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY, // Changed from ANON_KEY to allow Admin/Auth actions
);

module.exports = supabase;
