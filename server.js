const apiURL = "https://leaderboardbackend-7cum.onrender.com";

async function getLeaderboard() {
  const res = await fetch(`${apiURL}/scores`);
  const data = await res.json();
  return data;
}

async function submitScore(username, exp, time) {
  await fetch(`${apiURL}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, exp, time })
  });
}

// Then use these in your HTML script like before to render the leaderboard
