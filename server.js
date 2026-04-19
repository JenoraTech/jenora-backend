require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// routes
// --- ADDED AUTH ROUTE FOR JWT LOGIN ---
app.use("/api/auth", require("./routes/auth"));
// --- KEPT EXISTING QUOTATIONS ROUTE ---
app.use("/api/quotations", require("./routes/quotations"));

app.get("/", (req, res) => {
  res.send("Jenora API is running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
