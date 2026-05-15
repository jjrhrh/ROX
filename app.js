(function() {
  const allowed = ['PPLLMMOOKKNN99'];
  const saved = localStorage.getItem('rox_pass');
  if (!allowed.includes(saved)) {
    const pass = prompt('🔐 أدخل كلمة المرور للدخول:');
    if (!allowed.includes(pass)) {
      document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#000;color:#fff;font-size:1.5rem;font-family:Cairo">⛔ غير مصرح لك بالدخول</div>';
      return;
    }
    localStorage.setItem('rox_pass', pass);
  }
})();
// ===== NAVIGATION =====
// ===== NAVIGATION =====
function bnavGo(tab) {
  const hero = document.getElementById('heroSection');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.bnav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('newsSection').style.display = 'none';
  document.getElementById('studioBar').style.display = 'none';
  if (tab === 'browse') { toggleRoxMenu(); return; }

  if (tab === 'home' && _otakuOn) {
    _otakuOn = false;
    document.getElementById('htmlRoot').classList.remove('otaku-mode');
    document.getElementById('bnavOtaku').classList.remove('active');
    document.getElementById('homePage').classList.add('active');
    document.getElementById('bnavHome').classList.add('active');
    if (hero) { hero.style.display = ''; hero.style.visibility = ''; }
    loadHeroSwiper();
    loadHomePage();
    window.scrollTo(0, 0);
    return;
  }

  const pageMap = { home:'homePage', search:'searchPage', library:'libraryPage', profile:'profilePage', otaku:'homePage' };
  const btnMap  = { home:'bnavHome', search:'bnavSearch', library:'bnavLibrary', profile:'bnavProfile', otaku:'bnavOtaku' };
  
  document.getElementById(pageMap[tab])?.classList.add('active');
  document.getElementById(btnMap[tab])?.classList.add('active');
  if (hero) {
    hero.style.display = (tab === 'home' || tab === 'otaku') ? '' : 'none';
    hero.style.visibility = (tab === 'home' || tab === 'otaku') ? '' : 'hidden';
  }
  if (tab === 'home') { loadHeroSwiper(); loadHomePage(); loadNewsSection('newsFeed', CONFIG.NEWS.CINEMA, 'red'); const _t=document.getElementById('newsSectionTitle'); if(_t) _t.textContent='📰 أخبار السينما الحية'; }
  if (tab === 'library') loadLibraryPage();
  if (tab === 'profile') loadProfilePage();
if (tab === 'otaku') { if(hero){hero.style.display='';hero.style.visibility='';} _otakuOn=true; document.getElementById('htmlRoot').classList.add('otaku-mode'); document.getElementById('bnavOtaku').classList.add('active'); loadOtakuPage(); loadNewsSection('newsFeed',CONFIG.NEWS.ANIME,'purple'); document.getElementById('newsSectionTitle').textContent='📰 أخبار الأنمي'; document.getElementById('newsSection').style.display='block'; document.getElementById('studioBar').style.display='block'; }
  window.scrollTo(0,0);
}
function goBack() {
  const hero = document.getElementById('heroSection');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.bnav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('homePage').classList.add('active');
  if (_otakuOn) {
    document.getElementById('bnavOtaku').classList.add('active');
    if (hero) { hero.style.display = ''; hero.style.visibility = ''; }
    document.getElementById('studioBar').style.display = 'block';
    document.getElementById('newsSection').style.display = 'block';
    document.getElementById('newsSectionTitle').textContent = '📰 أخبار الأنمي';
  } else {
    document.getElementById('bnavHome').classList.add('active');
    if (hero) { hero.style.display = ''; hero.style.visibility = ''; }
  }
  window.scrollTo(0, 0);
}

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
// ===== GOOGLE AUTH =====
function roxSignIn() {
  ROX_AUTH.signInWithPopup(ROX_PROVIDER).catch(e => console.error(e));
}
function roxSignOut() {
  ROX_AUTH.signOut();
  showToast('👋 تم تسجيل الخروج');
  setTimeout(() => loadProfilePage(), 500);
}
if (window.ROX_AUTH) {
  ROX_AUTH.onAuthStateChanged(user => {
  window.ROX_USER = user || null;
  if (document.getElementById('profilePage')?.classList.contains('active')) loadProfilePage();
  if (document.getElementById('libraryPage')?.classList.contains('active')) loadLibraryPage();
});
}
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
async function openAnimeJikan(malId, encodedTitle) {
  const title = decodeURIComponent(encodedTitle);
  const page  = document.getElementById('detailPage');
  if (!page) return;
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('heroSection').style.display = 'none';
  document.getElementById('newsSection').style.display = 'none';
  document.getElementById('studioBar').style.display   = 'none';
  page.classList.add('active');
  page.innerHTML = '<div class="loading">⏳ جاري تحميل التفاصيل...</div>';
  window.scrollTo(0,0);
  try {
    const [detRes, tmdbRes, epsRes] = await Promise.all([
      fetch(`${CONFIG.API.JIKAN_BASE}/anime/${malId}/full`).then(r=>r.json()),
      fetch(buildTMDBUrl('/search/tv', { query: title, page:1 })).then(r=>r.json()),
      fetch(`${CONFIG.API.JIKAN_BASE}/anime/${malId}/episodes?page=1`).then(r=>r.json()),
    ]);
    const a       = detRes.data;
    const tmdbHit = (tmdbRes.results||[])[0];
    const tmdbId  = tmdbHit?.id || null;
    const poster  = a.images?.jpg?.large_image_url || CONFIG.IMAGES.PLACEHOLDER;
    const backdrop= a.images?.jpg?.large_image_url || '';
    const trailer = (a.trailer?.url||'').replace('watch?v=','embed/');
    const genres  = (a.genres||[]).map(g=>`<span class="detail-genre">${g.name}</span>`).join('');
    const studios = (a.studios||[]).map(s=>s.name).join(', ');
    const score   = a.score||'N/A';
    const eps     = a.episodes||'?';
    const status  = a.status||'';
    const synopsis= a.synopsis||'لا يوجد وصف.';
    const episodes = epsRes.data || [];
    const watchBtn = `<button class="detail-btn detail-btn-now" onclick="openWatchPageAnime(${tmdbId||0},${malId},1,1)">▶ شاهد الآن — الحلقة 1</button>`;
    const trailerBtn = trailer
      ? `<button class="detail-btn detail-btn-trailer" onclick="playTrailer('${a.trailer?.youtube_id}')">▶ المقطع الدعائي</button>`
      : '';
    page.innerHTML = `
      <div class="detail-backdrop" style="background-image:url('${backdrop}')">
        <div class="detail-backdrop-gradient"></div>
        <button class="detail-back-btn" onclick="goBack()">← رجوع</button>
      </div>
      <div class="detail-body">
        <div class="detail-top">
          <img class="detail-poster" src="${poster}" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
          <div class="detail-info">
            <h1 class="detail-title">${a.title}</h1>
            <div class="detail-stats-bar">
              <div class="stat-cap stat-gold">⭐ <span>${score}</span></div>
              <div class="stat-cap stat-views">👁 <span>${(a.members||0).toLocaleString()}</span></div>
            </div>
            <div class="detail-meta">
              ${eps?`<span class="detail-badge">🎬 ${eps} حلقة</span>`:''}
              ${status?`<span class="detail-badge">${status}</span>`:''}
              ${studios?`<span class="detail-badge">🎌 ${studios}</span>`:''}
            </div>
            <div class="detail-genres">${genres}</div>
            <div class="detail-actions">
              ${watchBtn}${trailerBtn}
              <button class="detail-btn detail-btn-watch" onclick="addToWatchlist(${malId},'anime')">❤️ قائمتي</button>
            </div>
          </div>
        </div>
        ${episodes.length ? `
        <div class="seasons-glass">
          <div class="seasons-header">
            <h3 class="detail-section-title" style="margin:0">🎬 الحلقات</h3>
            <span style="color:rgba(255,255,255,0.4);font-size:0.75rem">${a.episodes||'?'} حلقة</span>
          </div>
          <div class="eps-header-bar">
            <button class="eps-view-all-btn" onclick="openAllEpsJikan(${malId},${tmdbId||0},'${encodeURIComponent(a.title)}','${poster}')">عرض الكل ›</button>
          </div>
          <div class="swiper eps-swiper" id="epsSwiper_${malId}">
            <div class="swiper-wrapper">
              ${episodes.map((e,i)=>`
                <div class="swiper-slide ep-card" onclick="openWatchPageAnime(-1,${malId},1,${e.episode_id||i+1})">
                  <div class="ep-thumb-wrap">
                    <img data-src="${e.images?.jpg?.image_url||poster}"
                         src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
                         class="lazy-img ep-thumb" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
                    <div class="ep-num-badge">ح ${e.episode_id||i+1}</div>
                  </div>
                  <div class="ep-info">
                    <div class="ep-title">${(e.title||'حلقة '+(e.episode_id||i+1)).slice(0,28)}</div>
                  </div>
                </div>`).join('')}
            </div>
          </div>
        </div>` : ''}
        <div class="detail-section">
          <h3 class="detail-section-title">📖 القصة</h3>
          <p class="detail-overview">${synopsis}</p>
        </div>
        </div>`;
    if(window.Swiper && episodes.length) new Swiper(`#epsSwiper_${malId}`,{slidesPerView:2.3,spaceBetween:10,freeMode:true,grabCursor:true});
  } catch(e) {
    page.innerHTML = `<div class="loading">❌ خطأ<br><button class="detail-btn" onclick="goBack()">← رجوع</button></div>`;
  }
}
async function openWatchPageAnime(tmdbId, malId, season=1, episode=1) {
  const page = document.getElementById('watchPage');
  if (!page) return;
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('heroSection').style.display = 'none';
  page.classList.add('active');
  page.innerHTML = '<div class="loading">⏳ جاري التحميل...</div>';
  window.scrollTo(0,0);
  const S = CONFIG.SERVERS;
  const id = (tmdbId && tmdbId > 0) ? tmdbId : 0;
  const allSrvs = [
      { icon:'🎌', name:'PRIME',   url:`${S.ANIME}${id}/${season}/${episode}`   },
      { icon:'⚡', name:'NEXUS',   url:`${S.ANIME2}${id}/${season}/${episode}`  },
      { icon:'💎', name:'TITAN',   url:`${S.ANIME3}${id}/${season}/${episode}`  },
      { icon:'🌌', name:'COSMOS',  url:`${S.ANIME4}${id}/${season}/${episode}`  },
      { icon:'👑', name:'ZENITH',  url:`${S.ANIME5}${id}/${season}/${episode}`  },
      { icon:'🌅', name:'AURORA',  url:`${S.ANIME6}${id}/${season}/${episode}`  },
      { icon:'⭐', name:'STELLAR', url:`${S.ANIME7}${id}/${season}/${episode}`  },
      { icon:'🔮', name:'PHANTOM', url:`${S.ANIME8}${id}/${season}/${episode}`  },
      { icon:'🌙', name:'ECLIPSE', url:`${S.ANIME9}${id}/${season}/${episode}`  },
      { icon:'✨', name:'NOVA',    url:`${S.ANIME10}${id}/${season}/${episode}` },
      { icon:'🔵', name:'CRYSTAL', url:`${S.ANIME11}${id}&s=${season}&e=${episode}` },
      { icon:'🟣', name:'CIPHER',  url:`${S.ANIME12}${id}/${season}/${episode}` },
      { icon:'🎯', name:'ORION',   url:`${S.ANIME13}${id}/${season}/${episode}` },
      { icon:'💫', name:'NEBULA',  url:`${S.ANIME14}${id}/${season}/${episode}` },
      { icon:'🖤', name:'ONYX',    url:`${S.ANIME15}${id}/${season}/${episode}` },
      { icon:'🌟', name:'VEGA',    url:`${S.ANIME16}${id}/${season}/${episode}` },
      { icon:'🔴', name:'QUASAR',  url:`${S.ANIME17}${id}/${season}/${episode}` },
      { icon:'🟡', name:'PULSAR',  url:`${S.ANIME18}${id}/${season}/${episode}` },
      { icon:'🟢', name:'LYRA',    url:`${S.ANIME19}${id}/${season}/${episode}` },
      { icon:'🏅', name:'VULCAN',  url:`${S.ANIME20}${id}&tmdb=1&s=${season}&e=${episode}` },
      { icon:'🎖', name:'SIGMA',   url:`${S.ANIME21}${id}/${season}/${episode}` },
      { icon:'💠', name:'EMBED',   url:`${S.ANIME23}${id}/${season}/${episode}` },
      { icon:'🎐', name:'SAKURA',  url:`${S.ANIME24}${id}/${season}/${episode}` },
      { icon:'🔥', name:'INFERNO', url:`${S.ANIME26}${id}/${season}/${episode}` },
      { icon:'⚔️', name:'KATANA',  url:`${S.ANIME27}${id}/${season}/${episode}`  },
  ];
  const srvHTML = allSrvs.map((s,i)=>`
    <div class="ws-card ${i===0?'active':''}" data-url="${s.url}" data-name="${s.name}" onclick="wsSelectServer(this)">
      ${i===0?'<span class="ws-check">✔</span>':''}
      <div class="ws-icon">${s.icon}</div>
      <div class="ws-name">${s.name}</div>
      <span class="ws-free">مجاني</span>
    </div>`).join('');
  page.innerHTML = `
    <div class="ws-player-wrap">
      <div class="ws-player-bg">
        <div class="ws-overlay" id="wsOverlay" onclick="wsStartStream()">
          <div class="ws-play-btn">▶</div>
          <span class="ws-play-lbl">اضغط للمشاهدة</span>
        </div>
        <iframe id="wsFrame" class="ws-frame" src="" allowfullscreen
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"></iframe>
      </div>
      <button class="ws-back" onclick="wsGoBack()">→ رجوع</button>
    </div>
    <div class="ws-section">
      <div class="ws-srv-head">
        <h3 class="ws-stitle">🟢 مصادر البث</h3>
        <span class="ws-srv-sub" style="color:rgba(147,51,234,0.8)">TMDB أنمي</span>
      </div>
      <div class="ws-grid">${srvHTML}</div>
      <p class="ws-note">جرب PRIME أولاً — إذا لم يعمل جرب سيرفر آخر</p>
    </div>`;
}
// ===== HERO SWIPER =====
let heroSwiper = null;

