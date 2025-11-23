const leaderboardEl = document.getElementById("leaderboard");
const usernameInput = document.getElementById("usernameInput");
const submitBtn = document.getElementById("submitBtn");
const submitMsg = document.getElementById("submitMsg");
const filterInput = document.getElementById("filterInput");

const expTab = document.getElementById("expTab");
const timeTab = document.getElementById("timeTab");

let currentTab = "exp";

// Helpers
function niceNum(n){ return n.toLocaleString(); }
function niceTime(t){ return (t || 0) + "s"; }

// Fetch leaderboard from backend
async function fetchLeaderboard() {
  try {
    const res = await fetch("https://leaderboardbackend-7cum.onrender.com/leaderboard");
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    return [];
  }
}

// Submit score to backend
async function submitScore() {
  const username = usernameInput.value.trim();
  if (!username || username.length < 3 || username.length > 20) {
    submitMsg.innerText = "Username must be 3–20 characters.";
    return;
  }

  const exp = parseInt(localStorage.getItem("exp") || "0");
  const time = parseInt(localStorage.getItem("time") || "0");

  if (exp <= 0 && time <= 0) {
    submitMsg.innerText = "You must earn EXP or TIME before submitting.";
    return;
  }

  try {
    const res = await fetch("https://leaderboardbackend-7cum.onrender.com/submit", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ username, exp, time })
    });
    const data = await res.json();
    if (data.success) {
      submitMsg.innerText = `Saved! EXP: ${niceNum(exp)}, Time: ${niceTime(time)}`;
      renderLeaderboard(); // refresh immediately
    } else {
      submitMsg.innerText = "Error submitting score.";
    }
  } catch (err) {
    console.error(err);
    submitMsg.innerText = "Failed to submit score.";
  }
}

// Render leaderboard
async function renderLeaderboard() {
  let data = await fetchLeaderboard();
  const filter = (filterInput.value || "").toLowerCase();

  if (filter) data = data.filter(u => u.username.toLowerCase().includes(filter));
  if (currentTab === "exp") data.sort((a,b) => b.exp - a.exp);
  else data.sort((a,b) => b.time - a.time);

  leaderboardEl.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const div = document.createElement("div");
    if (i < data.length) {
      const u = data[i];
      div.innerHTML = `<strong>${i+1}. ${u.username}</strong> 
                       <span>${niceNum(u.exp)} EXP • ${niceTime(u.time)}</span>`;
    } else {
      div.innerHTML = `<strong>${i+1}. ---</strong> <span>0 EXP • 0s</span>`;
    }
    leaderboardEl.appendChild(div);
  }
}

// Event listeners
submitBtn.addEventListener("click", submitScore);
filterInput.addEventListener("input", () => setTimeout(renderLeaderboard, 200));

expTab.onclick = () => {
  currentTab = "exp";
  expTab.classList.add("active");
  timeTab.classList.remove("active");
  renderLeaderboard();
};
timeTab.onclick = () => {
  currentTab = "time";
  timeTab.classList.add("active");
  expTab.classList.remove("active");
  renderLeaderboard();
};

// Auto-refresh every 5s
setInterval(renderLeaderboard, 5000);

// Initial render
renderLeaderboard();
