export default async function handler(req, res) {
  const { nickname } = req.query;
  const API_KEY = process.env.FACEIT_API_KEY;

  if (!nickname) {
    return res.status(400).json({ error: "Nickname is required" });
  }

  try {
    const profileRes = await fetch(`https://open.faceit.com/data/v4/players?nickname=${nickname}`, {
      headers: { 'Authorization': `Bearer ${API_KEY}`, 'Accept': 'application/json' }
    });

    if (!profileRes.ok) {
      return res.status(profileRes.status).json({ error: "Player not found!" });
    }

    const profileData = await profileRes.json();
    const playerId = profileData.player_id;

    const statsRes = await fetch(`https://open.faceit.com/data/v4/players/${playerId}/stats/cs2`, {
      headers: { 'Authorization': `Bearer ${API_KEY}`, 'Accept': 'application/json' }
    });

    const statsData = statsRes.ok ? await statsRes.json() : null;

    return res.status(200).json({ profile: profileData, stats: statsData });

  } catch (error) {
    return res.status(500).json({ error: "Server communication error" });
  }
}