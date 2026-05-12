// /lib/allanime.js

// ─── CORS Proxies للـ M3U8 (مرتبة حسب الأفضلية) ───
const M3U8_PROXIES = [
  'https://m3u8-proxy.vercel.app/proxy?url=',
  'https://cors-anywhere.herokuapp.com/',
  'https://api.allorigins.win/raw?url=',
];

const AA_PROXY = '/api/allanime'; // Next.js Route Handler

/* ════════════════════════════════
   بناء رابط M3U8 عبر Proxy
════════════════════════════════ */
export function buildProxiedM3U8(rawUrl, proxyIndex = 0) {
  const proxy = M3U8_PROXIES[proxyIndex] ?? M3U8_PROXIES[0];
  return proxy + encodeURIComponent(rawUrl);
}

/* ════════════════════════════════
   البحث عن أنمي
════════════════════════════════ */
export async function searchAllAnime(query, translationType = 'sub') {
  const res = await fetch(AA_PROXY, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      action:  'search',
      payload: { q: query, translationType },
    }),
  });
  if (!res.ok) throw new Error('فشل البحث في AllAnime');
  return res.json();
}

/* ════════════════════════════════
   الدالة الرئيسية:
   اسم الأنمي + رقم الحلقة
   → أفضل رابط متاح
════════════════════════════════ */
export async function getStreamUrl(animeName, epNumber, translationType = 'sub') {
  // 1. ابحث للحصول على showId
  const results = await searchAllAnime(animeName, translationType);
  if (!results.length) throw new Error(`لم يُعثر على: ${animeName}`);

  const show   = results[0];
  const showId = show._id;

  // 2. جلب سورسات الحلقة
  const res = await fetch(AA_PROXY, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      action:  'episode',
      payload: { showId, ep: epNumber, translationType },
    }),
  });

  if (!res.ok) throw new Error('فشل جلب سورسات الحلقة');
  const sources = await res.json();

  if (!sources.length) throw new Error('لا توجد مصادر متاحة');

  // 3. اختر أفضل سورس
  return resolveSource(sources, show);
}

/* ════════════════════════════════
   اختيار + تجهيز أفضل سورس
════════════════════════════════ */
async function resolveSource(sources, show) {
  // أولوية: M3U8 > MP4 > iframe
  const m3u8  = sources.find(s => s.sourceUrl?.includes('.m3u8'));
  const mp4   = sources.find(s => s.sourceUrl?.includes('.mp4'));
  const embed = sources.find(s => s.sourceUrl?.startsWith('http'));
  const best  = m3u8 || mp4 || embed || sources[0];

  if (!best?.sourceUrl) {
    throw new Error('لا يوجد رابط صالح في السورسات');
  }

  let finalUrl  = best.sourceUrl;
  let videoType = 'iframe';

  if (m3u8) {
    // ← الجديد: مرّر M3U8 عبر Proxy تلقائياً
    finalUrl  = buildProxiedM3U8(best.sourceUrl);
    videoType = 'hls';
  } else if (mp4) {
    finalUrl  = best.sourceUrl;
    videoType = 'mp4';
  }

  return {
    showId:     show._id,
    title:      show.englishName || show.name,
    thumb:      show.thumbnail,
    totalEps:   show.episodeCount || 0,
    url:        finalUrl,
    rawUrl:     best.sourceUrl,   // الرابط الأصلي قبل الـ Proxy
    type:       videoType,
    allSources: sources,          // كل السورسات للتبديل اليدوي
  };
}

/* ════════════════════════════════
   إعادة المحاولة بـ Proxy مختلف
   (استدعيها عند فشل HLS)
════════════════════════════════ */
export function retryWithNextProxy(rawUrl, currentProxyIndex) {
  const nextIndex = currentProxyIndex + 1;
  if (nextIndex >= M3U8_PROXIES.length) {
    throw new Error('فشلت جميع الـ Proxies المتاحة');
  }
  return {
    url:        buildProxiedM3U8(rawUrl, nextIndex),
    proxyIndex: nextIndex,
  };
}
