const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

// GET all inventory items
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("inventory")
      .select("*")
      .order("category", { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new inventory item
router.post("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("inventory")
      .upsert(req.body, { onConflict: "id" });

    if (error) throw error;
    res.status(201).json({ message: "Inventory updated", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔥 CRITICAL: This must be at the very bottom!
module.exports = router;
