const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const LEADERBOARD_FILE = path.join(__dirname, "leaderboard.json");

function readLeaderboard() {
  return JSON.parse(fs.readFileSync(LEADERBOARD_FILE, "utf8"));
}

function writeLeaderboard(data) {
  fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(data, null, 2));
}

app.get("/scores", (req, res) => {
  const data = readLeaderboard();
  res.json(data);
});

app.post("/submit", (req, res) => {
  const { username, exp, time } = req.body;
  if (!username || (!exp && !time)) return res.json({ success: false });

  let data = readLeaderboard();
  const existing = data.find(u => u.username === username);
  if (existing) {
    existing.exp = Math.max(existing.exp, exp);
    existing.time = Math.max(existing.time, time);
  } else {
    data.push({ username, exp, time });
  }

  writeLeaderboard(data);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`Leaderboard backend running on port ${PORT}`));
