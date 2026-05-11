/* ═══════════════════════════════════════════
   ANILIST API
═══════════════════════════════════════════ */
const ANILIST_URL = 'https://graphql.anilist.co';

async function aniQuery(query, variables = {}) {
  const res = await fetch(ANILIST_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ query, variables })
  });
  const json = await res.json();
  return json.data;
}

const ANIME_QUERY = `
query($page:Int, $perPage:Int, $sort:[MediaSort], $genre:String) {
  Page(page:$page, perPage:$perPage) {
    media(type:ANIME, sort:$sort, genre:$genre, isAdult:false) {
      id
      title { romaji english }
      coverImage { large }
      averageScore
      episodes
      status
      genres
      startDate { year }
    }
  }
}`;

async function loadSection(gridId, sort, genre = null) {
  const vars = { page: 1, perPage: 12, sort: [sort] };
  if (genre) vars.genre = genre;
  const data = await aniQuery(ANIME_QUERY, vars);
  renderGrid(gridId, data.Page.media);
}

/* ═══════════════════════════════════════════
   RENDER CARDS
═══════════════════════════════════════════ */
function renderGrid(gridId, items) {
  const grid = document.getElementById(gridId);
  if (!items || !items.length) {
    grid.innerHTML = '<div class="loading">لا توجد نتائج</div>';
    return;
  }
  grid.innerHTML = items.map(cardHTML).join('');
}

function cardHTML(a) {
  const title = a.title.english || a.title.romaji;
  const score = a.averageScore ? (a.averageScore / 10).toFixed(1) : '—';
  const eps   = a.episodes ? a.episodes + ' حلقة' : (a.status === 'RELEASING' ? 'مستمر' : '—');
  const img   = a.coverImage?.large || '';
  const badge = a.status === 'RELEASING'
    ? '<div class="card-badge badge-cont">مستمر</div>'
    : a.averageScore >= 85
      ? '<div class="card-badge badge-top">⭐</div>'
      : '';

  return `
    <div class="card" onclick="goPlayer(${a.id})">
      ${badge}
      ${img
        ? `<img class="card-poster" src="${img}" alt="${title}" loading="lazy"
              onerror="this.outerHTML='<div class=card-poster-ph>${genreEmoji(a.genres)}</div>'"/>`
        : `<div class="card-poster-ph">${genreEmoji(a.genres)}</div>`}
      <div class="card-play">
        <div class="play-circle">▶</div>
        <div class="play-label">شاهد الآن</div>
      </div>
      <div class="card-info">
        <div class="card-title">${title}</div>
        <div class="card-row">
          <div class="card-rat">★ ${score}</div>
          <div class="card-ep">${eps}</div>
        </div>
      </div>
    </div>`;
}

function genreEmoji(g = []) {
  if (g.includes('Action'))  return '⚔️';
  if (g.includes('Romance')) return '🌸';
  if (g.includes('Fantasy')) return '🔮';
  if (g.includes('Horror'))  return '👻';
  if (g.includes('Sports'))  return '⚽';
  if (g.includes('Sci-Fi'))  return '🚀';
  if (g.includes('Comedy'))  return '😄';
  return '🎬';
}

/* ═══════════════════════════════════════════
   NAVIGATE TO PLAYER
═══════════════════════════════════════════ */
function goPlayer(id) {
  window.location.href = `player.html?id=${id}`;
}

/* ═══════════════════════════════════════════
   HERO SLIDER
═══════════════════════════════════════════ */
let heroIdx = 0;
let heroTimer;
const HERO_IDS = [16498, 20, 101922]; // AoT, One Piece, Demon Slayer

function initDots() {
  const d = document.getElementById('heroDots');
  if (!d) return;
  d.innerHTML = HERO_IDS.map((_, i) =>
    `<div class="hero-dot ${i === 0 ? 'active' : ''}" onclick="goSlide(${i})"></div>`
  ).join('');
}

function goSlide(i) {
  document.querySelectorAll('.hero-slide').forEach((s, idx) =>
    s.classList.toggle('active', idx === i));
  document.querySelectorAll('.hero-dot').forEach((d, idx) =>
    d.classList.toggle('active', idx === i));
  heroIdx = i;
}

