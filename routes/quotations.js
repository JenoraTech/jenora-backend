const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const auth = require("../middleware/authMiddleware");

// 🔥 ADDED: Debug helper (does NOT affect logic)
const debugAuth = (req) => {
  const header = req.headers.authorization;
  console.log("🔐 Auth Header:", header);
};

// 🔽 PUSH (Upload from Flutter → Server)
router.post("/sync", auth, async (req, res) => {
  try {
    debugAuth(req); // 🔥 ADDED

    const { quotations } = req.body;

    if (!quotations || !Array.isArray(quotations)) {
      return res.status(400).json({ error: "No quotations provided for sync" });
    }

    for (let q of quotations) {
      const { data: existing, error: fetchError } = await supabase
        .from("quotations")
        .select("*")
        .eq("id", q.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!existing) {
        const { error: insertError } = await supabase
          .from("quotations")
          .insert({
            id: q.id,
            project_title: q.project_title,
            client_name: q.client_name,
            total_amount: q.total_amount,
            created_by_id: q.created_by_id,
            created_by_name: q.created_by_name,
            created_at: q.created_at,
            updated_at: q.updated_at,
          });

        if (insertError) throw insertError;
      } else {
        const serverDate = new Date(existing.updated_at);
        const clientDate = new Date(q.updated_at);

        if (clientDate > serverDate) {
          const { error: updateError } = await supabase
            .from("quotations")
            .update({
              project_title: q.project_title,
              client_name: q.client_name,
              total_amount: q.total_amount,
              updated_at: q.updated_at,
            })
            .eq("id", q.id);

          if (updateError) throw updateError;
        }
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Sync Error:", err);
    res.status(500).json({ error: "Sync failed", details: err.message });
  }
});

// 🔽 PULL (Download from Server → Flutter)
router.get("/", auth, async (req, res) => {
  try {
    debugAuth(req); // 🔥 ADDED

    const { last_sync } = req.query;

    let query = supabase.from("quotations").select("*");

    if (last_sync && last_sync !== "null" && last_sync !== "undefined") {
      query = query.gt("updated_at", last_sync);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Fetch failed", details: err.message });
  }
});

module.exports = router;
