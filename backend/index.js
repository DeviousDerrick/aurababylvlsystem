import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

let leaderboard = [];

// health check
app.get("/", (req, res) => {
  res.send("Aurababy backend running");
});

app.get("/leaderboard", (req, res) => {
  res.json(leaderboard);
});

app.post("/submit", (req, res) => {
  const { username, exp } = req.body;
  if (!username || typeof exp !== "number") {
    return res.status(400).json({ error: "Bad data" });
  }

  const existing = leaderboard.find(
    u => u.username.toLowerCase() === username.toLowerCase()
  );

  if (existing) {
    existing.exp = Math.max(existing.exp, exp);
  } else {
    leaderboard.push({ username, exp });
  }

  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Backend listening on", PORT);
});
