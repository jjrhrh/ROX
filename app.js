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

let movies = await fetchMovies('/trending/movie/week', { limit: CONFIG.HERO.LIMIT, requirePoster: true });
  if (!movies.length) movies = await fetchMovies('/movie/popular', { limit: CONFIG.HERO.LIMIT, requirePoster: true });
  if (!movies.length) return;

  wrapper.innerHTML = movies.map(m => {
    const poster = `${CONFIG.IMAGES.POSTER_XL}${m.poster_path}`;
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
    autoplay: {
      delay: CONFIG.HERO?.AUTOPLAY_MS || 6500,
      disableOnInteraction: false,
    },
    speed: 400,
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
    ? `${CONFIG.IMAGES[CONFIG.HERO.BACKDROP_SIZE]}${m.backdrop_path}`
    : `${CONFIG.IMAGES.POSTER_LG}${m.poster_path}`;

  const backdrop = document.getElementById('heroBackdrop');
  if (backdrop) {
    backdrop.style.filter = 'blur(60px) brightness(0.4) saturate(3)';
    backdrop.style.backgroundImage = `url('${CONFIG.IMAGES[CONFIG.HERO.BACKDROP_SIZE]}${m.backdrop_path || m.poster_path}')`;
    backdrop.classList.remove('loaded');
    setTimeout(() => backdrop.classList.add('loaded'), 80);
  }
  const bdUrl = m.backdrop_path ? `${CONFIG.IMAGES.POSTER_XL}${m.backdrop_path}` : '';
document.body.style.backgroundImage = '';
  document.body.style.backgroundSize = 'cover';
  document.body.style.backgroundPosition = 'center';
  document.body.style.backgroundAttachment = 'fixed';
  document.body.style.filter = 'none';
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
    function buildMovieCard(movie, type = 'movie', extraClass = '') {
  const title  = type === 'movie'
    ? (movie.title || movie.original_title)
    : (movie.name  || movie.original_name);
  const poster = movie.poster_path
    ? `${CONFIG.IMAGES.POSTER_SM}${movie.poster_path}`
    : CONFIG.IMAGES.PLACEHOLDER;
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '';
  const year   = (movie.release_date || movie.first_air_date || '').slice(0,4);
  return `
    <div class="movie-card ${extraClass}" onclick="openDetail(${movie.id},'${type}')">
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
// ===== OTAKU MODE =====
let _otakuOn = false;
function toggleOtakuMode() {
  _otakuOn = !_otakuOn;
  document.getElementById('htmlRoot').classList.toggle('otaku-mode', _otakuOn);
  document.getElementById('bnavOtaku').classList.toggle('active', _otakuOn);
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.bnav-btn').forEach(b => b.classList.remove('active'));
  const hero = document.getElementById('heroSection');
  if (_otakuOn) {
    document.getElementById('homePage').classList.add('active');
    document.getElementById('bnavOtaku').classList.add('active');
    if (hero) hero.style.display = '';
    loadOtakuPage();
  } else {
    document.getElementById('homePage').classList.add('active');
    document.getElementById('bnavHome').classList.add('active');
    if (hero) hero.style.display = '';
    loadHeroSwiper();
    loadHomePage();
  }
  window.scrollTo(0, 0);
}
async function loadOtakuPage() {
  const page = document.getElementById('homePage');
  if (!page) return;
  loadOtakuHero();
  const SECTIONS = [
    { id: 'sec_otaku1', title: '🔥 صدارة الموسم',          endpoint: '/discover/tv',    type: 'tv',    cardClass: 'anime-card', params: { with_genres:'16', with_origin_country:'JP', sort_by:'popularity.desc' } },
    { id: 'sec_otaku2', title: '🏆 أساطير الأوتـاكو',      endpoint: '/discover/tv',    type: 'tv',    cardClass: 'anime-card', params: { with_genres:'16', with_origin_country:'JP', sort_by:'vote_average.desc', 'vote_count.gte':'200' } },
    { id: 'sec_otaku3', title: '🎬 سينما الأنمي العالمية', endpoint: '/discover/movie', type: 'movie', cardClass: 'anime-card', params: { with_genres:'16', sort_by:'popularity.desc' } },
    { id: 'sec_otaku4', title: '🌸 أنمي الرومانسية',        endpoint: '/discover/tv',    type: 'tv',    cardClass: 'anime-card', params: { with_genres:'16,10749', with_origin_country:'JP', sort_by:'popularity.desc' } },
    { id: 'sec_otaku5', title: '⚔️ أنمي الأكشن والقتال',   endpoint: '/discover/tv',    type: 'tv',    cardClass: 'anime-card', params: { with_genres:'16,28', with_origin_country:'JP', sort_by:'popularity.desc' } },
    { id: 'sec_otaku6', title: '👻 أنمي الرعب والغموض',    endpoint: '/discover/tv',    type: 'tv',    cardClass: 'anime-card', params: { with_genres:'16,27', with_origin_country:'JP', sort_by:'popularity.desc' } },
    { id: 'sec_otaku7', title: '🚀 أنمي الخيال العلمي',    endpoint: '/discover/tv',    type: 'tv',    cardClass: 'anime-card', params: { with_genres:'16,878', with_origin_country:'JP', sort_by:'popularity.desc' } },
    { id: 'sec_otaku8', title: '📅 أحدث إصدارات الأنمي',   endpoint: '/discover/tv',    type: 'tv',    cardClass: 'anime-card', params: { with_genres:'16', with_origin_country:'JP', sort_by:'first_air_date.desc' } },
  ];
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
  SECTIONS.forEach(async s => {
    try {
      const movies = await fetchMovies(s.endpoint, { type: s.type, params: s.params || {} });
      const row = document.getElementById(`${s.id}_row`);
      const container = document.getElementById(s.id);
      if (!row || !container) return;
      if (!movies.length) { container.remove(); return; }
      row.innerHTML = movies.map(m => buildMovieCard(m, s.type, s.cardClass || '')).join('');
    } catch { document.getElementById(s.id)?.remove(); }
  });
    }
async function loadOtakuHero() {
  const url = buildTMDBUrl('/discover/tv', { with_genres:'16', with_origin_country:'JP', sort_by:'popularity.desc' });
  const data = await fetch(url).then(r => r.json());
  const movies = (data.results || []).filter(m => m.poster_path).slice(0, CONFIG.HERO.LIMIT);
  const wrapper = document.getElementById('heroSwiperWrapper');
  if (!wrapper) return;
  wrapper.innerHTML = movies.map(m => {
    const poster = `${CONFIG.IMAGES.POSTER_XL}${m.poster_path}`;
    return `<div class="swiper-slide hero-swiper-slide" onclick="openDetail(${m.id},'tv')">
      <img src="${poster}" alt="${m.name || m.original_name}"
           onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
    </div>`;
  }).join('');
  if (heroSwiper) {
    heroSwiper.destroy(true, true);
    heroSwiper = null;
  }
  heroSwiper = new Swiper('#heroSwiper', {
    effect: 'coverflow',
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 1.5,
    spaceBetween: 20,
    loop: true,
    autoplay: { delay: 5000, disableOnInteraction: false },
    speed: 400,
    coverflowEffect: { rotate: 50, stretch: -100, depth: 400, modifier: 1, slideShadows: false },
    on: {
      init: function() { updateHeroInfo(movies, 0); },
      slideChange: function() { updateHeroInfo(movies, this.realIndex); }
    }
  });
}
async function loadHomePage() {
  const page = document.getElementById('homePage');
  if (!page) return;

  const SECTIONS = _otakuOn ? [
    { id: 'sec_otaku1', title: '🔥 صدارة الموسم',       endpoint: '/discover/tv',    type: 'tv',
      cardClass: 'anime-card', params: { with_genres:'16', with_origin_country:'JP', sort_by:'popularity.desc' } },
    { id: 'sec_otaku2', title: '🏆 أساطير الأوتـاكو',   endpoint: '/discover/tv',    type: 'tv',
      cardClass: 'anime-card', params: { with_genres:'16', with_origin_country:'JP', sort_by:'vote_average.desc', 'vote_count.gte':'200' } },
    { id: 'sec_otaku3', title: '🎬 سينما الأنمي العالمية', endpoint: '/discover/movie', type: 'movie',
      cardClass: 'anime-card', params: { with_genres:'16', sort_by:'popularity.desc' } },
  ] : [
    { id: 'sec_popular',  title: 'الأفلام الرائجة',   endpoint: '/movie/popular',   type: 'movie' },
    { id: 'sec_toprated', title: 'الأعلى تقييماً',    endpoint: '/movie/top_rated', type: 'movie' },
    { id: 'sec_tvseries', title: 'أحدث المسلسلات',    endpoint: '/tv/popular',      type: 'tv'    },
    { id: 'sec_upcoming', title: '🎬 قادم قريباً',     endpoint: '/movie/upcoming',  type: 'movie' },
  ];

  // عرض الـ Skeleton فوراً بدون انتظار
  const cwItems = cwGetAll();
  const cwHTML = cwItems.length ? `
    <div id="continueSection" class="continue-section">
      <div class="section-header">
        <span class="section-bar"></span>
        <h2 class="section-title">▶️ أكمل المشاهدة</h2>
      </div>
      <div id="continueList" class="continue-list">
        ${cwItems.map(i => `
          <div class="cw-card" onclick="cwResume(${i.id},'${i.type}',${i.seconds},'${i.server}','${i.serverUrl||''}')">
            <img class="cw-thumb" src="${i.poster}" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
            <div class="cw-info">
              <div class="cw-title">${i.title}</div>
              <div class="cw-bar-wrap"><div class="cw-bar" style="width:${Math.min(i.seconds/7200*100,100).toFixed(1)}%"></div></div>
              <div class="cw-time">${Math.floor(i.seconds/60)} دقيقة ${i.server ? '· '+i.server : ''}</div>
            </div>
            <button class="cw-del" onclick="event.stopPropagation();cwDelete(${i.id})">✕</button>
          </div>`).join('')}
      </div>
    </div>` : '';

  page.innerHTML = cwHTML + SECTIONS.map(s => `
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
      const movies = await fetchMovies(s.endpoint, { type: s.type, params: s.params || {} });
      const row = document.getElementById(`${s.id}_row`);
      const container = document.getElementById(s.id);
      if (!row || !container) return;

      if (!movies.length) {
        container.remove();
        return;
      }
      row.innerHTML = movies.map(m => buildMovieCard(m, s.type, s.cardClass || '')).join('');
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
    const [dRes, vRes, cRes, rRes] = await Promise.all([
      fetch(buildTMDBUrl(ep)),
      fetch(buildTMDBUrl(`${ep}/videos`)),
      fetch(buildTMDBUrl(`${ep}/credits`)),
      fetch(buildTMDBUrl(`${ep}/reviews`)),
    ]);
    const detail  = await dRes.json();
    const videos  = await vRes.json();
    const credits = await cRes.json();
    const revData = await rRes.json();

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
              <img data-src="${a.profile_path ? CONFIG.IMAGES.POSTER_SM+a.profile_path : CONFIG.IMAGES.PLACEHOLDER}"
                   src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
                   alt="${a.name}" class="lazy-img cast-img"
                   onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
              <span class="cast-name">${a.name}</span>
              <span class="cast-char">${a.character||''}</span>
            </div>`).join('')}
        </div>
      </div>` : '';
    const allRevs   = revData.results || [];
    const arRevs    = allRevs.filter(r => /[\u0600-\u06FF]/.test(r.content));
    const reviews   = (arRevs.length ? arRevs : allRevs).slice(0, 3);
    const tvSeasons = type === 'tv' ? (detail.seasons||[]).filter(s=>s.season_number>0) : [];
const reviewsHTML = `
      <div class="detail-section">
        <h3 class="detail-section-title">💬 التعليقات</h3>
        <div class="reviews-list">
          ${reviews.length ? reviews.map(r=>`
            <div class="review-card">
              <div class="review-author">✍️ ${r.author}</div>
              <p class="review-content">${r.content.slice(0,300)}${r.content.length>300?'…':''}</p>
            </div>`).join('') :
            `<div class="review-empty">🎬 لا توجد تعليقات متاحة لهذا المحتوى حتى الآن</div>`}
        </div>
      </div>`;

    const seasonsHTML = tvSeasons.length ? `
      <div class="seasons-glass">
        <div class="seasons-header">
          <h3 class="detail-section-title" style="margin:0">📺 المواسم والحلقات</h3>
          <select class="season-select" onchange="loadSeasonEps(${id},+this.value)">
            ${tvSeasons.map(s=>`<option value="${s.season_number}">الموسم ${s.season_number}</option>`).join('')}
          </select>
        </div>
        <div class="swiper eps-swiper" id="epsSwiper_${id}">
          <div class="swiper-wrapper" id="epsWrap_${id}">
            <div class="loading" style="padding:16px">⏳</div>
          </div>
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
            <div class="detail-stats-bar">
              <div class="stat-cap stat-views">👁 <span>${detail.popularity?Math.round(detail.popularity*1000).toLocaleString():'—'}</span></div>
              <div class="stat-cap stat-gold">⭐ <span>${rating}</span></div>
              <div class="stat-cap stat-votes">🗳 <span>${detail.vote_count?detail.vote_count.toLocaleString():'—'}</span></div>
            </div>
            <div class="detail-meta">
              ${year    ?`<span class="detail-badge">📅 ${year}</span>`:''}
              ${runtime ?`<span class="detail-badge">⏱ ${runtime}</span>`:''}
              <span class="detail-badge">${type==='tv'?'📺 مسلسل':'🎬 فيلم'}</span>
            </div>
            <div class="detail-genres">${genres}</div>
            <div class="detail-actions">
              <button class="detail-btn detail-btn-now" onclick="openWatchPage(${id},'${type}')">▶ شاهد الآن</button>
              ${trailerBtn}
              <button class="detail-btn detail-btn-watch" onclick="addToWatchlist(${id},'${type}')">❤️ قائمتي</button>
              <button class="detail-btn detail-btn-later" onclick="addToWatchLater(${id},'${type}')">⏰ سأشاهده</button>
            </div>
          </div>
        </div>
        ${seasonsHTML}
        <div class="detail-section">
          <h3 class="detail-section-title">📖 القصة</h3>
          <p class="detail-overview">${overview}</p>
        </div>
        <div class="detail-section detail-prod-grid">
          ${detail.budget  ?`<div class="detail-prod-item"><span class="prod-label">💰 الميزانية</span><span class="prod-val">$${(detail.budget/1e6).toFixed(1)}M</span></div>`:''}
          ${detail.revenue ?`<div class="detail-prod-item"><span class="prod-label">✅ الإيرادات</span><span class="prod-val">$${(detail.revenue/1e6).toFixed(1)}M</span></div>`:''}
          ${detail.vote_count?`<div class="detail-prod-item"><span class="prod-label">🗳 التقييمات</span><span class="prod-val">${detail.vote_count.toLocaleString()}</span></div>`:''}
          ${detail.status    ?`<div class="detail-prod-item"><span class="prod-label">📌 الحالة</span><span class="prod-val">${detail.status}</span></div>`:''}
        </div>
        ${castHTML}
        ${reviewsHTML}
      </div>`;

    // IntersectionObserver للصور الكسولة
    const lazyObs = new IntersectionObserver(entries => {
      entries.forEach(e => { if(e.isIntersecting){ e.target.src=e.target.dataset.src; lazyObs.unobserve(e.target); }});
    });
    page.querySelectorAll('.lazy-img').forEach(img => lazyObs.observe(img));

    if (type === 'tv' && tvSeasons.length) loadSeasonEps(id, tvSeasons[0].season_number);

  } catch (err) {
    page.innerHTML = `
      <div class="loading">❌ تعذّر تحميل التفاصيل<br><small>${err.message}</small></div>
      <div class="loading">
        <button class="detail-btn detail-btn-watch" onclick="goBack()">← رجوع</button>
      </div>`;
  }
}
async function loadSeasonEps(tvId, seasonNum) {
  const wrap = document.getElementById(`epsWrap_${tvId}`);
  if (!wrap) return;
  wrap.innerHTML = '<div class="loading" style="padding:16px">⏳</div>';
  try {
    const data = await fetch(buildTMDBUrl(`/tv/${tvId}/season/${seasonNum}`)).then(r=>r.json());
    wrap.innerHTML = (data.episodes||[]).map(e=>`
      <div class="swiper-slide ep-card" onclick="openWatchPage(${tvId},'tv',${seasonNum},${e.episode_number})">
        <img data-src="${e.still_path?CONFIG.IMAGES.POSTER_MD+e.still_path:CONFIG.IMAGES.PLACEHOLDER}"
             src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
             class="lazy-img ep-thumb" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
        <div class="ep-num">ح ${e.episode_number}</div>
        <div class="ep-title">${(e.name||'').slice(0,22)}</div>
      </div>`).join('');
    const o2 = new IntersectionObserver(en=>{en.forEach(e=>{if(e.isIntersecting){e.target.src=e.target.dataset.src;o2.unobserve(e.target);}});});
    wrap.querySelectorAll('.lazy-img').forEach(i=>o2.observe(i));
    if(window.Swiper) new Swiper(`#epsSwiper_${tvId}`,{slidesPerView:2.3,spaceBetween:10,freeMode:true,grabCursor:true});
  } catch{ wrap.innerHTML='<div class="loading">⚠️ خطأ</div>'; }
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
function wsSelectServer(card) {
  document.querySelectorAll('.ws-card').forEach(c => {
    c.classList.remove('active');
    const chk = c.querySelector('.ws-check');
    if (chk) chk.remove();
  });
  card.classList.add('active');
  const chk = document.createElement('span');
  chk.className = 'ws-check'; chk.textContent = '✔';
  card.prepend(chk);
  const overlay = document.getElementById('wsOverlay');
  if (overlay && overlay.style.display === 'none') {
    const sw = document.getElementById('wsSwitchOverlay');
    if (sw) {
      sw.style.display = 'flex';
      setTimeout(() => {
        document.getElementById('wsFrame').src = card.dataset.url;
        setTimeout(() => { sw.style.display = 'none'; }, 1800);
      }, 400);
    } else {
      document.getElementById('wsFrame').src = card.dataset.url;
    }
  }
}
function wsStartStream() {
  const active = document.querySelector('.ws-card.active');
  if (!active) return;
  document.getElementById('wsFrame').src = active.dataset.url;
  document.getElementById('wsOverlay').style.display = 'none';
}
function wsGoBack() {
  const dp = document.getElementById('detailPage');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  if (dp && dp.innerHTML.trim().length > 50) {
    dp.classList.add('active');
    const hero = document.getElementById('heroSection');
    if (hero) hero.style.display = 'none';
  } else { goBack(); }
  window.scrollTo(0, 0);
}
async function openWatchPage(id, type, season = 1, episode = 1, resumeSec = 0, resumeSrv = '') {
  const page = document.getElementById('watchPage');
  if (!page) return;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('heroSection').style.display = 'none';
  page.classList.add('active');
  page.innerHTML = '<div class="loading">⏳ جاري التحميل...</div>';
  window.scrollTo(0, 0);
  try {
    const ep = type === 'tv' ? `/tv/${id}` : `/movie/${id}`;
    const [det] = await Promise.all([fetch(buildTMDBUrl(ep)).then(r => r.json())]);
    const backdrop = det.backdrop_path ? CONFIG.IMAGES.BACKDROP + det.backdrop_path : '';
    const title = type === 'movie' ? (det.title || det.original_title) : (det.name || det.original_name);
    const year  = (det.release_date || det.first_air_date || '').slice(0, 4);
    const rating = det.vote_average ? det.vote_average.toFixed(1) : '';
    const genres = (det.genres || []).map(g => g.name).join(' · ');
    const overview = det.overview || 'لا يوجد وصف.';
    const S = CONFIG.SERVERS;
    // احفظ فوراً في Continue Watching
    const cwPoster = det.poster_path ? CONFIG.IMAGES.POSTER_MD + det.poster_path : CONFIG.IMAGES.PLACEHOLDER;
    const cwTitle  = type === 'movie' ? (det.title || det.original_title) : (det.name || det.original_name);
    cwSave(id, type, cwPoster, cwTitle, resumeSec || 0, '', resumeSrv || '');
// تحقق إذا الأنمي (genre_id 16 = Animation + JP)
const isAnime = (det.genres||[]).some(g => g.id === 16)
             && (det.origin_country||[]).includes('JP');

const animeParams = '&ds_lang=jp&audio=ja&sub_pref=Arabic';
const animeCC = `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`;
const srvs = isAnime ? [
  { icon:'🎌', name:'PRIME',   desc:'#01 رئيسي', url:`${S.ANIME}${id}/${season}/${episode}${animeParams}`,  active:true },
  { icon:'⚡', name:'NEXUS',   desc:'#02',        url:`${S.ANIME2}${id}/${season}/${episode}`              },
  { icon:'💎', name:'TITAN',   desc:'#03',        url:`${S.ANIME3}${id}/${season}/${episode}`              },
  { icon:'🌌', name:'COSMOS',  desc:'#04',        url:`${S.ANIME4}${id}/${season}/${episode}`              },
  { icon:'👑', name:'ZENITH',  desc:'#05',        url:`${S.ANIME5}${id}/${season}/${episode}`              },
  { icon:'🌅', name:'AURORA',  desc:'#06',        url:`${S.ANIME6}${id}/${season}/${episode}`              },
  { icon:'⭐', name:'STELLAR', desc:'#07',        url:`${S.ANIME7}${id}/${season}/${episode}`              },
  { icon:'🔮', name:'PHANTOM', desc:'#08',        url:`${S.ANIME8}${id}/${season}/${episode}`              },
  { icon:'🌙', name:'ECLIPSE', desc:'#09',        url:`${S.ANIME9}${id}/${season}/${episode}`              },
  { icon:'✨', name:'NOVA',    desc:'#10',        url:`${S.ANIME10}${id}/${season}/${episode}`             },
  { icon:'🔵', name:'CRYSTAL', desc:'#11',        url:`${S.ANIME11}${id}&s=${season}&e=${episode}`         },
  { icon:'🟣', name:'CIPHER',  desc:'#12',        url:`${S.ANIME12}${id}/${season}/${episode}`             },
  { icon:'🎯', name:'ORION',   desc:'#13',        url:`${S.ANIME13}${id}/${season}/${episode}`             },
  { icon:'💫', name:'NEBULA',  desc:'#14',        url:`${S.ANIME14}${id}/${season}/${episode}`             },
  { icon:'🖤', name:'ONYX',    desc:'#15',        url:`${S.ANIME15}${id}/${season}/${episode}`             },
  { icon:'🌟', name:'VEGA',    desc:'#16',        url:`${S.ANIME16}${id}/${season}/${episode}`             },
  { icon:'🔴', name:'QUASAR',  desc:'#17',        url:`${S.ANIME17}${id}/${season}/${episode}`             },
  { icon:'🟡', name:'PULSAR',  desc:'#18',        url:`${S.ANIME18}${id}/${season}/${episode}`             },
  { icon:'🟢', name:'LYRA',    desc:'#19',        url:`${S.ANIME19}${id}/${season}/${episode}`             },
  { icon:'🏅', name:'VULCAN',  desc:'#20 VIP',    url:`${S.ANIME20}${id}&tmdb=1&s=${season}&e=${episode}`  },
  { icon:'🎖', name:'SIGMA',   desc:'#21',    url:`${S.ANIME21}${id}/${season}/${episode}`  },
  { icon:'🌠', name:'NEXUS-X', desc:'#22 4K', url:`${S.ANIME22}${id}-${season}-${episode}`  },
  { icon:'💠', name:'EMBED',   desc:'#23',    url:`${S.ANIME23}${id}/${season}/${episode}`  },
] : type === 'tv' ? [
  { icon:'📺', name:'PRIME',   desc:'#01 رئيسي', url:`${S.TV}${id}/${season}/${episode}`,                 active:true },
  { icon:'⚡', name:'NEXUS',   desc:'#02',        url:`${S.TV2}${id}/${season}/${episode}`                 },
  { icon:'💎', name:'TITAN',   desc:'#03',        url:`${S.TV3}${id}/${season}/${episode}`                 },
  { icon:'🌅', name:'AURORA',  desc:'#04',        url:`${S.TV4}${id}/${season}/${episode}`                 },
  { icon:'🌌', name:'COSMOS',  desc:'#05',        url:`${S.TV5}${id}/${season}/${episode}`                 },
  { icon:'👑', name:'ZENITH',  desc:'#06',        url:`${S.TV6}${id}/${season}/${episode}`                 },
  { icon:'⭐', name:'STELLAR', desc:'#07',        url:`${S.TV7}${id}/${season}/${episode}`                 },
  { icon:'🔮', name:'PHANTOM', desc:'#08',        url:`${S.TV8}${id}/${season}/${episode}`                 },
  { icon:'🌙', name:'ECLIPSE', desc:'#09',        url:`${S.TV9}${id}/${season}/${episode}`                 },
  { icon:'✨', name:'NOVA',    desc:'#10',        url:`${S.TV10}${id}/${season}/${episode}`                },
  { icon:'🌟', name:'VEGA',    desc:'#11',        url:`${S.TV11}${id}/${season}/${episode}`                },
  { icon:'🔵', name:'CRYSTAL', desc:'#12',        url:`${S.TV12}${id}&s=${season}&e=${episode}`            },
  { icon:'🟣', name:'CIPHER',  desc:'#13',        url:`${S.TV13}${id}/${season}/${episode}`                },
  { icon:'🎯', name:'ORION',   desc:'#14',        url:`${S.TV14}${id}/${season}/${episode}`                },
  { icon:'💫', name:'NEBULA',  desc:'#15',        url:`${S.TV15}${id}/${season}/${episode}`                },
  { icon:'🖤', name:'ONYX',    desc:'#16',        url:`${S.TV16}${id}/${season}/${episode}`                },
  { icon:'🏆', name:'APEX',    desc:'#17',        url:`${S.TV17}${id}/${season}/${episode}`                },
  { icon:'🎬', name:'MATRIX',  desc:'#18',        url:`${S.TV18}${id}&season=${season}&episode=${episode}` },
  { icon:'🔴', name:'QUASAR',  desc:'#19',        url:`${S.TV19}${id}/${season}/${episode}`                },
  { icon:'🟡', name:'PULSAR',  desc:'#20',        url:`${S.TV20}${id}/${season}/${episode}`                },
  { icon:'🟢', name:'LYRA',    desc:'#21',        url:`${S.TV21}${id}/${season}/${episode}`                },
  { icon:'🏅', name:'VULCAN',  desc:'#22 VIP',    url:`${S.TV22}${id}&tmdb=1&s=${season}&e=${episode}`     },
  { icon:'🎖', name:'SIGMA',   desc:'#23',    url:`${S.TV23}${id}/${season}/${episode}`   },
  { icon:'🌠', name:'NEXUS-X', desc:'#24 4K', url:`${S.TV24}${id}-${season}-${episode}`   },
  { icon:'💠', name:'EMBED',   desc:'#25',    url:`${S.TV25}${id}/${season}/${episode}`   },
] : [
  { icon:'🎬', name:'PRIME',   desc:'#01 رئيسي', url:`${S.MOV}${id}`,              active:true },
  { icon:'⚡', name:'NEXUS',   desc:'#02',        url:`${S.MOV2}${id}`              },
  { icon:'💎', name:'TITAN',   desc:'#03',        url:`${S.MOV3}${id}`              },
  { icon:'🌅', name:'AURORA',  desc:'#04',        url:`${S.MOV4}${id}`              },
  { icon:'🌌', name:'COSMOS',  desc:'#05',        url:`${S.MOV5}${id}`              },
  { icon:'👑', name:'ZENITH',  desc:'#06',        url:`${S.MOV6}${id}`              },
  { icon:'⭐', name:'STELLAR', desc:'#07',        url:`${S.MOV7}${id}`              },
  { icon:'🔮', name:'PHANTOM', desc:'#08',        url:`${S.MOV8}${id}&tmdb=1`       },
  { icon:'🌙', name:'ECLIPSE', desc:'#09',        url:`${S.MOV9}${id}`              },
  { icon:'✨', name:'NOVA',    desc:'#10',        url:`${S.MOV10}${id}`             },
  { icon:'🌟', name:'VEGA',    desc:'#11',        url:`${S.MOV11}${id}`             },
  { icon:'💫', name:'NEBULA',  desc:'#12',        url:`${S.MOV12}${id}`             },
  { icon:'🏆', name:'APEX',    desc:'#13',        url:`${S.MOV13}${id}`             },
  { icon:'🟣', name:'CIPHER',  desc:'#14',        url:`${S.MOV14}${id}`             },
  { icon:'🎯', name:'ORION',   desc:'#15',        url:`${S.MOV15}${id}`             },
  { icon:'🔵', name:'CRYSTAL', desc:'#16',        url:`${S.MOV16}${id}`             },
  { icon:'🖤', name:'ONYX',    desc:'#17',        url:`${S.MOV17}${id}`             },
  { icon:'🌈', name:'PRISM',   desc:'#18',        url:`${S.MOV18}${id}`             },
  { icon:'🔴', name:'QUASAR',  desc:'#19',        url:`${S.MOV19}${id}`             },
  { icon:'🟡', name:'PULSAR',  desc:'#20',        url:`${S.MOV20}${id}`             },
  { icon:'🟢', name:'LYRA',    desc:'#21',        url:`${S.MOV21}${id}`             },
  { icon:'🏅', name:'VULCAN',  desc:'#22 VIP',    url:`${S.MOV22}${id}&tmdb=1`      },
  { icon:'🎖', name:'SIGMA',   desc:'#23',    url:`${S.MOV23}${id}` },
  { icon:'🌠', name:'NEXUS-X', desc:'#24 4K', url:`${S.MOV24}${id}` },
  { icon:'💠', name:'EMBED',   desc:'#25',    url:`${S.MOV25}${id}` },
];
    const srvHTML = srvs.map(s => `
      <div class="ws-card ${s.active?'active':''}" data-url="${s.url}" data-name="${s.name}" onclick="wsSelectServer(this)">
        ${s.active?'<span class="ws-check">✔</span>':''}
        <div class="ws-icon">${s.icon}</div>
        <div class="ws-name">${s.name}</div>
        <div class="ws-desc">${s.desc}</div>
        <span class="ws-free">مجاني</span>
      </div>`).join('');
    const prodHTML = [
      det.budget  ? `<div class="ws-prod-item"><span class="ws-prod-val">$${det.budget.toLocaleString()}</span><span class="ws-prod-label">💰 الميزانية</span></div>` : '',
      det.revenue ? `<div class="ws-prod-item"><span class="ws-prod-val">$${det.revenue.toLocaleString()}</span><span class="ws-prod-label">✅ الإيرادات</span></div>` : '',
    ].join('');
    page.innerHTML = `
      <div class="ws-player-wrap">
        <div class="ws-player-bg" style="background-image:url('${backdrop}')">
          <div class="ws-overlay" id="wsOverlay" onclick="wsStartStream()">
            <div class="ws-play-btn">▶</div>
            <span class="ws-play-lbl">اضغط للمشاهدة</span>
          </div>
          ${isAnime ? `<button class="ws-jp-btn" onclick="document.getElementById('wsFrame').src='${animeCC}'">🇯🇵 النسخة اليابانية الأصلية</button>` : ''}
          <iframe id="wsFrame" class="ws-frame" src="" allowfullscreen allow="autoplay"
            onload="if(this.src)cwTrackTime(${id},'${type}','${cwPoster}','${cwTitle}')">
          </iframe>
          <script>
            if('${resumeSrv}') {
              document.querySelector('.ws-card.active')?.classList.remove('active');
              const match = [...document.querySelectorAll('.ws-card')].find(c=>c.dataset.url==='${resumeSrv}');
              if(match) { match.classList.add('active'); }
            }
          </script>
          <div id="wsSwitchOverlay" class="ws-switch-overlay" style="display:none">
            <div class="ws-switch-spinner"></div>
            <span class="ws-switch-txt">يتم الاتصال بسيرفرات Cinema-ROX الخاصة...</span>
          </div>
        </div>
        <button class="ws-back" onclick="wsGoBack()">→ رجوع</button>
      </div>
      <div class="ws-info-card">
        <h2 class="ws-title">${title}</h2>
        <div class="ws-badges">
          <span class="ws-bdg">${type==='tv'?'📺 مسلسل':'🎬 فيلم'}</span>
          <span class="ws-bdg">📅 ${year}</span>
          <span class="ws-bdg ws-bdg-gold">⭐ ${rating}</span>
        </div>
        <p class="ws-genres">${genres}</p>
      </div>
      <div class="ws-section">
        <h3 class="ws-stitle">📖 القصة</h3>
        <p class="ws-overview">${overview}</p>
      </div>
      <div class="ws-section">
        <div class="ws-srv-head">
          <h3 class="ws-stitle">🟢 مصادر البث</h3>
          <span class="ws-srv-sub">🔒 السيرفرات الخاصة</span>
        </div>
        <div class="ws-grid">${srvHTML}</div>
        <p class="ws-note">إذا لم يعمل البيزمبر جرب آخر</p>
      </div>
      ${prodHTML?`<div class="ws-section"><h3 class="ws-stitle">📊 بيانات الإنتاج</h3><div class="ws-prod-grid">${prodHTML}</div></div>`:''}`;
  } catch(e) {
    page.innerHTML = `<div class="loading">❌ خطأ<br><button onclick="wsGoBack()" class="detail-btn">← رجوع</button></div>`;
  }
}
// ===== CONTINUE WATCHING =====
let _cwTimer = null;
function cwTrackTime(id, type, poster, title) {
  clearInterval(_cwTimer);
  let sec = 0;
  _cwTimer = setInterval(() => {
    sec += 10;
    const activeCard = document.querySelector('.ws-card.active');
    const srv = activeCard ? (activeCard.dataset.name || '') : '';
    const url = activeCard ? (activeCard.dataset.url || '') : '';
    cwSave(id, type, poster, title, sec, srv, url);
  }, 10000);
}
const CW_KEY = 'rox_continue';
const CW_TTL = 604800000; // 7 أيام

function cwSave(id, type, poster, title, seconds, server, serverUrl) {
  const list = cwGetAll();
  const idx  = list.findIndex(i => i.id === id);
  const item = { id, type, poster, title, seconds, server, serverUrl, savedAt: Date.now() };
  if (idx > -1) list[idx] = item; else list.unshift(item);
  localStorage.setItem(CW_KEY, JSON.stringify(list.slice(0, 20)));
}

function cwGetAll() {
  try {
    const all = JSON.parse(localStorage.getItem(CW_KEY) || '[]');
    const valid = all.filter(i => Date.now() - i.savedAt < CW_TTL);
    if (valid.length !== all.length) localStorage.setItem(CW_KEY, JSON.stringify(valid));
    return valid;
  } catch { return []; }
}

function cwDelete(id) {
  const list = cwGetAll().filter(i => i.id !== id);
  localStorage.setItem(CW_KEY, JSON.stringify(list));
  loadHomePage();
}

function cwRender() {
  loadHomePage();
}

function cwResume(id, type, seconds, server, serverUrl) {
  openWatchPage(id, type, 1, 1, seconds, serverUrl);
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
cwRender();
  } catch(e) {
    console.error('خطأ في التحميل:', e);
  }
});
bnavGo('home');
