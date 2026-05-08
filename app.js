// ===== NAVIGATION =====
function bnavGo(tab) {
  const hero = document.getElementById('heroSection');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.bnav-btn').forEach(b => b.classList.remove('active'));

  if (tab === 'browse') { toggleRoxMenu(); return; }

  const pageMap = { home:'homePage', search:'searchPage', library:'libraryPage', profile:'profilePage' };
  const btnMap  = { home:'bnavHome', search:'bnavSearch', library:'bnavLibrary', profile:'bnavProfile' };

  document.getElementById(pageMap[tab])?.classList.add('active');
  document.getElementById(btnMap[tab])?.classList.add('active');
  if (hero) {
  hero.style.display = tab === 'home' ? '' : 'none';
  hero.style.visibility = tab === 'home' ? '' : 'hidden';
}
  if (tab === 'library') loadLibraryPage();
  window.scrollTo(0, 0);
}

function goBack() { bnavGo('home'); }

// ===== ROX MENU =====
let roxOpen = false;
function toggleRoxMenu() {
  roxOpen = !roxOpen;
  document.getElementById('roxMenu')?.classList.toggle('hidden', !roxOpen);
  document.getElementById('roxOverlay')?.classList.toggle('hidden', !roxOpen);
  const btn = document.getElementById('bnavCenter');
  if (btn) btn.style.transform = roxOpen ? 'rotate(45deg) scale(1.1)' : '';
}

// ===== FETCH =====
async function fetchMovies(endpoint = '/movie/popular', options = {}) {
  const {
    page            = 1,
    type            = endpoint.includes('/tv') ? 'tv' : 'movie',
    limit           = CONFIG.DISPLAY.TRENDING_LIMIT || 20,
    requirePoster   = true,
    requireBackdrop = false,
    params          = {},
  } = options;

  const url = buildTMDBUrl(endpoint, {
    page,
    include_adult: String(CONFIG.SEARCH.INCLUDE_ADULT),
    ...params,
  });

  try {
    const ctrl    = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 8000);
    const res     = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`TMDB ${res.status}`);
    const data = await res.json();
    return (data.results || [])
      .filter(i => {
        if (requirePoster   && !i.poster_path)   return false;
        if (requireBackdrop && !i.backdrop_path) return false;
        return true;
      })
      .slice(0, limit)
      .map(i => ({ ...i, media_type: i.media_type || type }));
  } catch (e) {
    console.warn('fetchMovies:', endpoint, e.message);
    return [];
  }
}
// ===== HERO SWIPER =====
let heroSwiper = null;

async function loadHeroSwiper() {
  const wrapper = document.getElementById('heroSwiperWrapper');
  if (!wrapper) return;

  let movies = await fetchMovies('/trending/movie/week', { limit: 5, requirePoster: true });
  if (!movies.length) movies = await fetchMovies('/movie/popular', { limit: 5, requirePoster: true });
  if (!movies.length) return;

  wrapper.innerHTML = movies.map(m => {
    const poster = `${CONFIG.IMAGES.POSTER_MD}${m.poster_path}`;
    return `<div class="swiper-slide hero-swiper-slide" onclick="openDetail(${m.id},'movie')">
      <img src="${poster}" alt="${m.title || m.original_title}"
           onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
    </div>`;
  }).join('');

  heroSwiper = new Swiper('#heroSwiper', {
    effect: 'coverflow',
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 1.5,
    spaceBetween: 20,
    loop: true,
    coverflowEffect: {
      rotate: 50,
      stretch: -100,
      depth: 400,
      modifier: 1,
      slideShadows: false,
    },
    on: {
      init: function() { updateHeroInfo(movies, 0); },
      slideChange: function() { updateHeroInfo(movies, this.realIndex); }
    }
  });
}

