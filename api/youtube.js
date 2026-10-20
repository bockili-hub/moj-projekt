// Vercel serverless function: /api/youtube
// Needs the environment variable YT_KEY (your YouTube Data API v3 key).
module.exports = async (req, res) => {
  const { q, pageToken, feed } = req.query;
  const query =
    feed === "default" || !q ? "trending music for driving" : String(q).slice(0, 200);

  const params = new URLSearchParams({
    part: "snippet",
    type: "video",
    videoEmbeddable: "true",
    maxResults: "20",
    q: query,
    key: process.env.YT_KEY || "",
  });
  if (pageToken) params.set("pageToken", String(pageToken).slice(0, 100));

  try {
    const r = await fetch("https://www.googleapis.com/youtube/v3/search?" + params);
    const data = await r.json();
    // Cache for 5 minutes to save your daily quota.
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    res.status(r.status).json(data);
  } catch (e) {
    res.status(502).json({ error: { message: "YouTube could not be reached." } });
  }
};
