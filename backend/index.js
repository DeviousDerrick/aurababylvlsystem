import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, "leaderboard.json");

// Load leaderboard from file
async function loadLeaderboard() {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist yet, return empty array
    return [];
  }
}

// Save leaderboard to file
async function saveLeaderboard(data) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error saving leaderboard:", error);
  }
}

// Health check
app.get("/", (req, res) => {
  res.send("Aurababy backend running ✨");
});

// Get leaderboard
app.get("/leaderboard", async (req, res) => {
  try {
    const leaderboard = await loadLeaderboard();
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: "Failed to load leaderboard" });
  }
});

// Submit/Update score
app.post("/submit", async (req, res) => {
  const { username, exp, level, time } = req.body;
  
  // Validate input
  if (!username || typeof username !== "string") {
    return res.status(400).json({ error: "Invalid username" });
  }
  
  if (typeof exp !== "number" || exp < 0) {
    return res.status(400).json({ error: "Invalid exp" });
  }
  
  if (typeof level !== "number" || level < 0) {
    return res.status(400).json({ error: "Invalid level" });
  }
  
  if (typeof time !== "number" || time < 0) {
    return res.status(400).json({ error: "Invalid time" });
  }
  
  try {
    const leaderboard = await loadLeaderboard();
    
    // Find existing user (case insensitive)
    const existing = leaderboard.find(
      u => u.username.toLowerCase() === username.toLowerCase()
    );
    
    if (existing) {
      // Update existing user - only update if new values are higher
      existing.exp = Math.max(existing.exp, exp);
      existing.level = Math.max(existing.level, level);
      existing.time = Math.max(existing.time, time);
      existing.lastUpdated = new Date().toISOString();
    } else {
      // Add new user
      leaderboard.push({
        username: username,
        exp: exp,
        level: level,
        time: time,
        joinedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });
    }
    
    await saveLeaderboard(leaderboard);
    res.json({ success: true, message: "Score updated successfully" });
    
  } catch (error) {
    console.error("Error updating score:", error);
    res.status(500).json({ error: "Failed to update score" });
  }
});

// Delete user (optional endpoint for cleanup)
app.delete("/user/:username", async (req, res) => {
  try {
    const leaderboard = await loadLeaderboard();
    const filtered = leaderboard.filter(
      u => u.username.toLowerCase() !== req.params.username.toLowerCase()
    );
    
    if (filtered.length === leaderboard.length) {
      return res.status(404).json({ error: "User not found" });
    }
    
    await saveLeaderboard(filtered);
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend listening on port ${PORT}`);
});