function updateHeroInfo(movies, index) {
  const m = movies[index % movies.length];
  if (!m) return;

  const imgUrl = m.backdrop_path
    ? `${CONFIG.IMAGES.BACKDROP}${m.backdrop_path}`
    : `${CONFIG.IMAGES.POSTER_LG}${m.poster_path}`;

  const backdrop = document.getElementById('heroBackdrop');
  if (backdrop) backdrop.style.backgroundImage = `url('${imgUrl}')`;
  document.body.style.backgroundImage = '';
  document.body.style.background = 'var(--bg)';
  const GENRES = {
    28:'أكشن',12:'مغامرة',16:'رسوم متحركة',35:'كوميديا',80:'جريمة',
    99:'وثائقي',18:'دراما',10751:'عائلي',14:'خيال',36:'تاريخي',
    27:'رعب',10402:'موسيقى',9648:'غموض',10749:'رومانسي',
    878:'خيال علمي',53:'إثارة',10752:'حرب'
  };

  const yearEl   = document.getElementById('heroInfoYear');
  const titleEl  = document.getElementById('heroInfoTitle');
  const genresEl = document.getElementById('heroInfoGenres');
  const ratingEl = document.getElementById('heroInfoRating');

  if (yearEl) yearEl.textContent = m.release_date ? m.release_date.slice(0,4) : '';

  if (titleEl) {
    titleEl.style.opacity = '0';
    titleEl.style.transform = 'translateY(12px)';
    setTimeout(() => {
      titleEl.textContent = m.title || m.original_title || '';
      titleEl.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      titleEl.style.opacity = '1';
      titleEl.style.transform = 'translateY(0)';
    }, 200);
  }

  if (genresEl) {
    const names = (m.genre_ids || []).slice(0,3).map(id => GENRES[id]).filter(Boolean);
    genresEl.innerHTML = names.map(n => `<span class="hero-cap">${n}</span>`).join('');
  }
  if (ratingEl) {
    const rating = m.vote_average ? m.vote_average.toFixed(1) : '';
    ratingEl.innerHTML = rating ? `<span class="hero-cap hero-cap-rating">⭐ ${rating}</span>` : '';
  }
}
    function buildMovieCard(movie, type = 'movie') {
  const title  = type === 'movie'
    ? (movie.title || movie.original_title)
    : (movie.name  || movie.original_name);
  const poster = movie.poster_path
    ? `${CONFIG.IMAGES.POSTER_MD}${movie.poster_path}`
    : CONFIG.IMAGES.PLACEHOLDER;
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '';
  const year   = (movie.release_date || movie.first_air_date || '').slice(0,4);
  return `
    <div class="movie-card" onclick="openDetail(${movie.id},'${type}')">
      <div class="movie-poster-wrap">
        <img class="movie-poster" src="${poster}" alt="${title}" loading="lazy"
             onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
        ${year   ? `<span class="movie-year-badge">${year}</span>` : ''}
        ${rating ? `<span class="movie-rating">⭐ ${rating}</span>` : ''}
        <div class="movie-overlay"><span class="play-icon">▶</span></div>
      </div>
      <div class="movie-title-bar">${title.length > 18 ? title.slice(0,18)+'...' : title}</div>
    </div>`;
}

function buildSection(title, movies, type = 'movie') {
  if (!movies.length) return '';
  return `
    <div class="home-section">
      <div class="section-header">
        <span class="section-bar"></span>
        <h2 class="section-title">${title}</h2>
      </div>
      <div class="movies-row">
        ${movies.map(m => buildMovieCard(m, type)).join('')}
      </div>
    </div>`;
}

