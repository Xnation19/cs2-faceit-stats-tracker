document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("search-btn");
  const nicknameInput = document.getElementById("username-input");
  const themeToggle = document.getElementById("theme-toggle");

  if (searchBtn) {
    searchBtn.addEventListener("click", () => handleSearch(nicknameInput));
  }

  if (nicknameInput) {
    nicknameInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleSearch(nicknameInput);
    });
  }

  // --- Theme toggle ---
  if (themeToggle) {
    // Restore saved theme on load
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      document.documentElement.setAttribute("data-theme", savedTheme);
      updateThemeButton(savedTheme);
    }

    themeToggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
      updateThemeButton(next);
    });
  }

  // Auto-load default player on first visit (optional nicety)
  if (nicknameInput && nicknameInput.value.trim()) {
    handleSearch(nicknameInput);
  }
});

function updateThemeButton(theme) {
  const themeToggle = document.getElementById("theme-toggle");
  if (!themeToggle) return;
  themeToggle.textContent = theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode";
}

function handleSearch(inputElement) {
  const nickname = inputElement ? inputElement.value.trim() : "";
  if (nickname) {
    fetchPlayerStats(nickname);
  }
}

async function fetchPlayerStats(nickname) {
  setLoadingState(true);
  hideError();

  try {
    const response = await fetch(`/api/player?nickname=${encodeURIComponent(nickname)}`);
    const data = await response.json();

    if (!response.ok) {
      showError(data.error || "Player not found!");
      return;
    }

    const profile = data.profile || data;
    const stats = data.stats || null;

    if (!profile || typeof profile !== "object") {
      showError("Invalid player data received.");
      return;
    }

    renderPlayerUI(profile, stats);
  } catch (error) {
    console.error("Fetch Error:", error);
    showError("Network error — check your connection and try again.");
  } finally {
    setLoadingState(false);
  }
}

// Toggles the search button between its idle and "in flight" appearance.
// isLoading is a boolean, so this same function handles both directions.
function setLoadingState(isLoading) {
  const searchBtn = document.getElementById("search-btn");
  if (!searchBtn) return;

  if (isLoading) {
    // Save the original label so we can restore it exactly, rather than
    // hardcoding "FETCH STATS" a second time somewhere else.
    searchBtn.dataset.originalText = searchBtn.textContent;
    searchBtn.disabled = true;
    searchBtn.innerHTML = `<span class="spinner"></span> Searching...`;
  } else {
    searchBtn.disabled = false;
    searchBtn.textContent = searchBtn.dataset.originalText || "FETCH STATS";
  }
}

function showError(message) {
  const banner = document.getElementById("error-banner");
  if (!banner) return;
  banner.textContent = message;
  banner.classList.remove("hidden");
}

function hideError() {
  const banner = document.getElementById("error-banner");
  if (!banner) return;
  banner.classList.add("hidden");
}

function renderPlayerUI(profile, stats) {
  const cs2 = profile?.games?.cs2 || profile?.games?.csgo;

  // DOM elements — matching the actual IDs in index.html
  const avatarEl = document.getElementById("player-avatar");
  const nameEl = document.getElementById("player-nickname");
  const countryEl = document.getElementById("player-country");
  const levelBadgeEl = document.getElementById("player-level-badge");
  const eloEl = document.getElementById("stat-elo");
  const matchesEl = document.getElementById("stat-matches");
  const kdEl = document.getElementById("stat-kd");
  const hsEl = document.getElementById("stat-hs");

  if (avatarEl) avatarEl.src = profile?.avatar || "https://via.placeholder.com/150";
  if (nameEl) nameEl.textContent = profile?.nickname || "Unknown Player";
  if (countryEl) countryEl.textContent = (profile?.country || "EU").toUpperCase();

  if (cs2) {
    if (levelBadgeEl) levelBadgeEl.textContent = `Level ${cs2.skill_level ?? "--"}`;
    if (eloEl) eloEl.textContent = cs2.faceit_elo ?? "N/A";
  } else {
    if (levelBadgeEl) levelBadgeEl.textContent = "Level --";
    if (eloEl) eloEl.textContent = "No CS2 Data";
  }

  // Lifetime stats
  if (stats && stats.lifetime) {
    const lifetime = stats.lifetime;

    if (kdEl) kdEl.textContent = lifetime["Average K/D Ratio"] || "N/A";
    if (matchesEl) matchesEl.textContent = lifetime["Matches"] || "0";
    if (hsEl) hsEl.textContent = `${lifetime["Average Headshots %"] || 0}%`;
  } else {
    if (kdEl) kdEl.textContent = "N/A";
    if (matchesEl) matchesEl.textContent = "0";
    if (hsEl) hsEl.textContent = "N/A";
  }
}