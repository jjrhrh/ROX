/* ═══════════════════════════════════════════
   السيرفرات
═══════════════════════════════════════════ */
const SERVERS = [
  { id:'gogo-sub',   label:'GogoAnime SUB',  icon:'🟢', type:'consumet', lang:'مترجم',       dub:false },
  { id:'gogo-dub',   label:'GogoAnime DUB',  icon:'🟣', type:'consumet', lang:'مدبلج',       dub:true  },
  { id:'pahe-sub',   label:'AnimePahe SUB',  icon:'⚡', type:'pahe',     lang:'مترجم مباشر', dub:false },
  { id:'anime4up',   label:'Anime4up AR',    icon:'🎬', type:'iframe',   lang:'🇸🇦 عربي',
    buildUrl:(slug,ep)=>`https://anime4up.cam/episode/${slug}-${ep}/` },
  { id:'witanime',   label:'WitAnime AR',    icon:'🧡', type:'iframe',   lang:'🇸🇦 عربي',
    buildUrl:(slug,ep)=>`https://witanime.cyou/episode/${slug}-${ep}/` },
  { id:'anime3rb',   label:'Anime3rb AR',    icon:'🌙', type:'iframe',   lang:'🇸🇦 عربي',
    buildUrl:(slug,ep)=>`https://anime3rb.com/episodes/${slug}-${ep}` },
  { id:'shahiid',    label:'Shahiid AR',     icon:'👑', type:'iframe',   lang:'🇸🇦 مدبلج',
    buildUrl:(slug,ep)=>`https://shahiid-anime.net/episode/${slug}-episode-${ep}/` },
  { id:'anislayer',  label:'AnimeSlayer AR', icon:'⚔️', type:'iframe',   lang:'🇸🇦 عربي',
    buildUrl:(slug,ep)=>`https://www.animeslayer.com/episode/${slug}-episode-${ep}/` },
  { id:'risto',      label:'Ristoanime AR',  icon:'🟥', type:'iframe',   lang:'🇸🇦 عربي',
    buildUrl:(slug,ep)=>`https://ristoanime.co/episode/${slug}-episode-${ep}/` },
  { id:'aniwatch',   label:'AniWatch',       icon:'🟦', type:'iframe',   lang:'مترجم',
    buildUrl:(slug,ep)=>`https://aniwatch.to/watch/${slug}?ep=${ep}` },
  { id:'animeowl',   label:'AnimeOwl',       icon:'🦉', type:'iframe',   lang:'مترجم',
    buildUrl:(slug,ep)=>`https://animeowl.me/anime/${slug}/episode-${ep}/` },
  { id:'aniwave',    label:'AniWave',        icon:'🌊', type:'iframe',   lang:'مترجم',
    buildUrl:(slug,ep)=>`https://aniwave.to/watch/${slug}/ep-${ep}` },
  { id:'anix',       label:'Anix',           icon:'🔵', type:'iframe',   lang:'مترجم',
    buildUrl:(slug,ep)=>`https://anix.to/watch/${slug}?ep=${ep}` },
  { id:'anime-sama', label:'Anime-Sama FR',  icon:'🇫🇷', type:'iframe',  lang:'فرنسي',
    buildUrl:(slug,ep)=>`https://anime-sama.fr/catalogue/${slug}/ep${ep}/vostfr.html` },
];

/* ═══════════════════════════════════════════
   Consumet APIs — fallbacks مرتبة
═══════════════════════════════════════════ */
const CONSUMET_APIS = [
  'https://cinema-rox.vercel.app/api/stream',
  'https://api.consumet.org/anime/gogoanime',
];
const PAHE_APIS = [
  'https://api.consumet.org/anime/animepahe',
  'https://consumet-api.onrender.com/anime/animepahe',
];
let activeCONSUMET = CONSUMET_APIS[0];

