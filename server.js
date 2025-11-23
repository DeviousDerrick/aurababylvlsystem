const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public")); // your static files go in /public folder

// File to store leaderboard data
const DATA_FILE = path.join(__dirname, "leaderboard.json");

// Helper to read/write leaderboard
function readLeaderboard() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const raw = fs.readFileSync(DATA_FILE);
  return JSON.parse(raw);
}

function writeLeaderboard(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Routes
app.get("/api/leaderboard", (req, res) => {
  const leaderboard = readLeaderboard();
  res.json(leaderboard);
});

app.post("/api/leaderboard", (req, res) => {
  const { username, exp, time } = req.body;
  if (!username || exp == null || time == null) {
    return res.status(400).json({ error: "Missing fields" });
  }

  let leaderboard = readLeaderboard();
  const existing = leaderboard.find(u => u.username === username);

  if (existing) {
    existing.exp = Math.max(existing.exp, exp);
    existing.time = Math.max(existing.time, time);
  } else {
    leaderboard.push({ username, exp, time });
  }

  writeLeaderboard(leaderboard);
  res.json({ success: true });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
