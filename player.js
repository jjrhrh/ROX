/* ═══════════════════════════════════════════
   السيرفرات — كل واحد له طريقة تضمين مختلفة
═══════════════════════════════════════════ */

/*
  كيف تشتغل السيرفرات؟
  ────────────────────
  1. مواقع زي GogoAnime و9anime لديها مشغّل خاص
     يمكن تضمينه مباشرة عبر iframe.
  2. بعض المواقع تتيح رابط embed مباشر.
  3. السيرفرات الـ CDN تعطي روابط mp4/m3u8 مباشرة.
  
  الفكرة الأساسية:
  ─────────────────
  كل سيرفر له دالة buildUrl(slug, ep)
  تبني رابط الـ iframe أو الفيديو المباشر.
  عند الضغط على السيرفر → تستدعي الدالة → تحمّل الرابط.
*/

const SERVERS = [
  // ─── سيرفرات iframe (يفتح مشغّل داخل الصفحة) ───
  {
    id:    'gogo-sub',
    label: 'GogoAnime SUB',
    icon:  '🟢',
    type:  'iframe',
    lang:  'مترجم',
    // يبني رابط مشغّل gogoanime المضمّن
    buildUrl: (slug, ep) =>
      `https://gogoanime3.co/${slug}-episode-${ep}`
  },
  {
    id:    'gogo-dub',
    label: 'GogoAnime DUB',
    icon:  '🟣',
    type:  'iframe',
    lang:  'مدبلج',
    buildUrl: (slug, ep) =>
      `https://gogoanime3.co/${slug}-dub-episode-${ep}`
  },
  {
    id:    'anix',
    label: 'Anix',
    icon:  '🔵',
    type:  'iframe',
    lang:  'مترجم',
    buildUrl: (slug, ep) =>
      `https://anix.to/watch/${slug}?ep=${ep}`
  },
  {
    id:    'aniwave',
    label: 'AniWave',
    icon:  '🌊',
    type:  'iframe',
    lang:  'مترجم',
    buildUrl: (slug, ep) =>
      `https://aniwave.to/watch/${slug}/ep-${ep}`
  },
  {
    id:    'anime4up',
    label: 'Anime4up AR',
    icon:  '🎬',
    type:  'iframe',
    lang:  '🇸🇦 عربي',
    buildUrl: (slug, ep) =>
      `https://anime4up.cam/episode/${slug}-${ep}/`
  },
  {
    id:    'risto',
    label: 'Ristoanime AR',
    icon:  '🟥',
    type:  'iframe',
    lang:  '🇸🇦 عربي',
    buildUrl: (slug, ep) =>
      `https://ristoanime.co/episode/${slug}-episode-${ep}/`
  },
  {
    id:    'witanime',
    label: 'WitAnime AR',
    icon:  '🧡',
    type:  'iframe',
    lang:  '🇸🇦 عربي',
    buildUrl: (slug, ep) =>
      `https://witanime.cyou/episode/${slug}-${ep}/`
  },
  {
    id:    'anime-sama',
    label: 'Anime-Sama FR',
    icon:  '🇫🇷',
    type:  'iframe',
    lang:  'فرنسي',
    buildUrl: (slug, ep) =>
      `https://anime-sama.fr/catalogue/${slug}/ep${ep}/vostfr.html`
  },

  // ─── سيرفرات مباشرة (Consumet API) ───
  /*
    Consumet هو API مفتوح يجلب روابط
    الفيديو المباشرة من GogoAnime وغيره.
    
    تثبيته على سيرفرك:
    git clone https://github.com/consumet/api.consumet.org
    npm install && npm start
    
    أو استخدم النسخة العامة (قد تكون بطيئة):
    https://api.consumet.org
  */
  {
    id:    'consumet-sub',
    label: 'Direct SUB',
    icon:  '⚡',
    type:  'consumet',
    lang:  'مترجم مباشر',
    // baseUrl: تغيّره لسيرفرك الخاص
    buildUrl: (slug, ep) =>
      `https://api.consumet.org/anime/gogoanime/watch/${slug}-episode-${ep}`
  },
  {
    id:    'consumet-dub',
    label: 'Direct DUB',
    icon:  '⚡',
    type:  'consumet',
    lang:  'مدبلج مباشر',
    buildUrl: (slug, ep) =>
      `https://api.consumet.org/anime/gogoanime/watch/${slug}-dub-episode-${ep}`
  },
];

