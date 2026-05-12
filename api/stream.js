export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { title, ep } = req.query;
  if (!title) return res.status(400).json({ error: 'title required' });

  const epNum = ep || 1;
  console.log(`[stream] جلب: ${title} — حلقة ${epNum}`);

  /* ── 1. ابحث في AllAnime عن showId ── */
  let showId = null;
  try {
    const searchVars = {
      search: { allowAdult: false, query: title },
      limit: 5, page: 1, translationType: 'sub',
    };
    const searchQ = `query($search:SearchInput,$limit:Int,$page:Int,$translationType:VaildTranslationTypeEnumType){
      shows(search:$search,limit:$limit,page:$page,translationType:$translationType){
        edges{ _id name englishName }
      }
    }`;
    const sr = await fetch('https://api.allanime.day/api?' + new URLSearchParams({
      variables:  JSON.stringify(searchVars),
      extensions: JSON.stringify({ persistedQuery:{ version:1, sha256Hash: await sha256(searchQ) } }),
    }), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0',
        'Referer':    'https://allmanga.to/',
      },
      signal: AbortSignal.timeout(8000),
    });
    const sd = await sr.json();
    const hit = (sd?.data?.shows?.edges || [])[0];
    if (hit) { showId = hit._id; console.log(`[stream] AllAnime showId: ${showId}`); }
  } catch(e) { console.log('[stream] فشل البحث:', e.message); }

  if (!showId) {
    console.log('[stream] ❌ لم يُعثر على الأنمي');
    return res.status(404).json({ error: 'anime not found', title });
  }

  /* ── 2. جلب سورسات الحلقة ── */
  try {
    const epVars = { showId, translationType: 'sub', episodeString: String(epNum) };
    const epQ = `query($showId:String!,$translationType:VaildTranslationTypeEnumType!,$episodeString:String!){
      episode(showId:$showId,translationType:$translationType,episodeString:$episodeString){
        episodeString sourceUrls
      }
    }`;
    const er = await fetch('https://api.allanime.day/api?' + new URLSearchParams({
      variables:  JSON.stringify(epVars),
      extensions: JSON.stringify({ persistedQuery:{ version:1, sha256Hash: await sha256(epQ) } }),
    }), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0',
        'Referer':    'https://allmanga.to/',
      },
      signal: AbortSignal.timeout(8000),
    });
    const ed = await er.json();
    const rawSources = ed?.data?.episode?.sourceUrls || [];

    if (!rawSources.length) {
      console.log('[stream] ❌ لا سورسات');
      return res.status(404).json({ error: 'no sources', showId });
    }

    // فك تشفير ROT13 + تنظيف
    const sources = rawSources
      .map(s => ({
        url:      decodeAaUrl(s.sourceUrl),
        quality:  s.priority >= 10 ? '1080p' : s.priority >= 5 ? '720p' : 'auto',
        isM3U8:   s.sourceUrl?.includes('.m3u8') || false,
        priority: s.priority || 0,
      }))
      .filter(s => s.url?.startsWith('http'))
      .sort((a, b) => b.priority - a.priority);

    console.log(`[stream] ✅ ${sources.length} مصدر لـ ${title} ح${epNum}`);
    return res.status(200).json({ sources, showId });

  } catch(e) {
    console.log('[stream] ❌ خطأ في جلب الحلقة:', e.message);
    return res.status(500).json({ error: e.message });
  }
}

/* ── ROT13 decoder ── */
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

/* ── SHA256 للـ Persisted Query ── */
async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str.trim()));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
                 }
