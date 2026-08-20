export default async function handler(req, res) {
  const { nickname } = req.query;

  if (!nickname) {
    return res.status(400).json({ error: "Nickname is required" });
  }

  // Clean the API key of any accidental whitespace or quotes
  const apiKey = (process.env.FACEIT_API_KEY || "").replace(/['"\s]/g, "");

  if (!apiKey) {
    return res.status(500).json({ error: "FACEIT_API_KEY is missing in Vercel settings" });
  }

  try {
    // 1. Fetch Player Profile Details
    let playerRes = await fetch(
      `https://open.faceit.com/data/v4/players?nickname=${encodeURIComponent(nickname)}`,
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    // Fallback auth header if standard Bearer token is rejected
    if (playerRes.status === 400 || playerRes.status === 401) {
      playerRes = await fetch(
        `https://open.faceit.com/data/v4/players?nickname=${encodeURIComponent(nickname)}`,
        {
          headers: {
            accept: "application/json",
            Authorization: `Key ${apiKey}`,
          },
        }
      );
    }

    const playerData = await playerRes.json();

    if (!playerRes.ok) {
      return res.status(playerRes.status).json({
        error: playerData.message || `Player '${nickname}' not found.`,
      });
    }

    // 2. Fetch CS2 Lifetime Stats using player_id
    let statsData = null;
    if (playerData.player_id) {
      const statsRes = await fetch(
        `https://open.faceit.com/data/v4/players/${playerData.player_id}/stats/cs2`,
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );
      if (statsRes.ok) {
        statsData = await statsRes.json();
      }
    }

    return res.status(200).json({
      profile: playerData,
      stats: statsData,
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal Server Error fetching player data" });
  }
}