/* ═══════════════════════════════════════════
   STATE
═══════════════════════════════════════════ */
let currentAnime  = null;
let currentSlug   = '';
let currentEp     = 1;
let currentServer = SERVERS[0];
let currentQuality = 'auto';

/* ═══════════════════════════════════════════
   INIT PLAYER PAGE
═══════════════════════════════════════════ */
async function initPlayer() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) {
    document.getElementById('animeCardBig').innerHTML =
      '<div style="color:var(--muted);padding:20px;">لم يتم تحديد أنمي</div>';
    return;
  }

  // Fetch anime data from AniList
  try {
    const data = await aniQuery(`
      query($id:Int) {
        Media(id:$id, type:ANIME) {
          id
          title { romaji english }
          coverImage { large }
          averageScore
          episodes
          status
          genres
          description(asHtml:false)
          startDate { year }
          studios(isMain:true) { nodes { name } }
          streamingEpisodes { title url site }
          externalLinks { url site type }
        }
      }`, { id: parseInt(id) });

    currentAnime = data.Media;

    // Build slug for server URLs
    currentSlug = buildSlug(
      currentAnime.title.english || currentAnime.title.romaji
    );

    renderAnimeInfo();
    renderEpisodes();
    renderServers();

  } catch (e) {
    console.error(e);
    document.getElementById('animeCardBig').innerHTML =
      '<div style="color:var(--muted);padding:20px;">خطأ في تحميل البيانات</div>';
  }
}

/* بناء الـ slug من العنوان */
function buildSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/* ═══════════════════════════════════════════
   RENDER ANIME INFO
═══════════════════════════════════════════ */
function renderAnimeInfo() {
  const a = currentAnime;
  const title  = a.title.english || a.title.romaji;
  const img    = a.coverImage?.large || '';
  const score  = a.averageScore ? (a.averageScore / 10).toFixed(1) : '—';
  const studio = a.studios?.nodes?.[0]?.name || '';
  const desc   = (a.description || '').replace(/<[^>]+>/g, '').slice(0, 200) + '...';

  document.getElementById('animeCardBig').innerHTML = `
    <div class="acb-top">
      ${img
        ? `<img class="acb-poster" src="${img}" alt="${title}"/>`
        : `<div class="acb-poster">${genreEmoji(a.genres)}</div>`}
      <div>
        <div class="acb-title">${title}</div>
        <div class="acb-meta">
          ${studio}<br>
          ${a.startDate?.year || ''} · ★ ${score}<br>
          ${a.episodes || '?'} حلقة · ${translateStatus(a.status)}
        </div>
      </div>
    </div>
    <div class="acb-desc">${desc}</div>`;

  // Page title
  document.title = `${title} — アニメ·KO`;
}

function translateStatus(s) {
  return { FINISHED:'مكتمل', RELEASING:'مستمر', NOT_YET_RELEASED:'قريباً' }[s] || s;
}

/* ═══════════════════════════════════════════
   RENDER EPISODES
═══════════════════════════════════════════ */
function renderEpisodes() {
  const total = currentAnime.episodes || 12;
  const grid  = document.getElementById('epsGrid');

  // AniList streaming episodes (Crunchyroll etc.)
  const crEps = (currentAnime.streamingEpisodes || []).slice(0, 5);

  let html = '';

  // Show numbers
  const count = Math.min(total, 120);
  for (let i = 1; i <= count; i++) {
    html += `<div class="ep-num ${i === 1 ? 'active' : ''}"
               onclick="selectEp(${i}, this)">${i}</div>`;
  }
  if (total > 120) {
    html += `<div class="ep-num" style="border-style:dashed;opacity:.5"
               onclick="alert('تصفّح من موقع المصدر لمشاهدة بقية الحلقات')">
               +${total - 120}
             </div>`;
  }

  grid.innerHTML = html;
}

function selectEp(n, el) {
  currentEp = n;
  document.querySelectorAll('.ep-num').forEach(e => e.classList.remove('active'));
  el.classList.add('active');
  // Reload current server with new episode
  loadServer(currentServer);
}

/* ═══════════════════════════════════════════
   RENDER SERVER BUTTONS
═══════════════════════════════════════════ */
function renderServers() {
  const container = document.getElementById('serverBtns');
  container.innerHTML = SERVERS.map((srv, i) => `
    <button class="srv-btn ${i === 0 ? 'active' : ''}"
            onclick="selectServer('${srv.id}', this)">
      <span class="srv-dot"></span>
      ${srv.icon} ${srv.label}
      <small style="opacity:.6;font-size:.65rem">${srv.lang}</small>
    </button>`).join('');
}

