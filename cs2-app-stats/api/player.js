export default async function handler(req, res) {
  const { nickname } = req.query;

  if (!nickname) {
    return res.status(400).json({ error: "Nickname is required" });
  }

  // Retrieve environment variable
  const apiKey = process.env.FACEIT_API_KEY ? process.env.FACEIT_API_KEY.trim() : null;

  if (!apiKey) {
    return res.status(500).json({ error: "FACEIT_API_KEY is missing in Vercel settings" });
  }

  try {
    // 1. Fetch Player Profile
    const playerRes = await fetch(
      `https://open.faceit.com/data/v4/players?nickname=${encodeURIComponent(nickname)}`,
      {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    if (!playerRes.ok) {
      const errText = await playerRes.text();
      console.error(`FACEIT Profile Error (${playerRes.status}):`, errText);
      return res.status(playerRes.status).json({ error: `Player '${nickname}' not found.` });
    }

    const playerData = await playerRes.json();

    // 2. Fetch CS2 Stats
    const statsRes = await fetch(
      `https://open.faceit.com/data/v4/players/${playerData.player_id}/stats/cs2`,
      {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    const statsData = statsRes.ok ? await statsRes.json() : null;

    return res.status(200).json({
      profile: playerData,
      stats: statsData
    });
  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}