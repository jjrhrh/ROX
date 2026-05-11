// /lib/allanime.js

const PROXY = '/api/allanime';

/* ─── بحث عن أنمي ─── */
export async function searchAllAnime(query, translationType = 'sub') {
  const res = await fetch(PROXY, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ action: 'search', payload: { q: query, translationType } }),
  });
  if (!res.ok) throw new Error('فشل البحث');
  return res.json(); // مصفوفة [ { _id, name, englishName, thumbnail, ... } ]
}

/* ─── الدالة الرئيسية: اسم + رقم حلقة ─── */
export async function getStreamUrl(animeName, epNumber, translationType = 'sub') {
  // الخطوة 1: ابحث عن الأنمي لتحصل على showId
  const results = await searchAllAnime(animeName, translationType);
  if (!results.length) throw new Error(`لم يُعثر على: ${animeName}`);

  const show   = results[0]; // أفضل نتيجة
  const showId = show._id;

  // الخطوة 2: جلب سورسات الحلقة
  const res = await fetch(PROXY, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      action:  'episode',
      payload: { showId, ep: epNumber, translationType },
    }),
  });

  if (!res.ok) throw new Error('فشل جلب الحلقة');
  const sources = await res.json();

  // الخطوة 3: اختر أفضل سورس
  return pickBestSource(sources, show);
}

/* ─── اختيار أفضل رابط متاح ─── */
function pickBestSource(sources, show) {
  // أولوية: M3U8 مباشر > Embed معروف > أي شيء
  const m3u8   = sources.find(s => s.sourceUrl?.includes('.m3u8'));
  const mp4    = sources.find(s => s.sourceUrl?.includes('.mp4'));
  const embed  = sources.find(s => s.type === 'iframe' || s.sourceUrl?.startsWith('http'));
  const chosen = m3u8 || mp4 || embed || sources[0];

  return {
    showId:   show._id,
    title:    show.englishName || show.name,
    thumb:    show.thumbnail,
    episodes: show.episodeCount,
    url:      chosen?.sourceUrl || null,
    type:     m3u8 ? 'hls' : mp4 ? 'mp4' : 'iframe',
    allSources: sources,
  };
                                   }