/* ═══════════════════════════════════════════
   SELECT SERVER + LOAD
═══════════════════════════════════════════ */
function selectServer(serverId, btn) {
  // Update active button
  document.querySelectorAll('.srv-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // Find server config
  currentServer = SERVERS.find(s => s.id === serverId);
  loadServer(currentServer);
}

async function loadServer(srv) {
  const wrap = document.getElementById('videoWrap');

  // Show loading
  wrap.innerHTML = `
    <div class="video-placeholder">
      <div class="loading"><div class="spinner"></div> جاري تحميل ${srv.label}...</div>
    </div>`;

  try {
    if (srv.type === 'iframe') {
      await loadIframe(srv);
    } else if (srv.type === 'consumet') {
      await loadConsumet(srv);
    }
  } catch (e) {
    wrap.innerHTML = `
      <div class="video-placeholder">
        <p>⚠️ فشل التحميل — جرّب سيرفراً آخر</p>
        <p style="font-size:.7rem;margin-top:4px;opacity:.5">${e.message}</p>
      </div>`;
  }
}

/* ─── iframe loader ─── */
async function loadIframe(srv) {
  const wrap = document.getElementById('videoWrap');
  const url  = srv.buildUrl(currentSlug, currentEp);

  wrap.innerHTML = `
    <iframe
      src="${url}"
      allowfullscreen
      allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
      referrerpolicy="no-referrer"
      loading="lazy">
    </iframe>`;
}

/* ─── Consumet API loader (رابط مباشر) ─── */
async function loadConsumet(srv) {
  const wrap = document.getElementById('videoWrap');
  const apiUrl = srv.buildUrl(currentSlug, currentEp);

  const res  = await fetch(apiUrl);
  const data = await res.json();

  /* بنية Consumet:
     data.sources = [
       { url: "https://...", quality: "1080p", isM3U8: true },
       { url: "https://...", quality: "720p",  isM3U8: true },
       ...
     ]
  */
  const sources = data.sources || [];
  if (!sources.length) throw new Error('لا توجد مصادر');

  // اختر الجودة
  let chosen = sources.find(s => s.quality === currentQuality)
            || sources.find(s => s.quality === '1080p')
            || sources.find(s => s.quality === 'default')
            || sources[0];

  if (chosen.isM3U8) {
    playHLS(chosen.url, wrap);
  } else {
    playMP4(chosen.url, wrap);
  }
}

/* ─── HLS Player ─── */
function playHLS(url, wrap) {
  const videoEl = document.createElement('video');
  videoEl.controls = true;
  videoEl.autoplay = true;
  videoEl.style.cssText = 'width:100%;height:100%;background:#000;';
  wrap.innerHTML = '';
  wrap.appendChild(videoEl);

  if (typeof Hls !== 'undefined' && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
    });
    hls.loadSource(url);
    hls.attachMedia(videoEl);
    hls.on(Hls.Events.ERROR, (_, d) => {
      if (d.fatal) {
        wrap.innerHTML = '<div class="video-placeholder"><p>⚠️ فشل تحميل الفيديو</p></div>';
      }
    });
  } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
    // Safari
    videoEl.src = url;
  }
}

/* ─── MP4 Player ─── */
function playMP4(url, wrap) {
  wrap.innerHTML = `
    <video controls autoplay style="width:100%;height:100%;background:#000;">
      <source src="${url}" type="video/mp4"/>
      متصفحك لا يدعم تشغيل الفيديو.
    </video>`;
}

/* ═══════════════════════════════════════════
   QUALITY SELECTOR
═══════════════════════════════════════════ */
function setQuality(q, btn) {
  currentQuality = q;
  document.querySelectorAll('.qbtn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  // Reload current server with new quality
  if (currentServer) loadServer(currentServer);
}

/* ═══════════════════════════════════════════
   CUSTOM URL (يدوي)
═══════════════════════════════════════════ */
function loadCustomUrl() {
  const url  = document.getElementById('customUrl')?.value?.trim();
  const wrap = document.getElementById('videoWrap');
  if (!url || !wrap) return;

  if (url.includes('.m3u8')) {
    playHLS(url, wrap);
  } else if (url.includes('.mp4') || url.includes('.webm')) {
    playMP4(url, wrap);
  } else {
    // Treat as iframe
    wrap.innerHTML = `
      <iframe
        src="${url}"
        allowfullscreen
        allow="autoplay; fullscreen"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        referrerpolicy="no-referrer">
      </iframe>`;
  }
}

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', initPlayer);