function nextSlide() { goSlide((heroIdx + 1) % HERO_IDS.length); }
function prevSlide() { goSlide((heroIdx + HERO_IDS.length - 1) % HERO_IDS.length); }

async function loadHeroBanners() {
  for (let i = 0; i < HERO_IDS.length; i++) {
    try {
      const data = await aniQuery(`
        query($id:Int) {
          Media(id:$id) {
            title { romaji }
            bannerImage
            coverImage { extraLarge }
            genres
            startDate { year }
          }
        }`, { id: HERO_IDS[i] });

      const m = data.Media;
      const bg = document.getElementById(`heroBg${i}`);
      if (bg) bg.src = m.bannerImage || m.coverImage?.extraLarge || '';

      const t = document.getElementById(`heroT${i}`);
      if (t) t.textContent = m.title.romaji;

      const mt = document.getElementById(`heroM${i}`);
      if (mt) mt.textContent =
        (m.genres || []).slice(0, 2).join(' · ') + ' · ' + (m.startDate?.year || '');
    } catch (e) {
      console.warn('Hero banner failed:', e);
    }
  }
}

/* ═══════════════════════════════════════════
   FILTER BY GENRE
═══════════════════════════════════════════ */
async function filterGenre(genre, btn) {
  document.querySelectorAll('.filt').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const grid = document.getElementById('trendingGrid');
  grid.innerHTML = '<div class="loading"><div class="spinner"></div> جاري التحميل...</div>';

  if (genre === 'all') {
    await loadSection('trendingGrid', 'TRENDING_DESC');
  } else {
    await loadSection('trendingGrid', 'TRENDING_DESC', genre);
  }
}

/* ═══════════════════════════════════════════
   SEARCH
═══════════════════════════════════════════ */
let searchTimer;

async function liveSearch(q) {
  clearTimeout(searchTimer);
  const box = document.getElementById('searchResults');
  if (!box) return;
  if (!q || q.length < 2) { box.style.display = 'none'; return; }

  searchTimer = setTimeout(async () => {
    box.style.display = 'block';
    box.innerHTML = '<div class="loading"><div class="spinner"></div> يبحث...</div>';

    const data = await aniQuery(`
      query($q:String) {
        Page(perPage:6) {
          media(search:$q, type:ANIME, isAdult:false) {
            id
            title { romaji english }
            coverImage { medium }
            averageScore
            genres
          }
        }
      }`, { q });

    const items = data.Page.media;
    if (!items.length) {
      box.innerHTML = '<div class="loading">لا توجد نتائج</div>';
      return;
    }

    box.innerHTML = items.map(a => `
      <div class="sr-item" onclick="goPlayer(${a.id}); this.closest('#searchResults').style.display='none'">
        ${a.coverImage?.medium
          ? `<img class="sr-img" src="${a.coverImage.medium}" alt=""/>`
          : `<div class="sr-img">${genreEmoji(a.genres)}</div>`}
        <div>
          <div class="sr-name">${a.title.english || a.title.romaji}</div>
          <div class="sr-meta">
            ★ ${a.averageScore ? (a.averageScore / 10).toFixed(1) : '—'} ·
            ${(a.genres || []).slice(0, 2).join(', ')}
          </div>
        </div>
      </div>`).join('');
  }, 400);
}

function triggerSearch() {
  const input = document.getElementById('navSearch');
  if (input) liveSearch(input.value);
}

// Close search on outside click
document.addEventListener('click', e => {
  const box = document.getElementById('searchResults');
  if (box && !e.target.closest('.nav-search') && !e.target.closest('#searchResults')) {
    box.style.display = 'none';
  }
});

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
async function init() {
  initDots();
  heroTimer = setInterval(nextSlide, 5000);

  // Load banners + all grids in parallel
  await Promise.all([
    loadHeroBanners(),
    loadSection('trendingGrid', 'TRENDING_DESC'),
    loadSection('topGrid',      'SCORE_DESC'),
    loadSection('newGrid',      'START_DATE_DESC'),
  ]);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