async function loadHomePage() {
  const page = document.getElementById('homePage');
  if (!page) return;

  const SECTIONS = [
    { id: 'sec_popular',  title: 'الأفلام الرائجة',  endpoint: '/movie/popular',   type: 'movie' },
    { id: 'sec_toprated', title: 'الأعلى تقييماً',   endpoint: '/movie/top_rated', type: 'movie' },
    { id: 'sec_tvseries', title: 'أحدث المسلسلات',   endpoint: '/tv/popular',      type: 'tv'    },
  ];

  // عرض الـ Skeleton فوراً بدون انتظار
  page.innerHTML = SECTIONS.map(s => `
    <div class="home-section" id="${s.id}">
      <div class="section-header">
        <span class="section-bar"></span>
        <h2 class="section-title">${s.title}</h2>
      </div>
      <div class="movies-row" id="${s.id}_row">
        ${Array(6).fill('<div class="movie-card skeleton-card"></div>').join('')}
      </div>
    </div>`).join('');

  // كل قسم يتحمل بشكل مستقل
  SECTIONS.forEach(async s => {
    try {
      const movies = await fetchMovies(s.endpoint, { type: s.type });
      const row = document.getElementById(`${s.id}_row`);
      const container = document.getElementById(s.id);
      if (!row || !container) return;

      if (!movies.length) {
        container.remove();
        return;
      }
      row.innerHTML = movies.map(m => buildMovieCard(m, s.type)).join('');
    } catch (e) {
      const container = document.getElementById(s.id);
      if (container) container.remove();
    }
  });
}
// ===== DETAIL PAGE =====
async function openDetail(id, type = 'movie') {
  const page = document.getElementById('detailPage');
  if (!page) return;

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.bnav-btn').forEach(b => b.classList.remove('active'));
  page.classList.add('active');
  const hero = document.getElementById('heroSection');
  if (hero) hero.style.display = 'none';
  window.scrollTo(0, 0);
  page.innerHTML = '<div class="loading">⏳ جاري تحميل التفاصيل...</div>';

  try {
    const ep = type === 'tv' ? `/tv/${id}` : `/movie/${id}`;
    const [dRes, vRes, cRes] = await Promise.all([
      fetch(buildTMDBUrl(ep)),
      fetch(buildTMDBUrl(`${ep}/videos`)),
      fetch(buildTMDBUrl(`${ep}/credits`)),
    ]);
    const detail  = await dRes.json();
    const videos  = await vRes.json();
    const credits = await cRes.json();

    const trailer = (videos.results || []).find(v => v.type === 'Trailer' && v.site === 'YouTube')
                 || (videos.results || [])[0];

    const backdrop = detail.backdrop_path
      ? `${CONFIG.IMAGES.ORIGINAL}${detail.backdrop_path}`
      : (detail.poster_path ? `${CONFIG.IMAGES.ORIGINAL}${detail.poster_path}` : '');

    const poster  = detail.poster_path
      ? `${CONFIG.IMAGES.POSTER_LG}${detail.poster_path}`
      : CONFIG.IMAGES.PLACEHOLDER;

    const title   = type === 'movie'
      ? (detail.title || detail.original_title)
      : (detail.name  || detail.original_name);
    const year    = (detail.release_date || detail.first_air_date || '').slice(0, 4);
    const rating  = detail.vote_average ? detail.vote_average.toFixed(1) : 'N/A';
    const runtime = detail.runtime
      ? `${detail.runtime} د`
      : (detail.episode_run_time?.[0] ? `${detail.episode_run_time[0]} د` : '');
    const genres  = (detail.genres || []).map(g => `<span class="detail-genre">${g.name}</span>`).join('');
    const overview= detail.overview || 'لا يوجد وصف متاح.';
    const cast    = (credits.cast || []).slice(0, 8);

    const castHTML = cast.length ? `
      <div class="detail-section">
        <h3 class="detail-section-title">🎭 طاقم التمثيل</h3>
        <div class="cast-row">
          ${cast.map(a => `
            <div class="cast-card">
              <img src="${a.profile_path ? CONFIG.IMAGES.POSTER_SM + a.profile_path : CONFIG.IMAGES.PLACEHOLDER}"
                   alt="${a.name}" loading="lazy" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
              <span class="cast-name">${a.name}</span>
              <span class="cast-char">${a.character || ''}</span>
            </div>`).join('')}
        </div>
      </div>` : '';

    const trailerBtn = trailer
      ? `<button class="detail-btn detail-btn-trailer" onclick="playTrailer('${trailer.key}')">▶ المقطع الدعائي</button>`
      : '';

    page.innerHTML = `
      <div class="detail-backdrop" style="background-image:url('${backdrop}')">
        <div class="detail-backdrop-gradient"></div>
        <button class="detail-back-btn" onclick="goBack()">← رجوع</button>
      </div>
      <div class="detail-body">
        <div class="detail-top">
          <img class="detail-poster" src="${poster}" alt="${title}"
               onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
          <div class="detail-info">
            <h1 class="detail-title">${title}</h1>
            <div class="detail-meta">
              ${year    ? `<span class="detail-badge">📅 ${year}</span>`    : ''}
              ${runtime ? `<span class="detail-badge">⏱ ${runtime}</span>` : ''}
              <span class="detail-badge detail-rating">⭐ ${rating}</span>
              <span class="detail-badge">${type === 'tv' ? '📺 مسلسل' : '🎬 فيلم'}</span>
            </div>
            <div class="detail-genres">${genres}</div>
            <div class="detail-actions">
              ${trailerBtn}
              <button class="detail-btn detail-btn-watch" onclick="addToWatchlist(${id},'${type}')">❤️ قائمتي</button>
              <button class="detail-btn detail-btn-later" onclick="addToWatchLater(${id},'${type}')">⏰ سأشاهده</button>
            </div>
          </div>
        </div>
        <div class="detail-section">
          <h3 class="detail-section-title">📖 القصة</h3>
          <p class="detail-overview">${overview}</p>
        </div>
        <div class="detail-section detail-prod-grid">
          ${detail.budget  ? `<div class="detail-prod-item"><span class="prod-label">💰 الميزانية</span><span class="prod-val">$${(detail.budget/1e6).toFixed(1)}M</span></div>`   : ''}
          ${detail.revenue ? `<div class="detail-prod-item"><span class="prod-label">✅ الإيرادات</span><span class="prod-val">$${(detail.revenue/1e6).toFixed(1)}M</span></div>` : ''}
          ${detail.vote_count ? `<div class="detail-prod-item"><span class="prod-label">🗳 التقييمات</span><span class="prod-val">${detail.vote_count.toLocaleString()}</span></div>` : ''}
          ${detail.status     ? `<div class="detail-prod-item"><span class="prod-label">📌 الحالة</span><span class="prod-val">${detail.status}</span></div>` : ''}
        </div>
        ${castHTML}
      </div>`;

  } catch (err) {
    page.innerHTML = `
      <div class="loading">❌ تعذّر تحميل التفاصيل<br><small>${err.message}</small></div>
      <div class="loading">
        <button class="detail-btn detail-btn-watch" onclick="goBack()">← رجوع</button>
      </div>`;
  }
}

