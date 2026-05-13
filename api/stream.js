export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { title, ep, scrape } = req.query;

  if (scrape) return scrapeVideoUrl(scrape, res);
  if (!title)  return res.status(400).json({ error: 'title required' });

  const epNum = String(ep || 1);
  console.log(`[stream] ${title} — ح${epNum}`);

  // جمع السيرفرات من كل المصادر بالتوازي
  const [aaServers, aniwatchServers, arabicServers] = await Promise.allSettled([
    fetchAllAnime(title, epNum),
    fetchAniwatch(title, epNum),
    fetchArabicScrape(title, epNum),
  ]);

  const servers = [
    ...(aaServers.value       || []),
    ...(aniwatchServers.value || []),
    ...(arabicServers.value   || []),
  ].filter(s => s?.url);

  console.log(`[stream] ✅ إجمالي: ${servers.length} سيرفر`);

  if (!servers.length)
    return res.status(404).json({ error: 'no sources found', title });

  return res.status(200).json({ sources: servers, servers });
}

/* ════════════════════════════════
   1. AllAnime API
════════════════════════════════ */
async function fetchAllAnime(title, epNum) {
  const servers = [];
  const H = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0',
    'Referer':    'https://allmanga.to/',
    'Content-Type': 'application/json',
  };

  // بحث
  const sr = await fetch('https://api.allanime.day/api', {
    method: 'POST', headers: H,
    body: JSON.stringify({
      query: `query($s:SearchInput,$l:Int,$p:Int,$t:VaildTranslationTypeEnumType){
        shows(search:$s,limit:$l,page:$p,translationType:$t){
          edges{ _id name englishName }
        }
      }`,
      variables: { s:{ allowAdult:false, query:title }, l:5, p:1, t:'sub' },
    }),
    signal: AbortSignal.timeout(9000),
  });
  const sd     = await sr.json();
  const showId = (sd?.data?.shows?.edges||[])[0]?._id;
  if (!showId) return servers;

  // جلب سورسات SUB
  for (const lang of ['sub','dub']) {
    try {
      const er = await fetch('https://api.allanime.day/api', {
        method: 'POST', headers: H,
        body: JSON.stringify({
          query: `query($id:String!,$t:VaildTranslationTypeEnumType!,$e:String!){
            episode(showId:$id,translationType:$t,episodeString:$e){
              sourceUrls{ sourceUrl sourceName priority }
            }
          }`,
          variables: { id:showId, t:lang, e:epNum },
        }),
        signal: AbortSignal.timeout(9000),
      });
      const ed = await er.json();
      (ed?.data?.episode?.sourceUrls||[]).forEach(s => {
        const url = decodeAaUrl(s.sourceUrl);
        if (!url?.startsWith('http')) return;
        servers.push({
          name:    `AllAnime ${lang.toUpperCase()} · ${s.sourceName||''}`,
          url,
          type:    url.includes('.m3u8') ? 'hls' : 'iframe',
          quality: s.priority >= 10 ? '1080p' : s.priority >= 5 ? '720p' : 'auto',
          lang,
        });
      });
    } catch(e) { console.log(`[AA] ${lang} فشل:`, e.message); }
  }

  console.log(`[AA] ${servers.length} سيرفر`);
  return servers;
}

/* ════════════════════════════════
   2. Aniwatch (Zoro mirror)
════════════════════════════════ */
async function fetchAniwatch(title, epNum) {
  const servers = [];
  const slug    = title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,'');
  const epId    = `${slug}-episode-${epNum}`;

  const APIS = [
    'https://aniwatch-api-one-tau.vercel.app',
    'https://aniwatch-api-dusky.vercel.app',
  ];

  for (const api of APIS) {
    for (const srv of ['vidstreaming','megacloud','streamsb','vidcloud']) {
      try {
        const r = await fetch(
          `${api}/anime/episode-srcs?id=${encodeURIComponent(epId)}&server=${srv}&category=sub`,
          { signal: AbortSignal.timeout(7000) }
        );
        if (!r.ok) continue;
        const d = await r.json();
        (d.sources||[]).forEach(s => {
          servers.push({
            name:    `Aniwatch · ${srv}`,
            url:     s.url,
            type:    s.isM3U8 ? 'hls' : 'mp4',
            quality: s.quality || 'auto',
            lang:    'sub',
          });
        });
        if (d.sources?.length) break; // نجح — انتقل للسيرفر التالي
      } catch {}
    }
    if (servers.length >= 3) break;
  }

  console.log(`[Aniwatch] ${servers.length} سيرفر`);
  return servers;
}