/* ═══════════════════════════════════════════
   STATE
═══════════════════════════════════════════ */
let currentAnime   = null;
let currentSlug    = '';
let currentEp      = 1;
let currentServer  = SERVERS[0];
let currentQuality = 'auto';
let allSlugs       = [];
let gogoId         = null;
let paheId         = null;

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
async function initPlayer() {
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) return;
  try {
    const data = await aniQuery(`
      query($id:Int) {
        Media(id:$id, type:ANIME) {
          id idMal
          title { romaji english native }
          synonyms
          coverImage { large }
          averageScore episodes status genres
          description(asHtml:false)
          startDate { year }
          studios(isMain:true) { nodes { name } }
        }
      }`, { id: parseInt(id) });

    currentAnime = data.Media;
    allSlugs     = buildAllSlugs(currentAnime);
    currentSlug  = allSlugs[0];

    renderAnimeInfo();
    renderEpisodes();
    renderServers();

    await prefetchGogoId();

  } catch(e) {
    document.getElementById('animeCardBig').innerHTML =
      '<div style="padding:20px;color:var(--muted)">خطأ في تحميل البيانات</div>';
  }
}

/* ═══════════════════════════════════════════
   بناء كل الـ slugs المحتملة
═══════════════════════════════════════════ */
function makeSlug(t) {
  return (t||'').toLowerCase()
    .replace(/[^a-z0-9\s-]/g,'').trim()
    .replace(/\s+/g,'-');
}

function buildAllSlugs(a) {
  const titles = [
    a.title.english,
    a.title.romaji,
    ...(a.synonyms||[]).filter(s=>/^[a-zA-Z]/.test(s))
  ].filter(Boolean);

  const result = [];
  titles.forEach(t => {
    const s = makeSlug(t);
    if (!s) return;
    result.push(s);
    result.push(s.replace(/^(the|a|an)-/,''));
    result.push(s + '-tv');
    result.push(s + '-season-1');
    result.push(s.replace(/-season-\d+$/,''));
    result.push(s.replace(/-\d+$/,''));
  });
  return [...new Set(result)].filter(Boolean);
}

/* ═══════════════════════════════════════════
   Consumet — بحث مسبق (SUB أولاً + AnimePahe كـ fallback)
═══════════════════════════════════════════ */
async function prefetchGogoId() {
  const titles = [
    currentAnime.title.english,
    currentAnime.title.romaji,
  ].filter(Boolean);

  // GogoAnime — يفضّل SUB
  for (const api of CONSUMET_APIS) {
    for (const q of titles) {
      try {
        const r = await fetch(`${api}/${encodeURIComponent(q)}`);
        const d = await r.json();
        const hit = (d.results||[]).find(x => !x.id.includes('-dub'))
                 || (d.results||[])[0];
        if (hit) {
          gogoId = hit.id;
          activeCONSUMET = api;
          console.log('✅ GogoAnime ID:', gogoId, 'via', api);
          return;
        }
      } catch {}
    }
  }

  // AnimePahe — fallback
  for (const api of PAHE_APIS) {
    for (const q of titles) {
      try {
        const r = await fetch(`${api}/${encodeURIComponent(q)}`);
        const d = await r.json();
        if ((d.results||[]).length) {
          paheId = d.results[0].id;
          console.log('✅ AnimePahe ID:', paheId);
          return;
        }
      } catch {}
    }
  }
}

/* ═══════════════════════════════════════════
   تحميل السيرفر
═══════════════════════════════════════════ */
async function loadServer(srv) {
  const wrap = document.getElementById('videoWrap');
  wrap.innerHTML = `<div class="video-placeholder">
    <div class="loading"><div class="spinner"></div> جاري البحث عن الحلقة ${currentEp}...</div>
  </div>`;

  try {
    if (srv.type === 'consumet') {
      await loadConsumetSmart(srv);
    } else if (srv.type === 'pahe') {
      await loadPaheSmart();
    } else {
      await loadIframeSmart(srv, 0);
    }
  } catch(e) {
    wrap.innerHTML = `<div class="video-placeholder">
      <p>⚠️ فشل التحميل</p>
      <p style="font-size:.7rem;opacity:.5">${e.message}</p>
    </div>`;
  }
}

