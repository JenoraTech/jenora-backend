const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

// GET all inventory items
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase.from("inventory").select("*");

    if (error) {
      console.error("❌ Inventory Fetch Error:", error.message);
      return res.status(500).json({ error: error.message });
    }

    // 🔥 SAFE SORT (prevents crash if column missing)
    const sortedData = (data || []).sort((a, b) => {
      if (!a.category || !b.category) return 0;
      return a.category.localeCompare(b.category);
    });

    res.status(200).json(sortedData);
  } catch (err) {
    console.error("❌ Inventory Route Crash:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST new inventory item
router.post("/", async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ error: "Missing request body" });
    }

    const { data, error } = await supabase
      .from("inventory")
      .upsert(req.body, { onConflict: "id" });

    if (error) {
      console.error("❌ Inventory Upsert Error:", error.message);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({
      message: "Inventory updated",
      data,
    });
  } catch (err) {
    console.error("❌ Inventory POST Crash:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