function playTrailer(key) {
  const overlay = document.getElementById('trailerOverlay');
  const frame   = document.getElementById('trailerFrame');
  if (!overlay || !frame) return;
  frame.src = `${CONFIG.VIDEO.YOUTUBE_EMBED}${key}?autoplay=1`;
  overlay.classList.remove('hidden');
  document.getElementById('closeTrailer')?.addEventListener('click', () => {
    overlay.classList.add('hidden');
    frame.src = '';
  }, { once: true });
}
// ===== LIBRARY HELPERS =====
function getLib(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}
function saveLib(key, arr) {
  localStorage.setItem(key, JSON.stringify(arr));
}
function addToWatchlist(id, type) {
  const list = getLib('rox_watchlist');
  if (list.find(i => i.id === id)) { showToast('✅ موجود في قائمتك مسبقاً'); return; }
  list.unshift({ id, type, addedAt: Date.now() });
  saveLib('rox_watchlist', list);
  showToast('❤️ تمت الإضافة إلى قائمتك');
}
function addToWatchLater(id, type) {
  const list = getLib('rox_watchlater');
  if (list.find(i => i.id === id)) { showToast('⏰ موجود في سأشاهده مسبقاً'); return; }
  list.unshift({ id, type, addedAt: Date.now() });
  saveLib('rox_watchlater', list);
  showToast('⏰ تمت الإضافة إلى سأشاهده لاحقاً');
}
function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'rox-toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 2500);
}