async function loadHeroSwiper() {
  if (heroSwiper) { heroSwiper.destroy(true, true); heroSwiper = null; }
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
    function buildMovieCard(movie, type = 'movie', extraClass = '', rank = 0) {
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
      ${rank > 0 ? `<span class="rank-number">${rank}</span>` : ''}
      <div class="movie-poster-wrap">
        <img class="movie-poster" src="${poster}" alt="${title}" loading="lazy"
             onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
        ${year   ? `<span class="movie-year-badge">${year}</span>` : ''}
        <div class="movie-overlay"><span class="play-icon">▶</span></div>
      </div>
      <div class="movie-title-bar">${title.length > 18 ? title.slice(0,18)+'...' : title}</div>
<div class="movie-meta-bar"><span>${type === 'tv' ? 'SERIES' : 'MOVIE'} · ${year}</span><span>⭐ ${rating}</span></div>
    </div>`;
}
function buildAnimeCard(movie, rank = 0, type = 'tv') {
  const title = movie.name || movie.original_name || movie.title || '';
  const poster = movie.backdrop_path
    ? `${CONFIG.IMAGES.BACKDROP}${movie.backdrop_path}`
    : movie.poster_path ? `${CONFIG.IMAGES.POSTER_LG}${movie.poster_path}` : CONFIG.IMAGES.PLACEHOLDER;
  const year = (movie.first_air_date || movie.release_date || '').slice(0,4);
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '';
  return `
    <div class="anime-card" onclick="openDetail(${movie.id},'${type}')">
      <div class="anime-poster-wrap">
        <img class="anime-poster" src="${poster}" loading="lazy"
             onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
        <div class="anime-overlay"><span class="play-icon">▶</span></div>
        ${rank > 0 ? `<span class="rank-number">${rank}</span>` : ''}
      </div>
      <div class="anime-title-bar">${title.length > 22 ? title.slice(0,22)+'...' : title}</div>
      <div class="anime-meta-bar"><span class="anime-badge-type">أنمي</span><span class="anime-badge-year">${toArabicNums(year)}</span>${rating ? `<span class="anime-badge-rating">⭐ ${rating}</span>` : ''}</div>
    </div>`;
}
function toArabicNums(str) {
  return String(str).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
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
  _otakuOn = true;
  document.getElementById('htmlRoot').classList.add('otaku-mode');
  bnavGo('otaku');
}
async function loadOtakuPage() {
  const page = document.getElementById('homePage');
  if (!page) return;
  loadOtakuHero();
  const SECTIONS = [
    { id: 'sec_otaku1', title: '🔥 الأكثر شعبية',   params: { with_genres:'16', with_origin_country:'JP', sort_by:'popularity.desc' } },
    { id: 'sec_otaku2', title: '⭐ الأعلى تقييماً', params: { with_genres:'16', with_origin_country:'JP', sort_by:'vote_average.desc', 'vote_count.gte':'200' } },
    { id: 'sec_otaku3', title: '🆕 موسم هذا العام', params: { with_genres:'16', with_origin_country:'JP', sort_by:'first_air_date.desc', 'first_air_date.gte': new Date().getFullYear()+'-01-01' } },
  ];
  page.innerHTML = SECTIONS.map(s => `
    <div class="home-section otaku-section" id="${s.id}">
      <div class="section-header">
        <span class="section-bar"></span>
        <h2 class="section-title otaku-sec-title">${s.title}</h2>
        <button class="browse-all-btn" onclick="openOtakuAll('${s.id}','${s.title}','tv')">عرض الكل ›</button>
      </div>
      <div class="otaku-slider-wrap">
        <button class="otaku-arrow otaku-arrow-left" onclick="otakuSlide('${s.id}_row',-1)">‹</button>
        <div class="otaku-row" id="${s.id}_row"></div>
        <button class="otaku-arrow otaku-arrow-right" onclick="otakuSlide('${s.id}_row',1)">›</button>
      </div>
    </div>`).join('');
  for (const s of SECTIONS) {
    try {
      const animes = await fetchMovies('/discover/tv', { type:'tv', limit:10, params: s.params });
      const row = document.getElementById(`${s.id}_row`);
      if (!row) return;
      row.innerHTML = animes.map((m, idx) => buildAnimeCard(m, idx+1, 'tv')).join('');
    } catch { document.getElementById(s.id)?.remove(); }
  }
}
function otakuSlide(rowId, dir) {
  const row = document.getElementById(rowId);
  if (!row) return;
  row.scrollBy({ left: dir * 340, behavior: 'smooth' });
}
async function openOtakuAll(secId, title, type) {
  const page = document.getElementById('detailPage');
  if (!page) return;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('heroSection').style.display = 'none';
  document.getElementById('newsSection').style.display = 'none';
  document.getElementById('studioBar').style.display = 'none';
  page.classList.add('active');
  page.innerHTML = '<div class="loading">⏳ جاري التحميل...</div>';
  window.scrollTo(0, 0);

  const SECTION_PARAMS = {
    sec_otaku1: { with_genres:'16', with_origin_country:'JP', sort_by:'popularity.desc' },
    sec_otaku2: { with_genres:'16', with_origin_country:'JP', sort_by:'vote_average.desc', 'vote_count.gte':'200' },
    sec_otaku3: { with_genres:'16', with_origin_country:'JP', sort_by:'first_air_date.desc', 'first_air_date.gte': new Date().getFullYear()+'-01-01' },
  };

  const params = SECTION_PARAMS[secId] || { with_genres:'16', with_origin_country:'JP', sort_by:'popularity.desc' };
  const endpoint = type === 'movie' ? '/discover/movie' : '/discover/tv';
  const movies = await fetchMovies(endpoint, { type, limit: 30, params });

  page.innerHTML = `
    <div style="padding:16px">
      <button class="detail-btn" onclick="studioGoBack()" style="margin-bottom:16px">← رجوع</button>
      <h2 style="color:#fff;margin-bottom:16px;font-size:1rem">${title}</h2>
      <div class="otaku-all-grid">
        ${movies.map((m, idx) => buildAnimeCard(m, idx + 1, type)).join('')}
      </div>
    </div>`;
}
async function openStudio(name, id) {
  const page = document.getElementById('detailPage');
  if (!page) return;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('heroSection').style.display = 'none';
  document.getElementById('newsSection').style.display = 'none';
  document.getElementById('studioBar').style.display = 'none';
  page.classList.add('active');
  page.innerHTML = '<div class="loading">⏳ جاري التحميل...</div>';
  window.scrollTo(0, 0);
  const [movRes, tvRes] = await Promise.all([
    fetchMovies('/discover/movie', { type:'movie', limit:10, params:{ with_companies: String(id), sort_by:'popularity.desc', include_adult: 'false' }}),
    fetchMovies('/discover/tv',    { type:'tv',    limit:10, params:{ with_companies: String(id), sort_by:'popularity.desc', include_adult: 'false' }}),
  ]);
  const hasContent = movRes.length || tvRes.length;
  page.innerHTML = `
    <div style="padding:16px">
      <button class="detail-btn" onclick="studioGoBack()" style="margin-bottom:16px">← رجوع</button>
      <h2 style="color:#fff;margin-bottom:16px;font-size:1.1rem">🎌 ${name}</h2>
      ${!hasContent ? '<p style="color:rgba(255,255,255,0.5);text-align:center;margin-top:40px">لا توجد نتائج متاحة</p>' : ''}
      ${movRes.length ? `
        <h3 style="color:rgba(255,255,255,0.6);font-size:0.75rem;margin-bottom:10px">🎬 أفلام</h3>
        <div class="otaku-all-grid" style="margin-bottom:20px">
          ${movRes.map((m,i) => buildAnimeCard(m, i+1, 'movie')).join('')}
        </div>` : ''}
      ${tvRes.length ? `
        <h3 style="color:rgba(255,255,255,0.6);font-size:0.75rem;margin-bottom:10px">📺 مسلسلات</h3>
        <div class="otaku-all-grid">
          ${tvRes.map((m,i) => buildAnimeCard(m, i+1, 'tv')).join('')}
        </div>` : ''}
    </div>`;
}
function studioGoBack() {
  const hero = document.getElementById('heroSection');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.bnav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('homePage').classList.add('active');
  document.getElementById('bnavOtaku').classList.add('active');
  if (hero) { hero.style.display = ''; hero.style.visibility = ''; }
  document.getElementById('studioBar').style.display = 'block';
  document.getElementById('newsSection').style.display = 'block';
  document.getElementById('newsSectionTitle').textContent = '📰 أخبار الأنمي';
  window.scrollTo(0, 0);
}
async function loadOtakuHero() {
  const movies = await fetchMovies('/discover/tv', {
    type: 'tv', limit: CONFIG.HERO.LIMIT, requirePoster: true,
    params: { with_genres:'16', with_origin_country:'JP', sort_by:'popularity.desc' }
  });
  const wrapper = document.getElementById('heroSwiperWrapper');
  if (!wrapper || !movies.length) return;
  wrapper.innerHTML = movies.map(m => {
    const poster = `${CONFIG.IMAGES.POSTER_XL}${m.poster_path}`;
    return `<div class="swiper-slide hero-swiper-slide" onclick="openDetail(${m.id},'tv')">
      <img src="${poster}" alt="${m.name||''}" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
    </div>`;
  }).join('');
  if (heroSwiper) { heroSwiper.destroy(true,true); heroSwiper=null; }
  heroSwiper = new Swiper('#heroSwiper', {
    effect:'coverflow', grabCursor:true, centeredSlides:true,
    slidesPerView:1.5, spaceBetween:20, loop:true,
    autoplay:{delay:5000,disableOnInteraction:false}, speed:400,
    coverflowEffect:{rotate:50,stretch:-100,depth:400,modifier:1,slideShadows:false},
    on:{
      init: function(){ updateHeroInfo(movies, 0); },
      slideChange: function(){ updateHeroInfo(movies, this.realIndex); }
    }
  });
}
async function loadHomePage() {
  const page = document.getElementById('homePage');
  if (!page) return;

  const SECTIONS = [
    { id: 'sec_popular',  title: 'الأفلام الرائجة',   endpoint: '/movie/popular',   type: 'movie' },
    { id: 'sec_toprated', title: 'الأعلى تقييماً',    endpoint: '/movie/top_rated', type: 'movie' },
    { id: 'sec_tvseries', title: 'أحدث المسلسلات',    endpoint: '/tv/popular',      type: 'tv'    },
    { id: 'sec_upcoming', title: '🎬 قادم قريباً', endpoint: '/discover/movie', type: 'movie', params: { 'primary_release_date.gte': new Date().toISOString().slice(0,10), sort_by: 'primary_release_date.asc', region: 'US' } },
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
  document.getElementById('newsSection').style.display = 'none';
  document.getElementById('studioBar').style.display = 'none';
  const page = document.getElementById('detailPage');
  if (!page) return;

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.bnav-btn').forEach(b => b.classList.remove('active'));
  page.classList.add('active');
  const hero = document.getElementById('heroSection');
  if (hero) hero.style.display = 'none';
  window.scrollTo(0, 0);
  page.style.backgroundImage = '';
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

    const trailer = (videos.results || []).find(v => v.type === CONFIG.VIDEO.TRAILER_TYPE && v.site === 'YouTube')
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
              <img data-src="${a.profile_path ? CONFIG.IMAGES.PROFILE+a.profile_path : CONFIG.IMAGES.PLACEHOLDER}"
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
    const tvSeasons = type === 'tv' ? (detail.seasons||[]).filter(s=>s.season_number>0 && s.name!=='Specials') : [];
    const totalEps = tvSeasons.reduce((sum,s)=>sum+(s.episode_count||0),0);
    const network = detail.networks?.[0]?.name || '';
    const status = detail.status === 'Returning Series' ? '🟢 مستمر' : detail.status === 'Ended' ? '🔴 منتهي' : detail.status || '';
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
            ${tvSeasons.map(s=>`<option value="${s.season_number}">الموسم ${s.season_number} · ${s.episode_count} ح</option>`).join('')}
          </select>
        </div>
        <div class="eps-header-bar">
          <button class="eps-view-all-btn" onclick="openAllEpsTMDB(${id},${tvSeasons[0]?.season_number||1})">عرض الكل ›</button>
        </div>
        <div class="swiper eps-swiper" id="epsSwiper_${id}">
          <div class="swiper-wrapper" id="epsWrap_${id}">
            <div class="loading" style="padding:16px">⏳</div>
          </div>
        </div>
        ${(network||totalEps||status) ? `
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">
          ${status?`<span class="detail-badge">${status}</span>`:''}
          ${network?`<span class="detail-badge">📡 ${network}</span>`:''}
          ${totalEps?`<span class="detail-badge">🎬 ${totalEps} حلقة</span>`:''}
        </div>` : ''}
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
async function openAllEps(tvId, seasonNum) {
  const page = document.getElementById('detailPage');
  if (!page) return;
  page.innerHTML = '<div class="loading">⏳ جاري تحميل الحلقات...</div>';
  try {
    const data = await fetch(buildTMDBUrl(`/tv/${tvId}/season/${seasonNum}`)).then(r=>r.json());
    page.innerHTML = `
      <div class="all-eps-page">
        <div class="all-eps-header">
          <button class="detail-back-btn" onclick="openDetail(${tvId},'tv')">← رجوع</button>
          <h2 class="all-eps-title">📺 الموسم ${seasonNum} — ${data.episodes?.length||0} حلقة</h2>
        </div>
        <div class="all-eps-grid">
          ${(data.episodes||[]).map(e=>`
            <div class="all-ep-card" onclick="openWatchPage(${tvId},'tv',${seasonNum},${e.episode_number})">
              <div class="all-ep-thumb-wrap">
                <img src="${e.images?.jpg?.image_url||tmdbStills[e.episode_id||i+1]||CONFIG.IMAGES.PLACEHOLDER}"
                     onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'" class="all-ep-thumb">
                <div class="ep-num-badge">ح ${e.episode_number}</div>
                <div class="all-ep-play">▶</div>
              </div>
              <div class="all-ep-info">
                <div class="all-ep-title">${(e.name||'').slice(0,32)}</div>
                <div class="all-ep-overview">${(e.overview||'').slice(0,90)}</div>
              </div>
            </div>`).join('')}
        </div>
      </div>`;
  } catch { page.innerHTML = '<div class="loading">⚠️ خطأ في تحميل الحلقات</div>'; }
}
async function loadSeasonEps(tvId, seasonNum) {
  const wrap = document.getElementById(`epsWrap_${tvId}`);
  if (!wrap) return;
  wrap.style.opacity = '0';
  wrap.style.transform = 'translateX(30px)';
  wrap.innerHTML = '<div class="loading" style="padding:16px">⏳</div>';
  try {
    const data = await fetch(buildTMDBUrl(`/tv/${tvId}/season/${seasonNum}`)).then(r=>r.json());
    const poster = data.poster_path ? `${CONFIG.IMAGES.POSTER_MD}${data.poster_path}` : '';
    if (poster) {
      const dp = document.getElementById('detailPage');
      if (dp) { dp.style.backgroundImage = `linear-gradient(to bottom, rgba(0,0,0,0.7), #080000), url('${poster}')`; dp.style.backgroundSize = 'cover'; }
    }
    wrap.innerHTML = (data.episodes||[]).map(e=>`
      <div class="swiper-slide ep-card" onclick="openWatchPage(${tvId},'tv',${seasonNum},${e.episode_number})">
        <div class="ep-thumb-wrap">
          <img data-src="${e.still_path?CONFIG.IMAGES.STILL_MD+e.still_path:CONFIG.IMAGES.PLACEHOLDER}"
               src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
               class="lazy-img ep-thumb" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
          <div class="ep-num-badge">ح ${e.episode_number}</div>
        </div>
        <div class="ep-info">
          <div class="ep-title">${(e.name||'').slice(0,28)}</div>
          <div class="ep-overview">${(e.overview||'').slice(0,80)}</div>
        </div>
      </div>`).join('');
    setTimeout(() => {
      wrap.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      wrap.style.opacity = '1';
      wrap.style.transform = 'translateX(0)';
    }, 50);
    const o2 = new IntersectionObserver(en=>{en.forEach(e=>{if(e.isIntersecting){e.target.src=e.target.dataset.src;o2.unobserve(e.target);}});});
    wrap.querySelectorAll('.lazy-img').forEach(i=>o2.observe(i));
    if(window.Swiper) new Swiper(`#epsSwiper_${tvId}`,{slidesPerView:2.3,spaceBetween:10,freeMode:true,grabCursor:true});
  } catch{ wrap.innerHTML='<div class="loading">⚠️ خطأ</div>'; }
}
function playTrailer(key) {
  const overlay = document.getElementById('trailerOverlay');
  const frame   = document.getElementById('trailerFrame');
  if (!overlay || !frame) return;
  frame.src = `${CONFIG.VIDEO.YOUTUBE_NOCOOKIE}${key}?autoplay=1&rel=0&modestbranding=1`;
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

const animeParams = '&lang=ja&audio=ja&dubbed=false&dub=false';
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
  { icon:'💠', name:'EMBED',   desc:'#23',    url:`${S.ANIME23}${id}/${season}/${episode}${animeParams}`  },
  { icon:'🎐', name:'SAKURA',  desc:'#24', url:`${S.ANIME24}${id}/${season}/${episode}` },
  { icon:'🌊', name:'TSUNAMI', desc:'#25', url:`${S.ANIME25}${id}&s=${season}&e=${episode}` },
  { icon:'🔥', name:'INFERNO', desc:'#26', url:`${S.ANIME26}${id}/${season}/${episode}` },
  { icon:'⚔️', name:'KATANA',  desc:'#27', url:`${S.ANIME27}${id}/${season}/${episode}` },
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
  { icon:'🎬', name:'PRIME',   desc:'#01 رئيسي',   url:`${S.MOV}${id}`,              active:true },
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
  { icon:'🎖', name:'SIGMA',   desc:'#23',        url:`${S.MOV23}${id}` },
  { icon:'🌠', name:'NEXUS-X', desc:'#24 4K',     url:`${S.MOV24}${id}` },
  { icon:'💠', name:'EMBED',   desc:'#25',        url:`${S.MOV25}${id}` },
  { icon:'🎴', name:'RONIN',   desc:'#26',        url:`${S.ANIME26}${id}/${season}/${episode}` },
  { icon:'🌺', name:'HANABI',  desc:'#27',        url:`${S.ANIME27}${id}/${season}/${episode}` },
  { icon:'🏯', name:'SHOGUN',  desc:'#28',        url:`${S.ANIME28}${id}/${season}/${episode}` },
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
          <iframe id="wsFrame" class="ws-frame" src="" 
          allowfullscreen
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture; web-share; clipboard-write; gyroscope; accelerometer"
          referrerpolicy="no-referrer-when-downgrade"
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
function libKey(base) {
  const uid = window.ROX_USER?.uid || 'guest';
  return `${base}_${uid}`;
}
function getLib(key) {
  try { return JSON.parse(localStorage.getItem(libKey(key)) || '[]'); } catch { return []; }
}
function saveLib(key, arr) {
  localStorage.setItem(libKey(key), JSON.stringify(arr));
}
function addToWatchlist(id, type) {
  if (!window.ROX_USER) { showToast('🔐 سجّل دخولك أولاً'); bnavGo('profile'); return; }
  const list = getLib('rox_watchlist');
  if (list.find(i => i.id === id)) { showToast('✅ موجود في قائمتك مسبقاً'); return; }
  list.unshift({ id, type, addedAt: Date.now() });
  saveLib('rox_watchlist', list);
  showToast('❤️ تمت الإضافة إلى قائمتك');
}
function addToWatchLater(id, type) {
  if (!window.ROX_USER) { showToast('🔐 سجّل دخولك أولاً'); bnavGo('profile'); return; }
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
function loadProfilePage() {
  const page = document.getElementById('profilePage');
  const user = window.ROX_USER;
  if (!user) {
    page.innerHTML = `
      <div class="prof-wrap">
        <div class="prof-logo">Cinema<span style="color:var(--accent)">ROX</span></div>
        <p class="prof-sub">سجّل دخولك لحفظ مكتبتك عبر أجهزتك</p>
        <button class="prof-google-btn" onclick="roxSignIn()">
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.1l-6.2-5.2C29.3 35.5 26.7 36.5 24 36.5c-5.2 0-9.6-3.3-11.2-8H6.4C9.8 36.8 16.4 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6.2 5.2C36.9 39.3 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/>
          </svg>
          تسجيل الدخول بـ Google
        </button>
      </div>`;
  } else {
    const lang    = localStorage.getItem('rox_lang')    || 'ar';
    const subSize = localStorage.getItem('rox_sub_size')|| 'md';
    const subClr  = localStorage.getItem('rox_sub_color')|| '#ffffff';
    page.innerHTML = `
      <div class="prof-wrap">
        <div class="prof-avatar-wrap">
          <img class="prof-avatar" src="${user.photoURL}" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
        </div>
        <div class="prof-name">${user.displayName}</div>
        <div class="prof-email">${user.email}</div>

        <div class="prof-settings">
          <div class="prof-hud">
            <div class="prof-hud-title"><svg class="hud-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> اللغة</div>
            <div class="prof-hud-row">
              <button class="prof-pill ${lang==='ar'?'active':''}" onclick="setLang('ar',this)">العربية</button>
              <button class="prof-pill ${lang==='en'?'active':''}" onclick="setLang('en',this)">English</button>
            </div>
          </div>
          <div class="prof-hud">
            <div class="prof-hud-title"><svg class="hud-icon" viewBox="0 0 24 24"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg> حجم الترجمة</div>
            <div class="prof-hud-row">
              <button class="prof-pill ${subSize==='sm'?'active':''}" onclick="setSubSize('sm',this)">صغير</button>
              <button class="prof-pill ${subSize==='md'?'active':''}" onclick="setSubSize('md',this)">متوسط</button>
              <button class="prof-pill ${subSize==='lg'?'active':''}" onclick="setSubSize('lg',this)">كبير</button>
            </div>
          </div>
          <div class="prof-hud">
            <div class="prof-hud-title"><svg class="hud-icon" viewBox="0 0 24 24"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg> لون الترجمة</div>
            <div class="prof-hud-row">
              <button class="prof-pill ${subClr==='#ffffff'?'active':''}" style="color:#fff"   onclick="setSubColor('#ffffff',this)">أبيض</button>
              <button class="prof-pill ${subClr==='#ffff00'?'active':''}" style="color:#ff0"   onclick="setSubColor('#ffff00',this)">أصفر</button>
              <button class="prof-pill ${subClr==='#00e5ff'?'active':''}" style="color:#00e5ff" onclick="setSubColor('#00e5ff',this)">سيان</button>
            </div>
          </div>
          <div class="prof-hud">
            <div class="prof-hud-title"><svg class="hud-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg> مزامنة الحسابات</div>
            <div class="prof-hud-row" id="traktHudRow">
              ${localStorage.getItem('trakt_token')
                ? `<span style="color:#00e5ff;font-size:0.78rem;font-weight:700">🟢 متصل بـ Trakt</span>
                   <button class="prof-pill" style="color:#ff6b6b" onclick="traktDisconnect()">قطع الاتصال</button>`
                : `<button class="prof-pill active" onclick="traktConnect()">🔗 ربط Trakt TV</button>`}
            </div>
          </div>
          <div class="prof-hud">
            <div class="prof-hud-title"><svg class="hud-icon" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> مكتبتي</div>
            <div class="prof-hud-row">
              <button class="prof-pill" onclick="bnavGo('library')">عرض المكتبة</button>
              <button class="prof-pill" style="color:#ff6b6b;border-color:rgba(229,9,20,0.4)" onclick="clearLibraryConfirm()">🗑 مسح الكل</button>
            </div>
          </div>
        </div>
        <button class="prof-signout" onclick="roxSignOut()">تسجيل الخروج</button>
      </div>`;
  }
}
function clearLibraryConfirm() {
  if (confirm('⚠️ هل تريد مسح المكتبة كاملاً؟')) {
    saveLib('rox_watchlist', []);
    saveLib('rox_watchlater', []);
    showToast('🗑 تم مسح المكتبة');
  }
}
function setLang(lang,btn){ btn.closest('.prof-hud-row').querySelectorAll('.prof-pill').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); localStorage.setItem('rox_lang',lang); }
function setSubSize(size,btn){ btn.closest('.prof-hud-row').querySelectorAll('.prof-pill').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); localStorage.setItem('rox_sub_size',size); }
function setSubColor(color,btn){ btn.closest('.prof-hud-row').querySelectorAll('.prof-pill').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); localStorage.setItem('rox_sub_color',color); }
async function loadLibraryPage() {
  const page = document.getElementById('libraryPage');
  if (!page) return;
  if (!window.ROX_USER) {
    page.innerHTML = `<div class="prof-wrap"><div class="prof-logo">Cinema<span style="color:var(--accent)">ROX</span></div><p class="prof-sub">🔐 سجّل دخولك لعرض مكتبتك</p><button class="prof-google-btn" onclick="bnavGo('profile')">تسجيل الدخول</button></div>`;
    return;
  }
  page.innerHTML = '<div class="loading">⏳ جاري تحميل المكتبة...</div>';

  const watchlist  = getLib('rox_watchlist');
  const watchlater = getLib('rox_watchlater');
  const cwItems    = cwGetAll();
  const traktCol   = getLib('trakt_collection');
  const traktWl    = getLib('trakt_watchlist');
  const EMPTY = `<p class="lib-radar-empty">الرادار فارغ حالياً.. أضف تحفتك القادمة من الواجهة الرئيسية</p>`;

  const buildCard = (item, listKey) => {
    const delBtn = listKey ? `<button class="lib-del-btn" onclick="libRemove('${listKey}',${item.id},'${item.type}')">✕</button>` : '';
    return `<div class="lib-card" onclick="openDetail(${item.id},'${item.type === 'anime' ? 'tv' : item.type}')">
      <img class="lib-card-img" src="${item.poster||CONFIG.IMAGES.PLACEHOLDER}" loading="lazy" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
      <div class="lib-card-overlay"><span>▶</span></div>
      ${item.rating ? `<span class="lib-card-rating">${item.rating}</span>` : ''}
      ${delBtn}
    </div>`;
  };

  const fetchCards = async (items, listKey = '') => {
    if (!items.length) return EMPTY;
    const cards = await Promise.all(items.map(async item => {
      try {
        const ep = (item.type === 'tv' || item.type === 'anime') ? `/tv/${item.id}` : `/movie/${item.id}`;
        const d  = await fetch(buildTMDBUrl(ep)).then(r => r.json());
        item.poster = d.poster_path ? `${CONFIG.IMAGES.POSTER_SM}${d.poster_path}` : CONFIG.IMAGES.PLACEHOLDER;
        item.rating = d.vote_average ? d.vote_average.toFixed(1) : '';
        return buildCard(item, listKey);
      } catch { return ''; }
    }));
    return `<div class="lib-grid">${cards.join('')}</div>`;
  };

  const buildSection = (laserClass, iconClass, iconSVG, title, html, listKey, allItems) => {
    const showAllBtn = allItems.length > 12
      ? `<button class="browse-all-btn" onclick="libShowAll('${listKey}')">عرض الكل (${allItems.length}) ›</button>`
      : '';
    return `
    <div class="lib-section">
      <div class="lib-sec-head">
        <span class="lib-laser ${laserClass}"></span>
        <span class="lib-icon3d ${iconClass}">${iconSVG}</span>
        <h3 class="lib-sec-title">${title}</h3>
        ${showAllBtn}
      </div>
      ${html}
    </div>`;
  };

  const cwHTML = cwItems.length ? `<div class="lib-grid">${cwItems.map(i =>
    `<div class="lib-card" onclick="cwResume(${i.id},'${i.type}',${i.seconds},'${i.server}','${i.serverUrl||''}')">
      <img class="lib-card-img" src="${i.poster}" loading="lazy" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
      <div class="lib-card-overlay"><span>▶</span></div>
      <div class="lib-card-bar"><div class="lib-card-progress" style="width:${Math.min(i.seconds/7200*100,100).toFixed(1)}%"></div></div>
      <button class="lib-del-btn" onclick="cwRemove(${i.id},'${i.type}')">✕</button>
    </div>`).join('')}</div>` : EMPTY;

  // جلب البيانات
  const wlSlice  = watchlist.slice(0, 12);
  const wlrSlice = watchlater.slice(0, 12);
  const tColSlice = traktCol.slice(0, 12);
  const tWlSlice  = traktWl.slice(0, 12);

  const [wlHTML, wlrHTML, tColHTML, tWlHTML] = await Promise.all([
    fetchCards(wlSlice,  'rox_watchlist'),
    fetchCards(wlrSlice, 'rox_watchlater'),
    fetchCards(tColSlice, 'trakt_collection'),
    fetchCards(tWlSlice,  'trakt_watchlist'),
  ]);

  const svgArchive = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`;
  const svgClock   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
  const svgPlay    = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>`;
  const svgTrakt   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`;

  const hasTrakt = localStorage.getItem('trakt_token');

  page.innerHTML = `
    <div class="lib-header"><h2 class="lib-title">مكتبتي</h2></div>
    ${buildSection('lib-laser-magenta','lib-icon3d-magenta', svgArchive, 'أرشيفي الخاص',   wlHTML,  'rox_watchlist',  watchlist)}
    ${buildSection('lib-laser-cyan',   'lib-icon3d-cyan',    svgClock,   'قائمة الانتظار', wlrHTML, 'rox_watchlater', watchlater)}
    ${buildSection('lib-laser-orange', 'lib-icon3d-orange',  svgPlay,    'أكمل المشاهدة',  cwHTML,  '',               cwItems)}
    ${hasTrakt && traktCol.length ? buildSection('lib-laser-magenta','lib-icon3d-magenta', svgTrakt, '📦 Trakt — مجموعتي', tColHTML, 'trakt_collection', traktCol) : ''}
    ${hasTrakt && traktWl.length  ? buildSection('lib-laser-cyan',   'lib-icon3d-cyan',    svgTrakt, '🕐 Trakt — قائمة المشاهدة', tWlHTML, 'trakt_watchlist', traktWl) : ''}
  `;
}
const TRAKT_CLIENT = CONFIG.KEYS.TRAKT;
const TRAKT_REDIRECT = location.origin + location.pathname;
async function libShowAll(listKey) {
  const page = document.getElementById('libraryPage');
  const items = getLib(listKey);
  page.innerHTML = '<div class="loading">⏳ جاري التحميل...</div>';
  const cards = await Promise.all(items.map(async item => {
    try {
      const ep = (item.type==='tv'||item.type==='anime') ? `/tv/${item.id}` : `/movie/${item.id}`;
      const d  = await fetch(buildTMDBUrl(ep)).then(r=>r.json());
      const poster = d.poster_path ? `${CONFIG.IMAGES.POSTER_SM}${d.poster_path}` : CONFIG.IMAGES.PLACEHOLDER;
      const rating = d.vote_average ? d.vote_average.toFixed(1) : '';
      return `<div class="lib-card" onclick="openDetail(${item.id},'${item.type==='anime'?'tv':item.type}')">
        <img class="lib-card-img" src="${poster}" loading="lazy" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
        <div class="lib-card-overlay"><span>▶</span></div>
        ${rating?`<span class="lib-card-rating">${rating}</span>`:''}
        <button class="lib-del-btn" onclick="libRemove('${listKey}',${item.id},'${item.type}')">✕</button>
      </div>`;
    } catch { return ''; }
  }));
  page.innerHTML = `
    <div style="padding:16px">
      <button class="detail-btn" onclick="loadLibraryPage()" style="margin-bottom:16px">← رجوع</button>
      <h2 style="color:#fff;margin-bottom:16px">${items.length} عنصر</h2>
      <div class="lib-grid">${cards.join('')}</div>
    </div>`;
}
function traktConnect() {
  const url = `https://trakt.tv/oauth/authorize?response_type=code&client_id=${TRAKT_CLIENT}&redirect_uri=${encodeURIComponent(TRAKT_REDIRECT)}`;
  window.location.href = url;
}
function traktDisconnect() {
  localStorage.removeItem('trakt_token');
  showToast('🔌 تم قطع الاتصال بـ Trakt');
  loadProfilePage();
}
async function traktHandleCallback() {
  const code = new URLSearchParams(location.search).get('code');
  if (!code) return;
  try {
    const res = await fetch('https://api.trakt.tv/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code, client_id: TRAKT_CLIENT,
        client_secret: '', grant_type: 'authorization_code',
        redirect_uri: TRAKT_REDIRECT
      })
    });
    const data = await res.json();
    if (data.access_token) {
      localStorage.setItem('trakt_token', data.access_token);
      window.history.replaceState({}, '', location.pathname);
      showToast('✅ تم الربط بـ Trakt بنجاح!');
      traktLoadLibrary();
    }
  } catch { showToast('⚠️ فشل الاتصال بـ Trakt'); }
}
async function traktLoadLibrary() {
  const token = localStorage.getItem('trakt_token');
  if (!token) return;
  const H = {
    'trakt-api-key': TRAKT_CLIENT,
    'Authorization': `Bearer ${token}`,
    'trakt-api-version': '2',
    'Content-Type': 'application/json'
  };
  try {
    const [wlMovies, wlShows, colMovies, colShows] = await Promise.all([
      fetch('https://api.trakt.tv/users/me/watchlist/movies', { headers: H }).then(r=>r.json()),
      fetch('https://api.trakt.tv/users/me/watchlist/shows',  { headers: H }).then(r=>r.json()),
      fetch('https://api.trakt.tv/users/me/collection/movies',{ headers: H }).then(r=>r.json()),
      fetch('https://api.trakt.tv/users/me/collection/shows', { headers: H }).then(r=>r.json()),
    ]);

    const toMovie = i => ({ id: i.movie?.ids?.tmdb, type: 'movie' });
    const toShow  = i => ({ id: i.show?.ids?.tmdb,  type: 'tv'    });

    const wlItems  = [...(wlMovies||[]).map(toMovie), ...(wlShows||[]).map(toShow) ].filter(i=>i.id);
    const colItems = [...(colMovies||[]).map(toMovie), ...(colShows||[]).map(toShow)].filter(i=>i.id);

    // مسح القديم وحقن الجديد نظيف
    saveLib('trakt_watchlist',   wlItems);
    saveLib('trakt_collection',  colItems);

    showToast(`📥 ${wlItems.length + colItems.length} عنصر من Trakt`);
    if (document.getElementById('libraryPage')?.classList.contains('active')) loadLibraryPage();
  } catch(e) { showToast('⚠️ خطأ في جلب بيانات Trakt'); console.error(e); }
}
function addToLib(key, item) {
  const list = getLib(key);
  if (!list.find(i => i.id == item.id && i.type === item.type)) {
    list.push(item);
    saveLib(key, list);
  }
}
async function openAllEpsTMDB(id, season) {
  const page = document.getElementById('detailPage');
  if (!page) return;
  page.innerHTML = '<div class="loading">⏳ جاري تحميل الحلقات...</div>';
  try {
    const d = await fetch(buildTMDBUrl(`/tv/${id}/season/${season}`)).then(r=>r.json());
    const eps = d.episodes || [];
    page.innerHTML = `
      <div style="padding:16px">
        <button class="detail-btn" onclick="goBack()" style="margin-bottom:16px">← رجوع</button>
        <h2 style="color:#fff;margin-bottom:16px">الموسم ${season} — ${eps.length} حلقة</h2>
        <div class="otaku-all-grid">
          ${eps.map(e => {
            const img = e.still_path ? `${CONFIG.IMAGES.BACKDROP}${e.still_path}` : CONFIG.IMAGES.PLACEHOLDER;
            return `<div class="anime-card" onclick="openWatchPage(${id},'tv',${season},${e.episode_number})">
              <div class="anime-poster-wrap">
                <img class="anime-poster" src="${img}" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
                <div class="anime-overlay"><span>▶</span></div>
                <span class="rank-number">${e.episode_number}</span>
              </div>
              <div class="anime-title-bar">${(e.name||'حلقة '+e.episode_number).slice(0,22)}</div>
            </div>`;
          }).join('')}
        </div>
      </div>`;
  } catch { page.innerHTML = '<div class="loading">⚠️ خطأ في تحميل الحلقات</div>'; }
}
traktHandleCallback();
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
  cwRender();
});
async function loadNewsSection(containerId, feedUrl, color) {
  const sec = document.getElementById('newsSection');
  const el  = document.getElementById(containerId);
  if (!el || !sec) return;
  sec.style.display = 'block';
  sec.style.position = 'relative';
  sec.style.zIndex = '1';
  el.innerHTML = '<p class="lib-empty">⏳ جاري تحميل الأخبار...</p>';
  try {
    const res  = await fetch(CONFIG.NEWS.PROXY + encodeURIComponent(feedUrl));
    const data = await res.json();
    if (!data.items || !data.items.length) throw new Error();
    el.innerHTML = data.items.slice(0, 6).map(item => `
      <a class="news-card news-${color}" href="${item.link}" target="_blank" rel="noopener">
        ${item.thumbnail ? `<img class="news-thumb" src="${item.thumbnail}" onerror="this.style.display='none'">` : ''}
        <div class="news-body">
          <div class="news-title">${item.title}</div>
          <div class="news-meta">${(item.pubDate||'').slice(0,10)}</div>
        </div>
      </a>`).join('');
  } catch { el.innerHTML = '<p class="lib-empty">⚠️ تعذّر تحميل الأخبار</p>'; }
}
