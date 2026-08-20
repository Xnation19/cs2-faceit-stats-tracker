document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("search-btn") || document.querySelector("button");
  const nicknameInput = document.getElementById("nickname-input") || document.querySelector("input");

  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      const nickname = nicknameInput.value.trim();
      if (nickname) {
        fetchPlayerStats(nickname);
      }
    });
  }

  if (nicknameInput) {
    nicknameInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const nickname = nicknameInput.value.trim();
        if (nickname) {
          fetchPlayerStats(nickname);
        }
      }
    });
  }
});

async function fetchPlayerStats(nickname) {
  try {
    // Relative API call with leading slash and question mark
    const response = await fetch(`/api/player?nickname=${encodeURIComponent(nickname)}`);
    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Player not found!");
      return;
    }

    renderPlayerUI(data.profile, data.stats);
  } catch (error) {
    console.error("Fetch Error:", error);
    alert("Error fetching player stats. Check console for details.");
  }
}

function renderPlayerUI(profile, stats) {
  if (!profile) return;

  // Safely extract game data using optional chaining
  const cs2 = profile.games?.cs2 || profile.games?.csgo;

  // Update Profile Elements Safely
  const avatarEl = document.getElementById("player-avatar") || document.querySelector(".avatar img");
  const nameEl = document.getElementById("player-name") || document.querySelector(".player-name");
  const levelEl = document.getElementById("player-level") || document.querySelector(".level");
  const eloEl = document.getElementById("player-elo") || document.querySelector(".elo");

  if (avatarEl) avatarEl.src = profile.avatar || "https://via.placeholder.com/150";
  if (nameEl) nameEl.textContent = profile.nickname || "Unknown Player";

  if (cs2) {
    if (levelEl) levelEl.textContent = `Level ${cs2.skill_level || "--"}`;
    if (eloEl) eloEl.textContent = `${cs2.faceit_elo || "N/A"} ELO`;
  } else {
    if (levelEl) levelEl.textContent = "Level --";
    if (eloEl) eloEl.textContent = "No CS2 Data";
  }

  // Update Stats Elements Safely
  if (stats && stats.lifetime) {
    const lifetime = stats.lifetime;
    
    const kdEl = document.getElementById("kd-ratio");
    const winRateEl = document.getElementById("win-rate");
    const matchesEl = document.getElementById("matches");

    if (kdEl) kdEl.textContent = lifetime["Average K/D Ratio"] || "N/A";
    if (winRateEl) winRateEl.textContent = `${lifetime["Win Rate %"] || 0}%`;
    if (matchesEl) matchesEl.textContent = lifetime["Matches"] || "0";
  }
}