const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

// GET all invoices from Supabase
router.get("/", async (req, res) => {
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
router.post("/", async (req, res) => {
  try {
    const invoiceData = req.body;

    // Using upsert so it updates existing invoices or creates new ones
    const { data, error } = await supabase
      .from("invoices")
      .upsert(invoiceData, { onConflict: "id" });

    if (error) throw error;
    res.status(201).json({ message: "Invoice synced successfully", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
