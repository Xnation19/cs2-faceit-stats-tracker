document.addEventListener('DOMContentLoaded', () => {
  // 1. Elements
  const themeToggleBtn = document.getElementById('theme-toggle');
  const searchBtn = document.getElementById('search-btn');
  const usernameInput = document.getElementById('username-input');

  const playerAvatar = document.getElementById('player-avatar');
  const playerNickname = document.getElementById('player-nickname');
  const playerCountry = document.getElementById('player-country');
  const playerLevelBadge = document.getElementById('player-level-badge');
  const statElo = document.getElementById('stat-elo');
  const statMatches = document.getElementById('stat-matches');
  const statKd = document.getElementById('stat-kd');
  const statHs = document.getElementById('stat-hs');

  // 2. Theme Toggle Setup
  const htmlElement = document.documentElement;
  const savedTheme = localStorage.getItem('theme') || 'dark';
  
  htmlElement.setAttribute('data-theme', savedTheme);

  if (themeToggleBtn) {
    // Set initial button label based on active theme
    themeToggleBtn.textContent = savedTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';

    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      htmlElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      themeToggleBtn.textContent = newTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
    });
  }

  // 3. Search Listener (Guard clause prevents errors on index2.html)
  if (searchBtn && usernameInput) {
    searchBtn.addEventListener('click', () => {
      const username = usernameInput.value.trim();
      if (!username) return alert("Enter a username!");
      fetchPlayerData(username);
    });
  }

  // 4. Fetch Stats Function
  async function fetchPlayerData(nickname) {
    searchBtn.textContent = "LOADING...";
    searchBtn.disabled = true;

    try {
      let profileData, statsData;
      const isLocalhost = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';

      if (isLocalhost) {
        const API_KEY = "d304ccc8-c283-4520-8881-60c2a25cf7e2";

        const profileRes = await fetch(`https://open.faceit.com/data/v4/players?nickname=${nickname}`, {
          headers: { 'Authorization': `Bearer ${API_KEY}`, 'Accept': 'application/json' }
        });
        if (!profileRes.ok) throw new Error("Player not found!");
        profileData = await profileRes.json();

        const statsRes = await fetch(`https://open.faceit.com/data/v4/players/${profileData.player_id}/stats/cs2`, {
          headers: { 'Authorization': `Bearer ${API_KEY}`, 'Accept': 'application/json' }
        });
        statsData = statsRes.ok ? await statsRes.json() : null;

      } else {
        // Ensure there is a leading slash '/' before api/player
const response = await fetch(`/api/player?nickname=${encodeURIComponent(nickname)}`);
        const data = await response.json();
        if (!response.ok) throw new Error("Player not found!");
        if (!response.ok) {
  alert(data.error || "Player not found!");
  return;
        profileData = data.profile;
        statsData = data.stats;
      } }

      const cs2Data = profileData.games?.cs2;
      if (!cs2Data) return alert("No CS2 profile linked!");

      // Update UI Elements
      playerNickname.textContent = profileData.nickname;
      playerAvatar.src = profileData.avatar || "https://via.placeholder.com/100";
      playerAvatar.alt = `${profileData.nickname}'s avatar`;
      playerCountry.textContent = profileData.country ? profileData.country.toUpperCase() : "N/A";
      playerLevelBadge.textContent = `Level ${cs2Data.skill_level || '-'}`;
      statElo.textContent = cs2Data.faceit_elo ? cs2Data.faceit_elo.toLocaleString() : "N/A";

      if (statsData && statsData.lifetime) {
        const lifetime = statsData.lifetime;
        statMatches.textContent = lifetime['Matches'] || 'N/A';
        statKd.textContent = lifetime['Average K/D Ratio'] || 'N/A';
        
        const hsPercent = lifetime['Average Headshots %'];
        statHs.textContent = hsPercent ? `${hsPercent}%` : 'N/A';
      } else {
        statMatches.textContent = 'N/A';
        statKd.textContent = 'N/A';
        statHs.textContent = 'N/A';
      }

    } catch (error) {
      alert(error.message || "Error fetching data.");
    } finally {
      searchBtn.textContent = "FETCH STATS";
      searchBtn.disabled = false;
    }
  }
});