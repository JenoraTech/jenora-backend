const express = require("express");
const router = express.Router();
// Changed to supabase config
const supabase = require("../config/supabase");
// Added auth middleware for protection
const auth = require("../middleware/authMiddleware");

// 🔽 PUSH (Upload from Flutter → Server)
// Added 'auth' middleware here
router.post("/sync", auth, async (req, res) => {
  try {
    const { quotations } = req.body;

    for (let q of quotations) {
      // Check for existing record using Supabase
      const { data: existing, error: fetchError } = await supabase
        .from("quotations")
        .select("*")
        .eq("id", q.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!existing) {
        // INSERT using Supabase
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
        // UPDATE if newer (Conflict Resolution Logic preserved)
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
    console.error(err);
    res.status(500).json({ error: "Sync failed", details: err.message });
  }
});

// 🔽 PULL (Download from Server → Flutter)
// Added 'auth' middleware here
router.get("/", auth, async (req, res) => {
  try {
    const { last_sync } = req.query;

    let query = supabase.from("quotations").select("*");

    // Apply filter if last_sync is provided
    if (last_sync) {
      query = query.gt("updated_at", last_sync);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fetch failed", details: err.message });
  }
});

module.exports = router;
