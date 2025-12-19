import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

// Needed to serve HTML files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== LEADERBOARD DATA =====
let leaderboard = [];

// API: get leaderboard
app.get("/leaderboard", (req, res) => {
  res.json(leaderboard);
});

// API: submit / update score
app.post("/submit", (req, res) => {
  const { username, exp } = req.body;

  if (!username || typeof exp !== "number") {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const user = leaderboard.find(
    u => u.username.toLowerCase() === username.toLowerCase()
  );

  if (user) {
    user.exp = Math.max(user.exp, exp);
  } else {
    leaderboard.push({ username, exp });
  }

  res.json({ success: true });
});

// ===== SERVE FRONTEND FILES =====
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Aurababy server running on port", PORT);
});