// ===== LIBRARY PAGE =====
async function loadLibraryPage() {
  const page = document.getElementById('libraryPage');
  if (!page) return;
  page.innerHTML = '<div class="loading">⏳ جاري تحميل المكتبة...</div>';

  const watchlist  = getLib('rox_watchlist');
  const watchlater = getLib('rox_watchlater');

  const fetchCards = async (items) => {
    const cards = await Promise.all(items.slice(0, 12).map(async item => {
      try {
        const ep  = item.type === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`;
        const res = await fetch(buildTMDBUrl(ep));
        const d   = await res.json();
        const title  = item.type === 'movie' ? (d.title || d.original_title) : (d.name || d.original_name);
        const poster = d.poster_path ? `${CONFIG.IMAGES.POSTER_MD}${d.poster_path}` : CONFIG.IMAGES.PLACEHOLDER;
        const rating = d.vote_average ? d.vote_average.toFixed(1) : '';
        return `
          <div class="movie-card" onclick="openDetail(${item.id},'${item.type}')">
            <div class="movie-poster-wrap">
              <img class="movie-poster" src="${poster}" alt="${title}" loading="lazy"
                   onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
              ${rating ? `<span class="movie-rating">⭐ ${rating}</span>` : ''}
              <div class="movie-overlay"><span class="play-icon">▶</span></div>
            </div>
          </div>`;
      } catch { return ''; }
    }));
    return cards.join('');
  };

  const wlHTML  = watchlist.length  ? await fetchCards(watchlist)  : '<p class="lib-empty">لا يوجد أفلام في قائمتك بعد 🎬</p>';
  const wlrHTML = watchlater.length ? await fetchCards(watchlater) : '<p class="lib-empty">لم تضف شيئاً لسأشاهده بعد ⏰</p>';

  page.innerHTML = `
    <div class="lib-header"><h2 class="lib-title">📚 مكتبتي</h2></div>
    <div class="lib-section">
      <div class="section-header">
        <span class="section-bar"></span>
        <h3 class="section-title">❤️ قائمتي</h3>
      </div>
      <div class="movies-row">${wlHTML}</div>
    </div>
    <div class="lib-section">
      <div class="section-header">
        <span class="section-bar"></span>
        <h3 class="section-title">⏰ سأشاهده لاحقاً</h3>
      </div>
      <div class="movies-row">${wlrHTML}</div>
    </div>`;
}

// ===== SEARCH =====
let searchDebounce = null;
function handleSearch(val) {
  clearTimeout(searchDebounce);
  const q = val.trim();
  if (q.length < CONFIG.SEARCH.MIN_CHARS) {
    const c = document.getElementById('searchResults');
    if (c) c.innerHTML = '';
    return;
  }
  searchDebounce = setTimeout(() => runSearch(q), CONFIG.SEARCH.DEBOUNCE_MS);
}

async function runSearch(q) {
  const container = document.getElementById('searchResults');
  if (!container) return;
  container.innerHTML = '<div class="loading">🔍 جاري البحث...</div>';
  try {
    const res  = await fetch(buildTMDBUrl('/search/multi', { query: q, page: 1 }));
    const data = await res.json();
    const results = (data.results || [])
      .filter(i => (i.media_type === 'movie' || i.media_type === 'tv') && i.poster_path)
      .slice(0, CONFIG.SEARCH.MAX_RESULTS);
    if (!results.length) {
      container.innerHTML = '<p class="lib-empty">لا توجد نتائج 😕</p>';
      return;
    }
    container.innerHTML = `<div class="movies-row">
      ${results.map(m => buildMovieCard(m, m.media_type)).join('')}
    </div>`;
  } catch {
    container.innerHTML = '<p class="lib-empty">حدث خطأ في البحث ❌</p>';
  }
}

// ===== STUBS =====
function openMovieOfDay() {}
function openStats()      {}
function openSurprise()   {}
function openAI()         {}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {

  bnavGo('home');
  try {
    await Promise.all([loadHeroSwiper(), loadHomePage()]);
  } catch(e) {
    console.error('خطأ في التحميل:', e);
  }
});
bnavGo('home');
