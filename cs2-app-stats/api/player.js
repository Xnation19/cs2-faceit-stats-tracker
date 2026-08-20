export default async function handler(req, res) {
  const { nickname } = req.query;

  if (!nickname) {
    return res.status(400).json({ error: "Nickname is required" });
  }

  const apiKey = process.env.FACEIT_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API key is missing on Vercel" });
  }

  try {
    // 1. Fetch Player Details
    const playerRes = await fetch(
      `https://open.faceit.com/data/v4/players?nickname=${encodeURIComponent(nickname)}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          accept: "application/json",
        },
      }
    );

    if (!playerRes.ok) {
      return res.status(playerRes.status).json({ error: "Player not found!" });
    }

    const playerData = await playerRes.parse ? await playerRes.parse() : await playerRes.json();

    // 2. Fetch CS2 Stats using player_id
    const statsRes = await fetch(
      `https://open.faceit.com/data/v4/players/${playerData.player_id}/stats/cs2`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          accept: "application/json",
        },
      }
    );

    const statsData = statsRes.ok ? await statsRes.json() : null;

    return res.status(200).json({
      profile: playerData,
      stats: statsData,
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error fetching data" });
  }
}