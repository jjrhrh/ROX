export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { title, ep } = req.query;
  if (!title) return res.status(400).json({ error: 'title required' });

  const slug = title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-');

  const epId = `${slug}-episode-${ep || 1}`;

  const APIs = [
    `https://api.consumet.org/anime/gogoanime/watch/${encodeURIComponent(epId)}`,
    `https://consumet-api.onrender.com/anime/gogoanime/watch/${encodeURIComponent(epId)}`,
  ];

  for (const url of APIs) {
    try {
      const r = await fetch(url);
      const d = await r.json();
      if ((d.sources || []).length) {
        return res.status(200).json({ sources: d.sources });
      }
    } catch {}
  }

  return res.status(404).json({ error: 'no sources found' });
}
