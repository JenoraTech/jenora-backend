require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/quotations", require("./routes/quotations"));

// --- NEW: INVENTORY ROUTE ---
app.use("/api/inventory", require("./routes/inventory"));

// --- HEALTH CHECK ENDPOINTS FOR FLUTTER SYNC ---
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Jenora API is healthy" });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Jenora API is healthy" });
});

app.get("/", (req, res) => {
  res.send("Jenora API is running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