/* ─── Consumet الذكي (GogoAnime) ─── */
async function loadConsumetSmart(srv) {
  const wrap = document.getElementById('videoWrap');
  if (!gogoId && !paheId) await prefetchGogoId();
  if (!gogoId) throw new Error('لم يتم العثور على الأنمي في GogoAnime');

  const epSlug = srv.dub ? `${gogoId}-dub` : gogoId;
  const epId   = `${epSlug}-episode-${currentEp}`;

  for (const api of CONSUMET_APIS) {
    try {
      const r = await fetch(`${api}/watch/${encodeURIComponent(epId)}`);
      const d = await r.json();
      const sources = d.sources || [];
      if (sources.length) { injectStream(sources, srv.label, wrap); return; }
    } catch {}
  }

  throw new Error('لا توجد مصادر في GogoAnime');
}

/* ─── AnimePahe الذكي ─── */
async function loadPaheSmart() {
  const wrap = document.getElementById('videoWrap');
  if (!paheId && !gogoId) await prefetchGogoId();
  if (!paheId) throw new Error('لم يتم العثور على الأنمي في AnimePahe');

  for (const api of PAHE_APIS) {
    try {
      const r = await fetch(`${api}/watch?id=${paheId}&ep=${currentEp}`);
      const d = await r.json();
      const sources = d.sources || [];
      if (sources.length) { injectStream(sources, 'AnimePahe', wrap); return; }
    } catch {}
  }

  throw new Error('لا توجد مصادر في AnimePahe');
}

/* ─── حقن الفيديو في المشغّل ─── */
function injectStream(sources, label, wrap) {
  const chosen = sources.find(s => s.quality === currentQuality)
               || sources.find(s => s.quality === '1080p')
               || sources.find(s => s.quality === 'default')
               || sources[0];

  wrap.innerHTML = `<div class="src-info">✅ ${label} · ح${currentEp} · ${chosen.quality||'auto'}</div>`;
  chosen.isM3U8 ? playHLS(chosen.url, wrap) : playMP4(chosen.url, wrap);
}

/* ─── iframe الذكي مع retry ─── */
async function loadIframeSmart(srv, slugIdx) {
  const wrap    = document.getElementById('videoWrap');
  const slug    = allSlugs[slugIdx] || allSlugs[0];
  const url     = srv.buildUrl(slug, currentEp);
  const hasNext = slugIdx + 1 < allSlugs.length;

  wrap.innerHTML = `
    <iframe src="${url}" allowfullscreen
      allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
      referrerpolicy="no-referrer" loading="lazy">
    </iframe>
    <div class="slug-retry">
      <span>🔗 ${slug} · ح${currentEp}</span>
      ${hasNext
        ? `<button onclick="loadIframeSmart(SERVERS.find(s=>s.id==='${srv.id}'),${slugIdx+1})">🔄 اسم آخر (${slugIdx+1}/${allSlugs.length})</button>`
        : '<span style="opacity:.4">آخر اسم متاح</span>'}
    </div>`;
}

