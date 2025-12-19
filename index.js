import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// In-memory leaderboard (OK for now)
let leaderboard = [];

// GET leaderboard
app.get("/leaderboard", (req, res) => {
  res.json(leaderboard);
});

// POST submit / update score
app.post("/submit", (req, res) => {
  const { username, exp } = req.body;

  if (!username || typeof exp !== "number") {
    return res.status(400).json({ error: "Invalid data" });
  }

  const existing = leaderboard.find(
    u => u.username.toLowerCase() === username.toLowerCase()
  );

  if (existing) {
    // update score (keep highest EXP)
    existing.exp = Math.max(existing.exp, exp);
  } else {
    leaderboard.push({ username, exp });
  }

  res.json({ success: true });
});

// Health check (VERY important)
app.get("/", (req, res) => {
  res.send("Aurababy leaderboard backend running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