/* ════════════════════════════════
   3. المواقع العربية عبر Scrape
════════════════════════════════ */
async function fetchArabicScrape(title, epNum) {
  const servers  = [];
  const slug     = title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,'');

  const ARABIC_SITES = [
    { name:'Anime4up',    url:`https://anime4up.cam/episode/${slug}-${epNum}/` },
    { name:'WitAnime',    url:`https://witanime.cyou/episode/${slug}-${epNum}/` },
    { name:'Anime3rb',    url:`https://anime3rb.com/episodes/${slug}-${epNum}` },
    { name:'Shahiid',     url:`https://shahiid-anime.net/episode/${slug}-episode-${epNum}/` },
    { name:'Ristoanime',  url:`https://ristoanime.co/episode/${slug}-episode-${epNum}/` },
    { name:'AnimeSlayer', url:`https://www.animeslayer.com/episode/${slug}-episode-${epNum}/` },
  ];

  // جلب بالتوازي لكل المواقع
  const results = await Promise.allSettled(
    ARABIC_SITES.map(site => scrapeForVideo(site.url, site.name))
  );

  results.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value) {
      servers.push({
        name:    ARABIC_SITES[i].name + ' AR',
        url:     r.value.url,
        type:    r.value.type,
        quality: 'auto',
        lang:    'ar',
      });
    }
  });

  console.log(`[Arabic] ${servers.length} سيرفر`);
  return servers;
}

/* ════════════════════════════════
   Scrape Helper — يجلب HTML ويستخرج رابط
════════════════════════════════ */
const PROXIES = [
  u => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  u => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  u => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
];

async function scrapeForVideo(pageUrl, name) {
  for (const proxy of PROXIES) {
    try {
      const r = await fetch(proxy(pageUrl), {
        headers: { 'User-Agent': 'Mozilla/5.0 Chrome/124.0' },
        signal:  AbortSignal.timeout(10000),
      });
      if (!r.ok) continue;
      const html = await r.text();
      const result = extractVideoUrl(html);
      if (result) {
        console.log(`[scrape] ✅ ${name}: ${result.url.slice(0,60)}`);
        return result;
      }
    } catch(e) {
      console.log(`[scrape] ${name} proxy فشل:`, e.message);
    }
  }
  return null;
}

function extractVideoUrl(html) {
  const patterns = [
    // M3U8 مباشر
    { re: /https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*/,           type: 'hls' },
    // JWPlayer / Video.js file
    { re: /file\s*:\s*["']([^"']+\.m3u8[^"']*)/,             type: 'hls', g: 1 },
    // MP4 مباشر
    { re: /https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]*/,            type: 'mp4' },
    // video src
    { re: /<video[^>]+src=["']([^"']+)["']/i,                 type: 'mp4', g: 1 },
    // src: "..." في الـ JS
    { re: /source\s*:\s*["']([^"']+\.mp4[^"']*)/,            type: 'mp4', g: 1 },
    // iframe embed
    { re: /iframe[^>]+src=["'](https?:\/\/[^"']+)["']/i,     type: 'iframe', g: 1 },
  ];

  for (const p of patterns) {
    const m = html.match(p.re);
    if (m) return { url: p.g ? m[p.g] : m[0], type: p.type };
  }
  return null;
}

/* ════════════════════════════════
   Scrape مخصص (من player.js)
════════════════════════════════ */
async function scrapeVideoUrl(pageUrl, res) {
  const result = await scrapeForVideo(pageUrl, 'custom');
  if (result) return res.status(200).json(result);
  return res.status(404).json({ error: 'no video found' });
}

/* ════════════════════════════════
   Helpers
════════════════════════════════ */
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