/* ═══════════════════════════════════════════
   SERVER BUTTONS
═══════════════════════════════════════════ */
function selectServer(id, btn) {
  document.querySelectorAll('.srv-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  currentServer = SERVERS.find(s=>s.id===id);
  loadServer(currentServer);
}

function renderServers() {
  document.getElementById('serverBtns').innerHTML =
    SERVERS.map((s,i)=>`
      <button class="srv-btn ${i===0?'active':''}" onclick="selectServer('${s.id}',this)">
        <span class="srv-dot"></span>
        ${s.icon} ${s.label}
        <small style="opacity:.6;font-size:.65rem">${s.lang}</small>
      </button>`).join('');
}

/* ═══════════════════════════════════════════
   EPISODES
═══════════════════════════════════════════ */
function renderEpisodes() {
  const total = currentAnime.episodes || 12;
  const count = Math.min(total, 120);
  let html = '';
  for (let i=1; i<=count; i++) {
    html += `<div class="ep-num ${i===1?'active':''}" onclick="selectEp(${i},this)">${i}</div>`;
  }
  if (total > 120) {
    html += `<div class="ep-num" style="opacity:.5;border-style:dashed"
               onclick="alert('${total-120}+ حلقة — تصفّح من موقع المصدر')">
               +${total-120}</div>`;
  }
  document.getElementById('epsGrid').innerHTML = html;
}

function selectEp(n, el) {
  currentEp = n;
  document.querySelectorAll('.ep-num').forEach(e=>e.classList.remove('active'));
  el.classList.add('active');
  loadServer(currentServer);
}

/* ═══════════════════════════════════════════
   ANIME INFO
═══════════════════════════════════════════ */
function renderAnimeInfo() {
  const a     = currentAnime;
  const title = a.title.english || a.title.romaji;
  const score = a.averageScore ? (a.averageScore/10).toFixed(1) : '—';
  const studio= a.studios?.nodes?.[0]?.name || '';
  const desc  = (a.description||'').replace(/<[^>]+>/g,'').slice(0,200)+'...';

  document.getElementById('animeCardBig').innerHTML = `
    <div class="acb-top">
      <img class="acb-poster" src="${a.coverImage?.large||''}" alt="${title}"
           onerror="this.style.display='none'"/>
      <div>
        <div class="acb-title">${title}</div>
        <div class="acb-meta">
          ${studio}<br>
          ${a.startDate?.year||''} · ★ ${score}<br>
          ${a.episodes||'?'} حلقة · ${translateStatus(a.status)}
        </div>
      </div>
    </div>
    <div class="acb-desc">${desc}</div>`;
  document.title = `${title} — アニメ·KO`;
}

function translateStatus(s) {
  return {FINISHED:'مكتمل',RELEASING:'مستمر',NOT_YET_RELEASED:'قريباً'}[s]||s;
}

/* ═══════════════════════════════════════════
   HLS / MP4
═══════════════════════════════════════════ */
function playHLS(url, wrap) {
  const v = document.createElement('video');
  v.controls = v.autoplay = true;
  v.style.cssText = 'width:100%;height:100%;background:#000';
  wrap.appendChild(v);
  if (typeof Hls!=='undefined' && Hls.isSupported()) {
    const hls = new Hls({ enableWorker:true, lowLatencyMode:true });
hls.loadSource(url);
hls.attachMedia(v);
hls.on(Hls.Events.ERROR, (_, d) => {
  if (d.fatal) {
    proxyIndex++;
    const nextProxy = M3U8_PROXIES[proxyIndex];
    if (nextProxy && rawUrl) {
      hls.destroy();
      playHLS(nextProxy + encodeURIComponent(rawUrl), rawUrl, wrap);
    } else {
      wrap.innerHTML = '<div class="video-placeholder"><p>⚠️ فشلت جميع الـ Proxies</p></div>';
    }
  }
});
  } else if (v.canPlayType('application/vnd.apple.mpegurl')) {
    v.src = url;
  }
}

function playMP4(url, wrap) {
  wrap.innerHTML = `<video controls autoplay style="width:100%;height:100%;background:#000">
    <source src="${url}" type="video/mp4"/>
  </video>`;
}

/* ═══════════════════════════════════════════
   QUALITY
═══════════════════════════════════════════ */
function setQuality(q, btn) {
  currentQuality = q;
  document.querySelectorAll('.qbtn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  if (currentServer) loadServer(currentServer);
}

/* ═══════════════════════════════════════════
   CUSTOM URL
═══════════════════════════════════════════ */
function loadCustomUrl() {
  const url  = document.getElementById('customUrl')?.value?.trim();
  const wrap = document.getElementById('videoWrap');
  if (!url||!wrap) return;
  if (url.includes('.m3u8')) playHLS(url, wrap);
  else if (url.includes('.mp4')||url.includes('.webm')) playMP4(url, wrap);
  else wrap.innerHTML = `<iframe src="${url}" allowfullscreen
    allow="autoplay; fullscreen"
    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    referrerpolicy="no-referrer"></iframe>`;
}

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', initPlayer);
