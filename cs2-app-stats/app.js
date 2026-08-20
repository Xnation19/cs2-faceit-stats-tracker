document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("search-btn") || document.querySelector("button");
  const nicknameInput = document.getElementById("nickname-input") || document.querySelector("input");

  if (searchBtn) {
    searchBtn.addEventListener("click", () => handleSearch(nicknameInput));
  }

  if (nicknameInput) {
    nicknameInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleSearch(nicknameInput);
    });
  }
});

function handleSearch(inputElement) {
  const nickname = inputElement ? inputElement.value.trim() : "";
  if (nickname) {
    fetchPlayerStats(nickname);
  }
}

async function fetchPlayerStats(nickname) {
  try {
    const response = await fetch(`/api/player?nickname=${encodeURIComponent(nickname)}`);
    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Player not found!");
      return;
    }

    // Extract profile safely regardless of backend wrapper structure
    const profile = data.profile || data;
    const stats = data.stats || null;

    if (!profile || typeof profile !== "object") {
      alert("Invalid player data received.");
      return;
    }

    renderPlayerUI(profile, stats);
  } catch (error) {
    console.error("Fetch Error:", error);
    alert(`Error: ${error.message}`);
  }
}

function renderPlayerUI(profile, stats) {
  // Use optional chaining so missing properties never crash the UI
  const cs2 = profile?.games?.cs2 || profile?.games?.csgo;

  // DOM Elements
  const avatarEl = document.getElementById("player-avatar") || document.querySelector(".avatar img");
  const nameEl = document.getElementById("player-name") || document.querySelector(".player-name");
  const levelEl = document.getElementById("player-level") || document.querySelector(".level");
  const eloEl = document.getElementById("player-elo") || document.querySelector(".elo");

  if (avatarEl) avatarEl.src = profile?.avatar || "https://via.placeholder.com/150";
  if (nameEl) nameEl.textContent = profile?.nickname || "Unknown Player";

  if (cs2) {
    if (levelEl) levelEl.textContent = `Level ${cs2.skill_level || "--"}`;
    if (eloEl) eloEl.textContent = `${cs2.faceit_elo || "N/A"} ELO`;
  } else {
    if (levelEl) levelEl.textContent = "Level --";
    if (eloEl) eloEl.textContent = "No CS2 Data";
  }

  // Lifetime Stats
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