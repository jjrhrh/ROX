export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { title, ep } = req.query;
  if (!title) return res.status(400).json({ error: 'title required' });

  // ← slug محسّن: يحذف كلمات زائدة شائعة تسبب عدم تطابق
  const slug = title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/^(the|a|an)-/, '');   // ← جديد

  const epNum  = ep || 1;
  const epId   = `${slug}-episode-${epNum}`;
  const epIdTV = `${slug}-tv-episode-${epNum}`;  // ← بعض الأنمي يستخدم -tv

  console.log(`[stream] جلب: ${epId}`);

  // ← APIs محدثة مع بدائل موثوقة
  const APIs = [
    // Aniwatch API (الأكثر استقراراً حالياً)
    `https://aniwatch-api-one-tau.vercel.app/anime/episode-srcs?id=${encodeURIComponent(epId)}&server=vidstreaming&category=sub`,

    // Consumet نسخ مستضافة مجتمعياً
    `https://consumet.jjrhrh.vercel.app/anime/gogoanime/watch/${encodeURIComponent(epId)}`,
    `https://consumet-one-rust.vercel.app/anime/gogoanime/watch/${encodeURIComponent(epId)}`,

    // نفس الروابط مع -tv fallback
    `https://consumet.jjrhrh.vercel.app/anime/gogoanime/watch/${encodeURIComponent(epIdTV)}`,
    `https://consumet-one-rust.vercel.app/anime/gogoanime/watch/${encodeURIComponent(epIdTV)}`,
  ];

  for (const url of APIs) {
    try {
      console.log(`[stream] جرب: ${url}`);
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });

      if (!r.ok) {
        console.log(`[stream] فشل HTTP ${r.status}: ${url}`);
        continue;
      }

      const d = await r.json();

      // Aniwatch يُرجع { sources: [...] } أو { link: '...' }
      const sources = d.sources || (d.link ? [{ url: d.link, isM3U8: true, quality: 'auto' }] : []);

      if (sources.length) {
        console.log(`[stream] ✅ نجح: ${url} — ${sources.length} مصدر`);
        return res.status(200).json({ sources });
      }

    } catch (err) {
      console.log(`[stream] خطأ في ${url}:`, err.message);
    }
  }

  console.log(`[stream] ❌ فشلت جميع المصادر للـ slug: ${slug}`);
  return res.status(404).json({ error: 'no sources found', slug, epId });
}
