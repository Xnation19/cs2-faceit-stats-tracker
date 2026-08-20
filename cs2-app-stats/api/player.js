export default async function handler(req, res) {
  const { nickname } = req.query;

  if (!nickname) {
    return res.status(400).json({ error: "Nickname is required" });
  }

  // Strip accidental quotes, spaces, or line breaks from key
  const apiKey = (process.env.FACEIT_API_KEY || "").replace(/['"\s]/g, "");

  if (!apiKey) {
    return res.status(500).json({ error: "FACEIT_API_KEY is missing in Vercel settings" });
  }

  try {
    // Attempt standard Authorization header
    let response = await fetch(
      `https://open.faceit.com/data/v4/players?nickname=${encodeURIComponent(nickname)}`,
      {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    // If 400/401, retry using alternative key header
    if (response.status === 400 || response.status === 401) {
      response = await fetch(
        `https://open.faceit.com/data/v4/players?nickname=${encodeURIComponent(nickname)}`,
        {
          headers: {
            'accept': 'application/json',
            'Authorization': `Key ${apiKey}`
          }
        }
      );
    }

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || `FACEIT API Error ${response.status}`,
        details: data
      });
    }

    return res.status(200).json({ profile: data, stats: null });
  } catch (err) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}