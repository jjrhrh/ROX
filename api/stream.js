export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { title, ep, scrape, mode } = req.query;
  /* ══ وضع الـ Scrape: جلب رابط M3U8 من صفحة iframe ══ */
  if (scrape) {
  return await scrapeVideoUrl(scrape, res);
}

if (mode === 'servers') {
  const servers = await fetchAllServers(title, String(ep || 1));
  return res.status(200).json({ servers });
}
  if (!title) return res.status(400).json({ error: 'title required' });

  const epNum = String(ep || 1);
  console.log(`[stream] جلب: ${title} — حلقة ${epNum}`);

  const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0',
    'Referer':    'https://allmanga.to/',
  };

  let showId = null;
  try {
    const body = JSON.stringify({
      query: `query($search:SearchInput,$limit:Int,$page:Int,$translationType:VaildTranslationTypeEnumType){
        shows(search:$search,limit:$limit,page:$page,translationType:$translationType){
          edges{ _id name englishName }
        }
      }`,
      variables: {
        search: { allowAdult: false, query: title },
        limit: 5, page: 1, translationType: 'sub',
      },
    });
    const sr  = await fetch('https://api.allanime.day/api', {
      method: 'POST',
      headers: { ...HEADERS, 'Content-Type': 'application/json' },
      body, signal: AbortSignal.timeout(10000),
    });
    const sd  = await sr.json();
    const hit = (sd?.data?.shows?.edges || [])[0];
    if (hit) { showId = hit._id; }
  } catch(e) { console.log('[stream] فشل البحث:', e.message); }

  if (!showId) return res.status(404).json({ error: 'anime not found', title });

  try {
    const body = JSON.stringify({
      query: `query($showId:String!,$translationType:VaildTranslationTypeEnumType!,$episodeString:String!){
        episode(showId:$showId,translationType:$translationType,episodeString:$episodeString){
          episodeString
          sourceUrls{ sourceUrl sourceName priority type }
        }
      }`,
      variables: { showId, translationType: 'sub', episodeString: epNum },
    });
    const er = await fetch('https://api.allanime.day/api', {
      method: 'POST',
      headers: { ...HEADERS, 'Content-Type': 'application/json' },
      body, signal: AbortSignal.timeout(10000),
    });
    const ed         = await er.json();
    const rawSources = ed?.data?.episode?.sourceUrls || [];

    if (!rawSources.length) return res.status(404).json({ error: 'no sources', showId });

    const sources = rawSources
      .map(s => ({
        url:      decodeAaUrl(s.sourceUrl),
        quality:  s.priority >= 10 ? '1080p' : s.priority >= 5 ? '720p' : 'auto',
        isM3U8:   s.sourceUrl?.includes('.m3u8') || false,
        priority: s.priority || 0,
        name:     s.sourceName || '',
      }))
      .filter(s => s.url?.startsWith('http'))
      .sort((a, b) => b.priority - a.priority);

    return res.status(200).json({ sources, showId });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}

/* ══ Scrape رابط الفيديو من صفحة الموقع ══ */
async function scrapeVideoUrl(pageUrl, res) {
  try {
    console.log('[scrape] جلب:', pageUrl);

    const r = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(pageUrl)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 Chrome/124.0' },
      signal: AbortSignal.timeout(12000),
    });

    const html = await r.text();

    // ابحث عن M3U8
    const m3u8Match = html.match(/https?:\/\/[^\s"']+\.m3u8[^\s"']*/);
    if (m3u8Match) {
      console.log('[scrape] ✅ M3U8:', m3u8Match[0]);
      return res.status(200).json({ url: m3u8Match[0], type: 'hls' });
    }

    // ابحث عن MP4
    const mp4Match = html.match(/https?:\/\/[^\s"']+\.mp4[^\s"']*/);
    if (mp4Match) {
      console.log('[scrape] ✅ MP4:', mp4Match[0]);
      return res.status(200).json({ url: mp4Match[0], type: 'mp4' });
    }

    // ابحث عن <video src=
    const videoSrc = html.match(/<video[^>]+src=["']([^"']+)["']/i);
    if (videoSrc) {
      return res.status(200).json({ url: videoSrc[1], type: 'mp4' });
    }

    // ابحث عن jwplayer أو player setup
    const jwMatch = html.match(/file["']?\s*:\s*["']([^"']+\.m3u8[^"']*)/);
    if (jwMatch) {
      return res.status(200).json({ url: jwMatch[1], type: 'hls' });
    }

    console.log('[scrape] ❌ لم يُعثر على رابط فيديو');
    return res.status(404).json({ error: 'no video found in page' });

  } catch(e) {
    console.log('[scrape] خطأ:', e.message);
    return res.status(500).json({ error: e.message });
  }
}

function rot13(str) {
  return str.replace(/[a-zA-Z]/g, c => {
    const b = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - b + 13) % 26) + b);
  });
}
function decodeAaUrl(url = '') {
  if (url.startsWith('--')) return rot13(url.slice(2));
  return url;
}
