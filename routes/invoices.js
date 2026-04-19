const express = require("express");
const router = express.Router();
// Changed to supabase config
const supabase = require("../config/supabase");
// Added auth middleware for protection
const auth = require("../middleware/authMiddleware");

// GET all invoices from Supabase
// Added 'auth' middleware here
router.get("/", auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST/UPSERT invoice data from Flutter
// Updated path to /sync to match SyncService and added auth
router.post("/sync", auth, async (req, res) => {
  try {
    const { invoices } = req.body;

    // Safety check for empty or missing invoices array
    if (!invoices || !Array.isArray(invoices)) {
      return res.status(400).json({ error: "No invoices provided for sync" });
    }

    // Using upsert so it updates existing invoices or creates new ones
    const { data, error } = await supabase
      .from("invoices")
      .upsert(invoices, { onConflict: "id" });

    if (error) throw error;
    res.status(201).json({ message: "Invoice synced successfully", data });
  } catch (err) {
    console.error("Invoice Sync Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
