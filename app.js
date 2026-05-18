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
function testNotifAlert() {
  const btn = document.querySelector('.notif-test-btn');
  const alerts = getLib('rox_alerts');
  if (!alerts.length) { showToast('لا يوجد مسلسلات مشترك فيها بعد'); return; }
  const item = alerts[0];
  if (btn) {
    btn.disabled = true;
    btn.textContent = '⏳ 5...';
    let count = 5;
    const timer = setInterval(() => {
      count--;
      if (btn) btn.textContent = `⏳ ${count}...`;
      if (count <= 0) {
        clearInterval(timer);
        addNotif(
          item.title,
          'اختبار — الموسم 1 · الحلقة 1',
          ''
        );
        if (btn) {
          btn.disabled = false;
          btn.textContent = '✅ وصل!';
          setTimeout(() => {
            if (btn) btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><circle cx="12" cy="8" r="1" fill="currentColor"/></svg>تجربة`;
          }, 2000);
        }
      }
    }, 1000);
  }
}
function unmuteTrailer(id) {
  const frame = document.getElementById(`dpTrailerFrame_${id}`);
  const overlay = document.getElementById(`unmuteOverlay_${id}`);
  if (frame) { frame.src = frame.src.replace('mute=1', 'mute=0'); }
  if (overlay) { overlay.style.opacity='0'; setTimeout(()=>overlay.style.display='none',400); }
}

function goBack() {
  if (window._trailerTimer) { clearTimeout(window._trailerTimer); window._trailerTimer = null; }
  if (window._activeTrailerFrame) { window._activeTrailerFrame.src = ''; window._activeTrailerFrame = null; }
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
    const _ap = getProgress(malId);
    const watchBtn = `<button class="detail-btn detail-btn-now" onclick="openWatchPageAnime(${tmdbId||0},${malId},1,${_ap?_ap.episode+1:1})">▶ ${_ap?`أكمل المشاهدة: الحلقة ${_ap.episode+1}`:'شاهد الآن — الحلقة 1'}</button>`;
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
              <div class="stat-cap stat-gold"><svg class="stat-ico" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg><span>${score}</span></div>
              <div class="stat-cap stat-views"><svg class="stat-ico" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg><span>${(a.members||0).toLocaleString()}</span></div>
            </div>
            <div class="detail-meta">
              ${eps?`<span class="detail-badge"><svg class="stat-ico" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>${eps} حلقة</span>`:''}
              ${status?`<span class="detail-badge detail-rating"><svg class="stat-ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${status}</span>`:''}
              ${studios?`<span class="detail-badge"><svg class="stat-ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>${studios}</span>`:''}
            </div>
            </div>
            <div class="detail-genres">${genres}</div>
            <div class="detail-actions">
              ${watchBtn}${trailerBtn}
              <button class="detail-btn detail-btn-watch" onclick="addToWatchlist(${malId},'anime')">❤️ قائمتي</button>
              <button class="detail-btn detail-btn-alert dp-btn-share" id="shareBtn_${malId}" onclick="shareContent(${malId},'${a.title}','anime')">
  <svg style="width:14px;height:14px;vertical-align:middle;margin-left:4px" viewBox="0 0 24 24">
    <defs><linearGradient id="sga_${malId}" x1="10%" y1="0%" x2="90%" y2="100%"><stop offset="0%" stop-color="#e0aaff"/><stop offset="100%" stop-color="#6b21a8"/></linearGradient></defs>
    <circle cx="18" cy="5"  r="3" fill="url(#sga_${malId})"/><circle cx="16.8" cy="4"  r="0.9" fill="rgba(255,255,255,0.5)"/>
    <circle cx="6"  cy="12" r="3" fill="url(#sga_${malId})"/><circle cx="4.8"  cy="11" r="0.9" fill="rgba(255,255,255,0.5)"/>
    <circle cx="18" cy="19" r="3" fill="url(#sga_${malId})"/><circle cx="16.8" cy="18" r="0.9" fill="rgba(255,255,255,0.5)"/>
    <line x1="8.6" y1="10.5" x2="15.4" y2="6.5"  stroke="#c084fc" stroke-width="1.6" stroke-linecap="round"/>
    <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" stroke="#c084fc" stroke-width="1.6" stroke-linecap="round"/>
  </svg> مشاركة
</button>
          <button class=\"detail-btn detail-btn-alert ${getLib('rox_alerts').find(i=>i.id===(tmdbId||malId))?'active':''}\" style=\"${getLib('rox_alerts').find(i=>i.id===(tmdbId||malId))?'color:#1ce783;border-color:rgba(28,231,131,0.7);box-shadow:0 0 14px rgba(28,231,131,0.3)':''}\" id=\"alertBtn_${tmdbId||malId}\" onclick=\"toggleAlertSubscription(${tmdbId||malId},'${a.title}','tv')\"><span class=\"btn-bell-ico\"></span> ${getLib('rox_alerts').find(i=>i.id===(tmdbId||malId))?'مشترك التنبيهات':'تنبيه بالحلقات'}</button>            </div>
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
                <div class="swiper-slide ep-card ${(() => { const p=getProgress(malId); return p && p.episode+1===(e.episode_id||i+1) ? 'ep-next-glow' : ''; })()}" onclick="saveProgress(${malId},1,${e.episode_id||i+1});openWatchPageAnime(-1,${malId},1,${e.episode_id||i+1})">
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
        <div class="detail-tabs-bar">
          ${episodes.length?`<button class="dtab active" onclick="switchTab(this,'tab-eps-a')">الحلقات</button>`:''}
          <button class="dtab ${!episodes.length?'active':''}" onclick="switchTab(this,'tab-about-a')">عن العمل</button>
          <button class="dtab" onclick="switchTab(this,'tab-trailers-a')">العروض الترويجية</button>
        </div>
        <div id="tab-eps-a" class="dtab-content ${episodes.length?'active':''}">
        </div>
        <div id="tab-about-a" class="dtab-content ${!episodes.length?'active':''}">
          <div class="detail-section">
            <p class="detail-overview">${synopsis}</p>
          </div>
        </div>
        <div id="tab-trailers-a" class="dtab-content"></div>
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
<video id="roxPlayer" class="ws-player" controls playsinline style="display:none"></video>
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
    ratingEl.innerHTML = rating ? `<span class="hero-cap hero-cap-rating"><svg width="11" height="11" viewBox="0 0 24 24" fill="var(--gold)" style="vertical-align:middle;margin-left:3px"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>${rating}</span>` : '';
  }
}
    function buildMovieCard(movie, type = 'movie', extraClass = '', rank = 0) {
  const title  = type === 'movie'
    ? (movie.title || movie.original_title)
    : (movie.name  || movie.original_name);
  const _imgs = [
    movie.backdrop_path ? `${CONFIG.IMAGES.BACKDROP}${movie.backdrop_path}` : null,
    movie.poster_path   ? `${CONFIG.IMAGES.POSTER_XL}${movie.poster_path}`  : null,
  ].filter(Boolean);
  const poster = movie.poster_path ? `${CONFIG.IMAGES.POSTER_XL}${movie.poster_path}` : (movie.backdrop_path ? `${CONFIG.IMAGES.BACKDROP}${movie.backdrop_path}` : CONFIG.IMAGES.PLACEHOLDER);
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '';
  const year   = (movie.release_date || movie.first_air_date || '').slice(0,4);
  const typeLabel = type === 'tv' ? 'SERIES' : 'MOVIE';
  return `
  <div class=\"movie-card ${extraClass}\" data-id=\"${movie.id}\" data-type=\"${type}\" onclick=\"openDetail(this.dataset.id,this.dataset.type)\">\n
    <div class="movie-poster-wrap">
      ${rank > 0 ? `<span class="rank-number">${rank}</span>` : ''}
      <img class="movie-poster fade-img" src="${poster}" alt="${title}" loading="lazy"
           onload="this.classList.add('loaded')"
           onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}';this.classList.add('loaded')">
      <div class="movie-overlay"><span class="play-icon">▶</span></div>
    </div>
    <div class="movie-title-bar">${title.length > 28 ? title.slice(0,28)+'...' : title}</div>
    <div class="movie-meta-bar"><span class="movie-badge-type">${typeLabel}</span><span class="movie-badge-year">${year}</span>${rating ? `<span class="movie-badge-rating"><svg width="9" height="9" viewBox="0 0 24 24" fill="var(--gold)"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> ${rating}</span>` : ''}</div>
  </div>`;
}
function buildAnimeCard(movie, rank = 0, type = 'tv') {
  const title = movie.name || movie.original_name || movie.title || '';
  const _imgs2 = [
    movie.backdrop_path ? `${CONFIG.IMAGES.BACKDROP}${movie.backdrop_path}` : null,
    movie.poster_path   ? `${CONFIG.IMAGES.POSTER_XL}${movie.poster_path}`  : null,
  ].filter(Boolean);
  const poster = movie.poster_path ? `${CONFIG.IMAGES.POSTER_XL}${movie.poster_path}` : (movie.backdrop_path ? `${CONFIG.IMAGES.BACKDROP}${movie.backdrop_path}` : CONFIG.IMAGES.PLACEHOLDER);
  const year = (movie.first_air_date || movie.release_date || '').slice(0,4);
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '';
  return `
    <div class="anime-card" onclick="openDetail(${movie.id},'${type}')">
      <div class="anime-poster-wrap">
        <img class="anime-poster fade-img" src="${poster}" loading="lazy"
             onload="this.classList.add('loaded')"
             onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}';this.classList.add('loaded')">
        <div class="anime-overlay"><span class="play-icon">▶</span></div>
        ${rank > 0 ? `<span class="rank-number">${rank}</span>` : ''}
      </div>
      <div class="anime-title-bar">${title.length > 22 ? title.slice(0,22)+'...' : title}</div>
      <div class="anime-meta-bar"><span class="anime-badge-type">أنمي</span><span class="anime-badge-year">${toArabicNums(year)}</span>${rating ? `<span class="anime-badge-rating"><svg width="9" height="9" viewBox="0 0 24 24" fill="var(--gold)"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> ${rating}</span>` : ''}</div>
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
        <button class="browse-all-btn" onclick="openBrowseAll('${s.type}','${s.endpoint}','${s.title}')">عرض الكل ›</button>
      </div>
      <div class="otaku-slider-wrap">
        <button class="otaku-arrow otaku-arrow-left" onclick="otakuSlide('${s.id}_row',-1)">‹</button>
        <div class="movies-row" id="${s.id}_row">
          ${Array(4).fill('<div class="movie-card skeleton-card"></div>').join('')}
        </div>
        <button class="otaku-arrow otaku-arrow-right" onclick="otakuSlide('${s.id}_row',1)">›</button>
      </div>
    </div>`).join('');

  // كل قسم يتحمل بشكل مستقل
  SECTIONS.forEach(async s => {
    try {
      const movies = await fetchMovies(s.endpoint, { type: s.type, params: s.params || {}, requireBackdrop: true });
      const row = document.getElementById(`${s.id}_row`);
      const container = document.getElementById(s.id);
      if (!row || !container) return;

      if (!movies.length) {
        container.remove();
        return;
      }
      row.innerHTML = movies.map((m, i) => buildMovieCard(m, s.type, s.cardClass || '', i + 1)).join('');
    } catch (e) {
      const container = document.getElementById(s.id);
      if (container) container.remove();
    }
  });
}
async function openBrowseAll(type, endpoint, title) {
  const page = document.getElementById('detailPage');
  if (!page) return;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('heroSection').style.display = 'none';
  document.getElementById('newsSection').style.display = 'none';
  document.getElementById('studioBar').style.display = 'none';
  page.classList.add('active');
  page.innerHTML = '<div class="loading">⏳ جاري التحميل...</div>';
  window.scrollTo(0, 0);
  const movies = await fetchMovies(endpoint, { type, limit: 30, requireBackdrop: true });
  page.innerHTML = `
    <div style="padding:16px">
      <button class="detail-btn" onclick="goBack()" style="margin-bottom:16px">← رجوع</button>
      <h2 style="color:#fff;margin-bottom:16px;font-size:1rem">${title}</h2>
      <div class="otaku-all-grid">
        ${movies.map((m, i) => buildMovieCard(m, type, '', i + 1)).join('')}
      </div>
    </div>`;
}
function extractDominantColor(imgUrl, callback) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 50; canvas.height = 50;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, 50, 50);
    const data = ctx.getImageData(0, 0, 50, 50).data;
    let r=0, g=0, b=0, count=0;
    for (let i=0; i<data.length; i+=16) {
      const pr=data[i], pg=data[i+1], pb=data[i+2];
      const brightness = (pr+pg+pb)/3;
      if (brightness > 30 && brightness < 220) {
        r+=pr; g+=pg; b+=pb; count++;
      }
    }
    if (count===0) { callback(null); return; }
    r=Math.round(r/count); g=Math.round(g/count); b=Math.round(b/count);
    const max=Math.max(r,g,b), min=Math.min(r,g,b);
    const boost = 1.4;
    r=Math.min(255,Math.round(r+(max-r)*boost));
    g=Math.min(255,Math.round(g+(max-g)*boost));
    b=Math.min(255,Math.round(b+(max-b)*boost));
    callback(`${r},${g},${b}`);
  };
  img.onerror = () => callback(null);
  img.src = imgUrl;
}

function applyDynamicColor(rgb) {
  if (!rgb) return;
  document.documentElement.style.setProperty('--dynamic-color', `rgb(${rgb})`);
  document.documentElement.style.setProperty('--dynamic-glow', `rgba(${rgb},0.45)`);
  const btn = document.querySelector('.dp-action-watch');
  const row2Btns = document.querySelectorAll('.dp-action-fav');
  const sections = document.querySelectorAll('.detail-section-title');
  if (btn) {
    btn.style.setProperty('background', `linear-gradient(135deg, rgb(${rgb}), rgba(${rgb},0.7))`, 'important');
    btn.style.setProperty('box-shadow', `0 4px 28px rgba(${rgb},0.55)`, 'important');
    btn.style.color = '#fff';
  }
  row2Btns.forEach(b => {
    b.style.borderColor = `rgba(${rgb},0.4)`;
    b.style.boxShadow = `0 0 12px rgba(${rgb},0.2)`;
  });
  sections.forEach(s => s.style.color = `rgb(${rgb})`);
  document.documentElement.style.setProperty('--dynamic-color', `rgb(${rgb})`);
  document.documentElement.style.setProperty('--dynamic-glow', `rgba(${rgb},0.45)`);
}
function calcSeasonEnd(detail) {
  const total = detail.number_of_episodes || 0;
  const aired = detail.last_episode_to_air?.episode_number || 0;
  const next  = detail.next_episode_to_air?.air_date || null;
  const remaining = total - aired;
  if (!total || !aired) return null;
  let endDate = null;
  if (next) {
    const d = new Date(next);
    d.setDate(d.getDate() + (remaining - 1) * 7);
    endDate = d.toLocaleDateString('ar-SA', { day:'numeric', month:'long', year:'numeric' });
  }
  return { total, aired, remaining, endDate, pct: Math.round((aired/total)*100) };
}
// ===== DETAIL PAGE =====
async function openDetail(id, type = 'movie') {
  window._lastDetailId = id;
  window._lastDetailType = type;
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
    const [dRes, vRes, cRes, rRes, simRes, recRes, imgRes, kwRes, wpRes] = await Promise.all([
      fetch(buildTMDBUrl(ep)),
      fetch(buildTMDBUrl(`${ep}/videos`)),
      fetch(buildTMDBUrl(`${ep}/credits`)),
      fetch(buildTMDBUrl(`${ep}/reviews`)),
      fetch(buildTMDBUrl(`${ep}/similar`)),
      fetch(buildTMDBUrl(`${ep}/recommendations`)),
      fetch(buildTMDBUrl(`${ep}/images`)),
      fetch(buildTMDBUrl(`${ep}/keywords`)),
      fetch(buildTMDBUrl(`${ep}/watch/providers`)),
    ]);
    const detail  = await dRes.json();
    const videos  = await vRes.json();
    const credits = await cRes.json();
    const revData = await rRes.json();
    const simData = await simRes.json();
    const recData = await recRes.json();
    const imgData = await imgRes.json();
    const kwData  = await kwRes.json();
    const wpData  = await wpRes.json();
    const keywords = (kwData.keywords || kwData.results || []).slice(0, 8);
    const providers = (wpData.results?.SA?.flatrate || wpData.results?.US?.flatrate || []).slice(0, 5);
    const galleryImgs = (imgData.backdrops || []).slice(0, 8).map(b => `${CONFIG.IMAGES.ORIGINAL}${b.file_path}`);
    const rawBackdrops = (imgData.backdrops || []).slice(0, 6).map(b => `${CONFIG.IMAGES.ORIGINAL}${b.file_path}`);
    const backdrops = rawBackdrops.length ? rawBackdrops : (detail.backdrop_path ? [`${CONFIG.IMAGES.ORIGINAL}${detail.backdrop_path}`] : [`${CONFIG.IMAGES.POSTER_XL}${detail.poster_path}`]);

    const trailer = (videos.results || []).find(v => v.type === CONFIG.VIDEO.TRAILER_TYPE && v.site === 'YouTube')
                 || (videos.results || [])[0];

    const backdrop = detail.backdrop_path
      ? `${CONFIG.IMAGES.ORIGINAL}${detail.backdrop_path}`
      : (detail.poster_path ? `${CONFIG.IMAGES.ORIGINAL}${detail.poster_path}` : '');

    const poster  = detail.poster_path
      ? `${CONFIG.IMAGES.POSTER_XL}${detail.poster_path}`
      : CONFIG.IMAGES.PLACEHOLDER;
    const tagline   = detail.tagline || '';
    const voteCount = detail.vote_count
      ? detail.vote_count.toLocaleString('ar-SA') : '';
    const title   = type === 'movie'
      ? (detail.title || detail.original_title)
      : (detail.name  || detail.original_name);
    const year    = (detail.release_date || detail.first_air_date || '').slice(0, 4);
    
    const rating  = detail.vote_average ? detail.vote_average.toFixed(1) : 'N/A';
    const director = (credits.crew||[]).find(c=>c.job==='Director');
    const awards = (detail.production_companies||[]).length ? [
      ...(detail.vote_average>=8?[{title:'أفضل تقييم جمهوري',org:'TMDB',year:year}]:[]),
      ...(detail.popularity>=100?[{title:'الأكثر شعبية',org:'Cinema ROX Charts',year:year}]:[]),
    ] : [];
    const whyWatch = [
      detail.overview?.length > 100 ? 'قصة عميقة ومحكمة البناء' : null,
      detail.vote_average >= 7.5 ? `تقييم عالٍ ${rating}/10 من الجمهور` : null,
      director ? `إخراج ${director.name}` : null,
      (detail.genres||[]).find(g=>['Action','Adventure','Science Fiction'].includes(g.name)) ? 'أكشن وإثارة لا تتوقف' : null,
      (detail.genres||[]).find(g=>['Drama','Romance'].includes(g.name)) ? 'أداء تمثيلي قوي ومؤثر' : null,
      (detail.genres||[]).find(g=>['Animation','Family'].includes(g.name)) ? 'مناسب للعائلة بالكامل' : null,
    ].filter(Boolean).slice(0,5);
    const voteHist = [10,9,8,7,6,5].map(s=>({
      star: s,
      pct: Math.max(1, Math.round((10-s+1)*8 + (detail.vote_average||5)*2 - s*3))
    }));
    const maxPct = Math.max(...voteHist.map(v=>v.pct));
    const runtime = detail.runtime
      ? `${detail.runtime} د`
      : (detail.episode_run_time?.[0] ? `${detail.episode_run_time[0]} د` : '');
    const genres  = (detail.genres || []).map(g => `<span class="detail-genre">${g.name}</span>`).join('');
    const overview= detail.overview || 'لا يوجد وصف متاح.';
    const cast    = (credits.cast || []).slice(0, 12);

    const castHTML = cast.length ? `
      <div class="detail-section">
        <h3 class="detail-section-title">🎭 طاقم التمثيل</h3>
        <div class="cast-slider">
          ${cast.map(a => `
            <div class="cast-card-wide">
              <div class="cast-img-wrap">
                <img data-src="${a.profile_path ? CONFIG.IMAGES.PROFILE+a.profile_path : CONFIG.IMAGES.PLACEHOLDER}"
                     src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
                     alt="${a.name}" class="lazy-img cast-img-wide"
                     onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
                <div class="cast-neon-border"></div>
              </div>
              <span class="cast-name-wide">${a.name}</span>
              <span class="cast-char-wide">${(a.character||'').slice(0,20)}</span>
            </div>`).join('')}
        </div>
      </div>` : '';

    const simItems = (simData.results||[]).filter(i=>i.poster_path).slice(0,12);
    const recItems = (recData.results||[]).filter(i=>i.poster_path).slice(0,12);
    const _mediaType = type;

    const buildPosterCard = (m, mediaT) => {
      const img = m.poster_path ? `${CONFIG.IMAGES.POSTER_LG}${m.poster_path}` : CONFIG.IMAGES.PLACEHOLDER;
      const y = (m.release_date||m.first_air_date||'').slice(0,4);
      const r = m.vote_average?m.vote_average.toFixed(1):'';
      return `<div class="pc-card" onclick="openDetail(${m.id},'${mediaT}')">
        <div class="pc-wrap">
          <img class="pc-img lazy-img" data-src="${img}" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
          <div class="pc-badges-top">
            ${y?`<span class="pc-badge-year">📅 ${y}</span>`:''}
            ${r?`<span class="pc-badge-rating">⭐ ${r}</span>`:''}
          </div>
          <div class="pc-hover-play">▶</div>
        </div>
      </div>`;
    };

    const similarHTML = simItems.length ? `
      <div class="detail-section">
        <h3 class="detail-section-title">أعمال مشابهة</h3>
        <div class="poster-slider">
          ${simItems.map(m => buildPosterCard(m, _mediaType)).join('')}
        </div>
      </div>` : '';

    const recommendedHTML = recItems.length ? `
      <div class="detail-section">
        <h3 class="detail-section-title">موصى به لك</h3>
        <div class="poster-slider">
          ${recItems.map(m => buildPosterCard(m, _mediaType)).join('')}
        </div>
      </div>` : '';
    const allRevs   = revData.results || [];
    const arRevs    = allRevs.filter(r => /[\u0600-\u06FF]/.test(r.content));
    const reviews   = (arRevs.length ? arRevs : allRevs).slice(0, 3);
    const tvSeasons = type === 'tv' ? (detail.seasons||[]).filter(s=>s.season_number>0 && s.name!=='Specials') : [];
    const totalEps = tvSeasons.reduce((sum,s)=>sum+(s.episode_count||0),0);
    const network = detail.networks?.[0]?.name || '';
    const status = detail.status === 'Returning Series' ? 'مستمر' : detail.status === 'Ended' ? 'منتهي' : detail.status || '';
const reviewsHTML = `
      <div class="detail-section">
        <h3 class="detail-section-title">التعليقات</h3>
        <div class="reviews-list">
          ${reviews.length ? reviews.map(r=>`
            <div class="review-card">
              <div class="review-author">${r.author}</div>
              <p class="review-content">${r.content.slice(0,300)}${r.content.length>300?'…':''}</p>
            </div>`).join('') :
            `<div class="review-empty">
              <p>لا توجد تعليقات متاحة لهذا المحتوى حتى الآن</p>
              <button class="review-cta-btn" onclick="showToast('ميزة المراجعات قادمة قريباً!')">كن أول من يترك مراجعة سينمائية وتوجيه نقدي</button>
            </div>`}
        </div>
      </div>`;

    const seasonsHTML = tvSeasons.length ? `
      <div class="seasons-glass">
        <div class="seasons-header">
          <h3 class="detail-section-title" style="margin:0">المواسم والحلقات</h3>
          <select class="season-select" onchange="loadSeasonEps(${id},+this.value)">
            ${tvSeasons.map(s=>`<option value="${s.season_number}">الموسم ${s.season_number} · ${s.episode_count} ح</option>`).join('')}
          </select>
        </div>
        <div class="eps-header-bar">
          <button class="eps-view-all-btn" onclick="openAllEpsTMDB(${id},${tvSeasons[0]?.season_number||1})">عرض الكل ›</button>
        </div>
        <div class="swiper eps-swiper" id="epsSwiper_${id}">
          <div class="swiper-wrapper" id="epsWrap_${id}">
            <div class="loading" style="padding:16px">...</div>
          </div>
        </div>
        ${(network||totalEps||status) ? `
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">
          ${status?`<span class="detail-badge">${status}</span>`:''}
          ${network?`<span class="detail-badge">${network}</span>`:''}
          ${totalEps?`<span class="detail-badge">${totalEps} حلقة</span>`:''}
        </div>` : ''}
      </div>` : '';
    const trailerKey = trailer?.key || '';
    const trailerBtn = trailerKey
      ? `<button class="detail-btn detail-btn-trailer" onclick="playTrailer('${trailerKey}')">▶ المقطع الدعائي</button>`
      : '';

    page.innerHTML = `
  <div class="dp-wrap">
    <div class="dp-bg-blur" style="background-image:url('${poster}')"></div>
    <div class="dp-bg-dim"></div>

    <button class="dp-back-btn" onclick="goBack()">← رجوع</button>

    <div class="dp-media-zone" id="dpMediaZone_${id}">
      <div class="dp-backdrops-slider" id="dpSlider_${id}">
        ${backdrops.map((b,i) => `<img class="dp-backdrop-slide ${i===0?'active':''}" src="${b}" alt="" style="object-position:center top">`).join('')}
      </div>
      ${trailer ? `<div class="dp-trailer-container" id="dpTrailerBox_${id}" style="display:none">
        <iframe id="dpTrailerFrame_${id}"
          src=""
          data-src="https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailer.key}&playsinline=1&rel=0&modestbranding=1"
          allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>
        <div class="trailer-unmute-overlay" id="unmuteOverlay_${id}" onclick="unmuteTrailer(${id})">
          <div class="trailer-unmute-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <line x1="23" y1="9" x2="17" y2="15"/>
              <line x1="17" y1="9" x2="23" y2="15"/>
            </svg>
            <span>اضغط لتشغيل الصوت</span>
          </div>
        </div>
      </div>` : ''}
      <div class="dp-trailer-fade"></div>
    </div>
    <div class="dp-poster-zone">
      <img class="dp-poster-img" src="${poster}"
           onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
    </div>

    <div class="dp-actions-wrap">
      ${trailer ? `<button class="dp-action-trailer" onclick="playTrailer('${trailerKey}')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="dp-act-svg"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        شاهد الإعلان
      </button>` : ''}
      <button class="dp-action-watch" id="mainWatchBtn_${id}"
        onclick="openWatchPage(${id},'${type}',${(() => {
          const p = getProgress(id);
          return p ? `${p.season},${p.episode + 1}` : `1,1`;
        })()})">
        <svg viewBox="0 0 24 24" fill="currentColor" class="dp-act-svg"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        ${(() => { const p = getProgress(id); return p ? `أكمل المشاهدة — ح${p.episode + 1}` : 'شاهد الآن'; })()}
      </button>
      <div class="dp-action-row2">
        <button class="dp-action-fav dp-btn-fav" data-id="${id}" onclick="addToWatchlist(${id},'${type}')">
          <svg class="dp-act-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <span>المفضلة</span>
        </button>
        <button class="dp-action-fav dp-btn-later" data-id="${id}" onclick="addToWatchLater(${id},'${type}')">
          <svg class="dp-act-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          <span>قائمتي</span>
        </button>
        ${type === 'movie' ? `
        <button class="dp-action-fav dp-btn-share" id="shareBtn_${id}" onclick="shareContent(${id},'${title}','${type}')">
          <svg class="dp-act-ico dp-share-ico" viewBox="0 0 24 24">
            <defs><linearGradient id="sg_${id}" x1="10%" y1="0%" x2="90%" y2="100%"><stop offset="0%" stop-color="#e0aaff"/><stop offset="50%" stop-color="#a855f7"/><stop offset="100%" stop-color="#6b21a8"/></linearGradient></defs>
            <circle cx="18" cy="5"  r="3"   fill="url(#sg_${id})"/><circle cx="16.8" cy="4"  r="1" fill="rgba(255,255,255,0.5)"/>
            <circle cx="6"  cy="12" r="3"   fill="url(#sg_${id})"/><circle cx="4.8"  cy="11" r="1" fill="rgba(255,255,255,0.5)"/>
            <circle cx="18" cy="19" r="3"   fill="url(#sg_${id})"/><circle cx="16.8" cy="18" r="1" fill="rgba(255,255,255,0.5)"/>
            <line x1="8.6" y1="10.5" x2="15.4" y2="6.5"  stroke="#c084fc" stroke-width="1.6" stroke-linecap="round"/>
            <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" stroke="#c084fc" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
          <span>مشاركة</span>
        </button>` : `
        <button class="dp-action-fav dp-btn-share" id="shareBtn_${id}" onclick="shareContent(${id},'${title}','${type}')">
          <svg class="dp-act-ico dp-share-ico" viewBox="0 0 24 24">
            <defs><linearGradient id="sg_${id}" x1="10%" y1="0%" x2="90%" y2="100%"><stop offset="0%" stop-color="#e0aaff"/><stop offset="50%" stop-color="#a855f7"/><stop offset="100%" stop-color="#6b21a8"/></linearGradient></defs>
            <circle cx="18" cy="5"  r="3"   fill="url(#sg_${id})"/><circle cx="16.8" cy="4"  r="1" fill="rgba(255,255,255,0.5)"/>
            <circle cx="6"  cy="12" r="3"   fill="url(#sg_${id})"/><circle cx="4.8"  cy="11" r="1" fill="rgba(255,255,255,0.5)"/>
            <circle cx="18" cy="19" r="3"   fill="url(#sg_${id})"/><circle cx="16.8" cy="18" r="1" fill="rgba(255,255,255,0.5)"/>
            <line x1="8.6" y1="10.5" x2="15.4" y2="6.5"  stroke="#c084fc" stroke-width="1.6" stroke-linecap="round"/>
            <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" stroke="#c084fc" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
          <span>مشاركة</span>
        </button>`}
        ${type === 'tv' ? `<button class="dp-action-fav dp-btn-alert ${getLib('rox_alerts').find(i=>String(i.id)===String(id))?'active':''}" id="alertBtn_${id}" data-title="${(title||'').replace(/'/g,'&#39;')}" onclick="toggleAlertSubscription(${id},this.dataset.title,'tv')">
          <svg class="dp-act-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span>${getLib('rox_alerts').find(i=>String(i.id)===String(id))?'مفعّل':'تنبيه'}</span>
        </button>` : ''}
      </div>
    </div>

    <div class="dp-info-block">
      <h1 class="dp-title">${title}</h1>
      ${tagline ? `<p class="dp-tagline">"${tagline}"</p>` : ''}
      <div class="dp-meta-row">
        ${year ? `<span class="dp-meta-chip">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="chip-ico"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          ${year}</span>` : ''}
        ${runtime ? `<span class="dp-meta-chip">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="chip-ico"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ${runtime}</span>` : ''}
        <span class="dp-meta-chip dp-meta-chip-gold">
          <svg viewBox="0 0 24 24" fill="currentColor" class="chip-ico" style="color:#f5c518"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          ${rating}${voteCount ? ` · ${voteCount}` : ''}</span>
      </div>
      <div class="dp-genres-row">${genres}</div>
    </div>

    <div class="detail-body">
      <div class="detail-tabs-bar">
        ${type === 'tv' || seasonsHTML
          ? `<button class="dtab active" onclick="switchTab(this,'tab-eps')">المواسم والحلقات</button>`
          : ''}
        <button class="dtab ${!(type === 'tv' || seasonsHTML) ? 'active' : ''}"
          onclick="switchTab(this,'tab-about')">عن العمل</button>
        <button class="dtab" onclick="switchTab(this,'tab-trailers')">العروض الترويجية</button>
      </div>

      <div id="tab-eps" class="dtab-content ${type === 'tv' || seasonsHTML ? 'active' : ''}">
        ${seasonsHTML}
      </div>
      <div id="tab-about" class="dtab-content ${!(type === 'tv' || seasonsHTML) ? 'active' : ''}">

        <!-- القصة -->
        <div class="neon-story-box">
          <div class="neon-story-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="neon-story-ico"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            <span>القصة</span>
          </div>
          <p class="neon-story-text">${overview}</p>
        </div>

        <!-- شريط التقييمات -->
        <div class="neon-ratings-grid">
          <div class="neon-rating-card neon-gold">
            <svg viewBox="0 0 24 24" fill="currentColor" class="nr-ico"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span class="nr-val">${rating}<small>/10</small></span>
            <span class="nr-lbl">IMDb</span>
          </div>
          <div class="neon-rating-card neon-red">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="nr-ico"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
            <span class="nr-val">${Math.min(99,Math.round((detail.vote_average||0)*10))}<small>%</small></span>
            <span class="nr-lbl">Rotten Tomatoes</span>
          </div>
          <div class="neon-rating-card neon-blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="nr-ico"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span class="nr-val">${Math.min(99,Math.round((detail.popularity||0)/10))}<small>%</small></span>
            <span class="nr-lbl">الجمهور</span>
          </div>
          <div class="neon-rating-card neon-purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="nr-ico"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            <span class="nr-val">${(detail.vote_average||0).toFixed(1)}<small>/10</small></span>
            <span class="nr-lbl">تقييم النقاد</span>
          </div>
        </div>

        <!-- معلومات الإنتاج -->
        <div class="detail-section">
          <h3 class="detail-section-title">معلومات الإنتاج</h3>
          <div class="prod-grid-new">
            ${detail.credits?.crew?.find(c=>c.job==='Director') ? `<div class="prod-item-new"><span class="prod-lbl-new">المخرج</span><span class="prod-val-new">${detail.credits?.crew?.find(c=>c.job==='Director')?.name||''}</span></div>` : ''}
            ${(credits.crew||[]).find(c=>c.job==='Director') ? `<div class="prod-item-new"><span class="prod-lbl-new">المخرج</span><span class="prod-val-new">${(credits.crew||[]).find(c=>c.job==='Director')?.name||''}</span></div>` : ''}
            ${(credits.crew||[]).find(c=>c.job==='Screenplay'||c.job==='Writer') ? `<div class="prod-item-new"><span class="prod-lbl-new">الكاتب</span><span class="prod-val-new">${(credits.crew||[]).find(c=>c.job==='Screenplay'||c.job==='Writer')?.name||''}</span></div>` : ''}
            ${(credits.crew||[]).find(c=>c.job==='Producer') ? `<div class="prod-item-new"><span class="prod-lbl-new">المنتج</span><span class="prod-val-new">${(credits.crew||[]).find(c=>c.job==='Producer')?.name||''}</span></div>` : ''}
            ${(credits.crew||[]).find(c=>c.job==='Director of Photography') ? `<div class="prod-item-new"><span class="prod-lbl-new">التصوير</span><span class="prod-val-new">${(credits.crew||[]).find(c=>c.job==='Director of Photography')?.name||''}</span></div>` : ''}
            ${(credits.crew||[]).find(c=>c.job==='Original Music Composer') ? `<div class="prod-item-new"><span class="prod-lbl-new">الموسيقى</span><span class="prod-val-new">${(credits.crew||[]).find(c=>c.job==='Original Music Composer')?.name||''}</span></div>` : ''}
            ${detail.production_companies?.[0] ? `<div class="prod-item-new"><span class="prod-lbl-new">الشركة</span><span class="prod-val-new">${detail.production_companies[0].name}</span></div>` : ''}
            ${detail.release_date||detail.first_air_date ? `<div class="prod-item-new"><span class="prod-lbl-new">تاريخ الإصدار</span><span class="prod-val-new">${detail.release_date||detail.first_air_date}</span></div>` : ''}
            ${detail.budget ? `<div class="prod-item-new"><span class="prod-lbl-new">الميزانية</span><span class="prod-val-new">$${(detail.budget/1e6).toFixed(1)}M</span></div>` : ''}
            ${detail.revenue ? `<div class="prod-item-new"><span class="prod-lbl-new">الإيرادات</span><span class="prod-val-new">$${(detail.revenue/1e6).toFixed(1)}M</span></div>` : ''}
            ${detail.original_language ? `<div class="prod-item-new"><span class="prod-lbl-new">اللغة</span><span class="prod-val-new">${detail.original_language==='en'?'الإنجليزية':detail.original_language}</span></div>` : ''}
            ${detail.production_countries?.[0] ? `<div class="prod-item-new"><span class="prod-lbl-new">بلد الإنتاج</span><span class="prod-val-new">${detail.production_countries[0].name}</span></div>` : ''}
          </div>
        </div>

        <!-- الكلمات المفتاحية -->
        ${keywords.length ? `<div class="detail-section">
          <h3 class="detail-section-title">الكلمات المفتاحية</h3>
          <div class="keywords-row">
            ${keywords.map(k=>`<span class="keyword-chip">${k.name}</span>`).join('')}
          </div>
        </div>` : ''}
${type === 'tv' && (() => { const s = calcSeasonEnd(detail); if (!s) return ''; return `
<div class="detail-section season-forecast-box">
  <div class="sf-header">
    <svg class="sf-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    <span>توقع نهاية الموسم</span>
  </div>
  <div class="sf-track">
    <div class="sf-fill" style="width:${s.pct}%"></div>
  </div>
  <div class="sf-row">
    <span class="sf-chip">${s.aired} / ${s.total} حلقة</span>
    <span class="sf-chip sf-chip-red">باقي ${s.remaining} حلقة</span>
  </div>
  ${s.endDate ? `<div class="sf-date">تنتهي تقريباً — ${s.endDate}</div>` : '<div class="sf-date">موعد النهاية غير محدد بعد</div>'}
</div>`;})()}
        <!-- متوفر على -->
        ${providers.length ? `<div class="detail-section">
          <h3 class="detail-section-title">متوفر على</h3>
          <div class="providers-row">
            ${providers.map(p=>`<div class="provider-chip">
              <img src="https://image.tmdb.org/t/p/w92${p.logo_path}" alt="${p.provider_name}" title="${p.provider_name}">
              <span>${p.provider_name}</span>
            </div>`).join('')}
          </div>
        </div>` : ''}

        <!-- معرض الصور -->
        ${galleryImgs.length ? `<div class="detail-section">
          <h3 class="detail-section-title">معرض الصور</h3>
          <div class="gallery-row">
            ${galleryImgs.map(g=>`<img class="gallery-img lazy-img" data-src="${g}"
              src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
              onclick="window.open('${g}','_blank')">`).join('')}
          </div>
        </div>` : ''}
<!-- تقييم الجمهور -->
        <div class="detail-section">
          <h3 class="detail-section-title">تقييم الجمهور</h3>
          <div class="audience-rating-wrap">
            <div class="audience-score-big">
              <span class="audience-num">${rating}</span>
              <span class="audience-outof">/10</span>
              <div class="audience-stars">${'★'.repeat(Math.round(detail.vote_average/2))}${'☆'.repeat(5-Math.round(detail.vote_average/2))}</div>
              <span class="audience-count">(${voteCount} تقييم)</span>
            </div>
            <div class="vote-bars">
              ${voteHist.map(v=>`
              <div class="vote-bar-row">
                <span class="vote-star-lbl">${v.star} ★</span>
                <div class="vote-bar-track">
                  <div class="vote-bar-fill" style="width:${Math.round(v.pct*100/maxPct)}%"></div>
                </div>
                <span class="vote-pct-lbl">${Math.round(v.pct*100/maxPct)}%</span>
              </div>`).join('')}
            </div>
          </div>
        </div>

        <!-- لماذا ستحبه -->
        ${whyWatch.length ? `<div class="detail-section">
          <h3 class="detail-section-title">لماذا ستحبه؟</h3>
          <div class="why-list">
            ${whyWatch.map(w=>`<div class="why-item"><span class="why-ico">✦</span><span>${w}</span></div>`).join('')}
          </div>
        </div>` : ''}

        <!-- آراء النقاد -->
        ${reviews.length ? `<div class="detail-section">
          <h3 class="detail-section-title">آراء النقاد</h3>
          <div class="critics-list">
            ${reviews.slice(0,3).map(r=>`
            <div class="critic-card">
              <div class="critic-source">${r.author_details?.username||r.author}</div>
              <p class="critic-quote">"${r.content.slice(0,140)}${r.content.length>140?'…':''}"</p>
              <div class="critic-stars">${'★'.repeat(Math.min(5,Math.round((r.author_details?.rating||7)/2)))}${'☆'.repeat(5-Math.min(5,Math.round((r.author_details?.rating||7)/2)))}</div>
            </div>`).join('')}
          </div>
        </div>` : ''}

        <!-- الجوائز -->
        ${awards.length ? `<div class="detail-section">
          <h3 class="detail-section-title">الجوائز والترشيحات</h3>
          <div class="awards-list">
            ${awards.map(a=>`
            <div class="award-item">
              <span class="award-laurel"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 4H17V13C17 15.7614 14.7614 18 12 18C9.23858 18 7 15.7614 7 13V4Z" fill="url(#tg)" stroke="rgba(245,197,24,0.5)" stroke-width="0.5"/><path d="M4 4H7V10C7 10 5 10 4 8V4Z" fill="rgba(245,197,24,0.3)" stroke="rgba(245,197,24,0.3)" stroke-width="0.5"/><path d="M17 4H20V8C20 10 18 10 17 10V4Z" fill="rgba(245,197,24,0.3)" stroke="rgba(245,197,24,0.3)" stroke-width="0.5"/><rect x="9" y="18" width="6" height="2" rx="1" fill="url(#tg)"/><rect x="7" y="20" width="10" height="1.5" rx="0.75" fill="url(#tg)"/><defs><linearGradient id="tg" x1="12" y1="4" x2="12" y2="21" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#fde68a"/><stop offset="100%" stop-color="#d97706"/></linearGradient></defs></svg></span>
              <div class="award-info">
                <span class="award-title">${a.title}</span>
                <span class="award-org">${a.org} · ${a.year}</span>
              </div>
            </div>`).join('')}
          </div>
        </div>` : ''}

        ${reviewsHTML}
        
        <!-- خط الزمن -->
        ${(detail.release_date || detail.first_air_date) ? `
        <div class="detail-section">
          <h3 class="detail-section-title">خط الزمن</h3>
          <div class="timeline-wrap">
            ${detail.production_companies?.[0] ? `<div class="timeline-item"><div class="timeline-date">الإنتاج</div><div class="timeline-event">${detail.production_companies[0].name}</div><div class="timeline-note">شركة الإنتاج الرئيسية</div></div>` : ''}
            ${detail.release_date||detail.first_air_date ? `<div class="timeline-item"><div class="timeline-date">${detail.release_date||detail.first_air_date}</div><div class="timeline-event">العرض العالمي الأول</div><div class="timeline-note">تاريخ الإصدار الرسمي</div></div>` : ''}
            ${detail.status === 'Released' || detail.status === 'Ended' ? `<div class="timeline-item"><div class="timeline-date">متاح الآن</div><div class="timeline-event">متوفر بالدقة الفائقة</div><div class="timeline-note">متاح على المنصات الرقمية</div></div>` : `<div class="timeline-item"><div class="timeline-date">قريباً</div><div class="timeline-event">${detail.status === 'Returning Series' ? 'موسم جديد قادم' : 'قادم قريباً'}</div><div class="timeline-note">ترقب الإعلان الرسمي</div></div>`}
          </div>
        </div>` : ''}
        ${castHTML}
        ${similarHTML}
        ${recommendedHTML}
      </div>
      <div id="tab-trailers" class="dtab-content">
        ${videos.results?.length ? `
        <div class="detail-section">
          <h3 class="detail-section-title">العروض الترويجية</h3>
          <div class="trailers-list">
            ${videos.results.slice(0,6).map(v=>`
            <div class="trailer-item" onclick="playTrailer('${v.key}')">
              <div class="trailer-thumb">
                <img src="https://img.youtube.com/vi/${v.key}/mqdefault.jpg" alt="${v.name}">
                <div class="trailer-play-ico">▶</div>
              </div>
              <span class="trailer-name">${v.name}</span>
            </div>`).join('')}
          </div>
        </div>` : '<div class="detail-section"><p style="color:var(--text3);text-align:center;padding:20px">لا توجد عروض ترويجية</p></div>'}
      </div>
    </div>
  </div>`;

    // IntersectionObserver للصور الكسولة
    const lazyObs = new IntersectionObserver(entries => {
      entries.forEach(e => { if(e.isIntersecting){ e.target.src=e.target.dataset.src; lazyObs.unobserve(e.target); }});
    });
    page.querySelectorAll('.lazy-img').forEach(img => lazyObs.observe(img));
    extractDominantColor(poster, applyDynamicColor);
    setTimeout(() => {
      // استعادة ألوان الأزرار
      if (localStorage.getItem(`rox_fav_${id}`)) {
        const fb = document.querySelector(`.dp-btn-fav[data-id="${id}"]`);
        if (fb) { fb.style.color='#e50914'; fb.style.borderColor='rgba(229,9,20,0.7)'; fb.style.boxShadow='0 0 14px rgba(229,9,20,0.4)'; const s=fb.querySelector('svg'); if(s){s.style.fill='#e50914';s.style.stroke='none';} }
      }
      if (localStorage.getItem(`rox_later_${id}`)) {
        const lb = document.querySelector(`.dp-btn-later[data-id="${id}"]`);
        if (lb) { lb.style.color='#f5c518'; lb.style.borderColor='rgba(245,197,24,0.7)'; lb.style.boxShadow='0 0 14px rgba(245,197,24,0.4)'; const s=lb.querySelector('svg'); if(s){s.style.fill='#f5c518';s.style.stroke='none';} }
      }
    }, 300);
// سلايدر الصور
    if (backdrops.length > 1) {
      let si = 0;
      const slides = document.querySelectorAll(`#dpSlider_${id} .dp-backdrop-slide`);
      setInterval(() => {
        slides[si].classList.remove('active');
        si = (si + 1) % slides.length;
        slides[si].classList.add('active');
      }, 3500);
    }
    // تريلر بعد 3 ثواني
    window._trailerTimer = null;
    window._activeTrailerFrame = null;
    if (trailer) {
      window._trailerTimer = setTimeout(() => {
        const box = document.getElementById(`dpTrailerBox_${id}`);
        const frame = document.getElementById(`dpTrailerFrame_${id}`);
        const slider = document.getElementById(`dpSlider_${id}`);
        if (box && frame && frame.dataset.src) {
          frame.src = frame.dataset.src;
          window._activeTrailerFrame = frame;
          box.style.display = 'block';
          if (slider) { slider.style.opacity='0'; setTimeout(()=>slider.style.display='none',400); }
        }
      }, 3000);
    }
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
    window._epsCache = data.episodes||[];
    wrap.innerHTML = (data.episodes||[]).map(e=>`
          <div class="swiper-slide ep-card ${(() => { const p=getProgress(tvId); return p && p.season===seasonNum && p.episode+1===e.episode_number ? 'ep-next-glow' : ''; })()}" onclick="openEpisodeDetail(${tvId},${seasonNum},${e.episode_number},window._epsCache||[])">        <div class="ep-thumb-wrap">
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
async function openEpisodeDetail(tvId, seasonNum, epNum, allEps) {
  const page = document.getElementById('detailPage');
  if (!page) return;
  page.innerHTML = '<div class="loading">⏳ جاري تحميل الحلقة...</div>';
  try {
    const data = await fetch(buildTMDBUrl(`/tv/${tvId}/season/${seasonNum}/episode/${epNum}`)).then(r=>r.json());
    const img = data.still_path ? `${CONFIG.IMAGES.BACKDROP}${data.still_path}` : CONFIG.IMAGES.PLACEHOLDER;
    const date = data.air_date ? new Date(data.air_date).toLocaleDateString('ar-SA',{day:'numeric',month:'long',year:'numeric'}) : 'غير محدد';
    const rating = data.vote_average ? data.vote_average.toFixed(1) : '—';
    const runtime = data.runtime ? `${data.runtime} د` : '—';
    const guests = (data.guest_stars||[]).slice(0,6);
    const idx = allEps.findIndex(e=>e.episode_number===epNum);
    const prev = allEps[idx-1];
    const next = allEps[idx+1];
    page.innerHTML = `
    <div class="epd-wrap">
      <div class="epd-hero" style="background-image:url('${img}')">
        <div class="epd-hero-overlay"></div>
        <button class="epd-back-btn" onclick="openDetail(${tvId},'tv')">← رجوع</button>        <div class="epd-nav">
          ${prev ? `<button class="epd-nav-btn" onclick="openEpisodeDetail(${tvId},${seasonNum},${prev.episode_number},window._curEps)">‹ ح${prev.episode_number}</button>` : '<span></span>'}
          <span class="epd-ep-badge">م${seasonNum} · ح${epNum}</span>
          ${next ? `<button class="epd-nav-btn" onclick="openEpisodeDetail(${tvId},${seasonNum},${next.episode_number},window._curEps)">ح${next.episode_number} ›</button>` : '<span></span>'}
        </div>
      </div>
      <div class="epd-body">
        <h2 class="epd-title">${data.name||''}</h2>
        <div class="epd-meta-row">
          <span class="epd-chip">⭐ ${rating}</span>
          <span class="epd-chip">⏱ ${runtime}</span>
          <span class="epd-chip">📅 ${date}</span>
        </div>
        <p class="epd-overview">${data.overview||'لا يوجد ملخص لهذه الحلقة.'}</p>
        <button class="epd-watch-btn" onclick="saveProgress(${tvId},${seasonNum},${epNum});openWatchPage(${tvId},'tv',${seasonNum},${epNum})">▶ شاهد الحلقة</button>
        ${guests.length ? `<div class="epd-guests-title">ضيوف الحلقة</div>
        <div class="epd-guests-row">${guests.map(g=>`
          <div class="epd-guest">
            <img class="epd-guest-img" src="${g.profile_path?CONFIG.IMAGES.POSTER_SM+g.profile_path:CONFIG.IMAGES.PLACEHOLDER}" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
            <span class="epd-guest-name">${(g.name||'').slice(0,14)}</span>
          </div>`).join('')}</div>` : ''}
      </div>
    </div>`;
  } catch(e) { page.innerHTML = '<div class="loading">⚠️ خطأ في تحميل الحلقة</div>'; }
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
        if (card.dataset.rox) { loadRox(card.dataset.url); } else { document.getElementById('wsFrame').src = card.dataset.url; }
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
  async function loadRox(url) {
  const proxy = CONFIG.VIDEO.PROXY;
  const res = await fetch(proxy + encodeURIComponent(url)).catch(()=>null);
  if (!res) { document.getElementById('wsFrame').src = url; return; }
  const html = await res.text();
  const m = html.match(/["'](https?:\/\/[^"']+\.m3u8[^"']*)['"]/);
  const v = document.getElementById('roxPlayer');
  if (m) {
    v.style.display = 'block';
    document.getElementById('wsFrame').style.display = 'none';
    if (window._plyr) window._plyr.destroy();
    v.src = m[1];
    window._plyr = new Plyr(v, { autoplay:true });
  } else {
    document.getElementById('wsFrame').src = url;
  }
  }
function wsGoBack() {
  document.body.classList.remove('cinema-mode');
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
const srvs = [
  { icon:'🎯', name:'ROX',     desc:'مشغلي 🔥',  url: ep?`${S.ANIME}${id}/${season}/${episode}${animeParams}`:`${S.MOV}${id}`, rox:true, active:true },
  { icon:'🎌', name:'PRIME',   desc:'#01', url: ep?`${S.ANIME}${id}/${season}/${episode}${animeParams}`:`${S.MOV}${id}` },
  { icon:'⚡', name:'NEXUS',   desc:'#02', url: ep?`${S.ANIME2}${id}/${season}/${episode}`:`${S.MOV2}${id}` },
  { icon:'💎', name:'TITAN',   desc:'#03', url: ep?`${S.ANIME3}${id}/${season}/${episode}`:`${S.MOV3}${id}` },
  { icon:'🌅', name:'AURORA',  desc:'#04', url: ep?`${S.ANIME6}${id}/${season}/${episode}`:`${S.MOV4}${id}` },
  { icon:'🌌', name:'COSMOS',  desc:'#05', url: ep?`${S.ANIME4}${id}/${season}/${episode}`:`${S.MOV5}${id}` },
  { icon:'👑', name:'ZENITH',  desc:'#06', url: ep?`${S.ANIME5}${id}/${season}/${episode}`:`${S.MOV6}${id}` },
  { icon:'⭐', name:'STELLAR', desc:'#07', url: ep?`${S.ANIME7}${id}/${season}/${episode}`:`${S.MOV7}${id}` },
  { icon:'🔮', name:'PHANTOM', desc:'#08', url: ep?`${S.ANIME8}${id}/${season}/${episode}`:`${S.MOV8}${id}&tmdb=1` },
  { icon:'🌙', name:'ECLIPSE', desc:'#09', url: ep?`${S.ANIME9}${id}/${season}/${episode}`:`${S.MOV9}${id}` },
  { icon:'✨', name:'NOVA',    desc:'#10', url: ep?`${S.ANIME10}${id}/${season}/${episode}`:`${S.MOV10}${id}` },
  { icon:'🌟', name:'VEGA',    desc:'#11', url: ep?`${S.ANIME16}${id}/${season}/${episode}`:`${S.MOV11}${id}` },
  { icon:'🔵', name:'CRYSTAL', desc:'#12', url: ep?`${S.ANIME11}${id}&s=${season}&e=${episode}`:`${S.MOV12}${id}` },
  { icon:'🟣', name:'CIPHER',  desc:'#13', url: ep?`${S.ANIME12}${id}/${season}/${episode}`:`${S.MOV13}${id}` },
  { icon:'🎯', name:'ORION',   desc:'#14', url: ep?`${S.ANIME13}${id}/${season}/${episode}`:`${S.MOV14}${id}` },
  { icon:'💫', name:'NEBULA',  desc:'#15', url: ep?`${S.ANIME14}${id}/${season}/${episode}`:`${S.MOV15}${id}` },
  { icon:'🖤', name:'ONYX',    desc:'#16', url: ep?`${S.ANIME15}${id}/${season}/${episode}`:`${S.MOV16}${id}` },
  { icon:'🏆', name:'APEX',    desc:'#17', url: ep?`${S.ANIME17}${id}/${season}/${episode}`:`${S.MOV17}${id}` },
  { icon:'🔴', name:'QUASAR',  desc:'#18', url: ep?`${S.ANIME18}${id}/${season}/${episode}`:`${S.MOV19}${id}` },
  { icon:'🟡', name:'PULSAR',  desc:'#19', url: ep?`${S.ANIME19}${id}/${season}/${episode}`:`${S.MOV20}${id}` },
  { icon:'🟢', name:'LYRA',    desc:'#20', url: ep?`${S.ANIME20}${id}&tmdb=1&s=${season}&e=${episode}`:`${S.MOV21}${id}` },
  { icon:'🏅', name:'VULCAN',  desc:'#21 VIP', url: ep?`${S.ANIME21}${id}/${season}/${episode}`:`${S.MOV22}${id}&tmdb=1` },
  { icon:'🌠', name:'NEXUS-X', desc:'#22 4K',  url: ep?`${S.ANIME22}${id}-${season}-${episode}`:`${S.MOV24}${id}` },
  { icon:'💠', name:'EMBED',   desc:'#23', url: ep?`${S.ANIME23}${id}/${season}/${episode}`:`${S.MOV25}${id}` },
  { icon:'🌐', name:'ATLAS',   desc:'#24', url: ep?`${S.ANIME30}${id}/${season}/${episode}`:`${S.MOV32}${id}` },
  { icon:'🎭', name:'FUSION',  desc:'#25', url: ep?`${S.ANIME31}${id}/${season}/${episode}`:`${S.MOV33}${id}` },
  { icon:'🚀', name:'ROCKET',  desc:'#26', url: ep?`${S.ANIME32}${id}/${season}/${episode}`:`${S.MOV34}${id}` },
];
    const srvHTML = srvs.map(s => `
      <div class="ws-card ${s.active?'active':''}" data-url="${s.url}" data-name="${s.name}" ${s.rox?'data-rox="true"':''} onclick="wsSelectServer(this)">
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
          <div class="ws-ambient" style="background-image:url('${backdrop}')"></div>
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
          <video id="roxPlayer" class="ws-player" controls playsinline style="display:none"></video>
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
      <button class="ws-cinema-btn" id="cinemaModeBtn" onclick="toggleCinemaMode()">
        <svg class="ws-cine-ico" width="18" height="18" viewBox="0 0 24 24">
          <defs>
            <linearGradient id="cg1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stop-color="#fde68a"/>
              <stop offset="50%"  stop-color="#f59e0b"/>
              <stop offset="100%" stop-color="#92400e"/>
            </linearGradient>
          </defs>
          <rect x="2" y="6" width="20" height="14" rx="2.5" fill="url(#cg1)"/>
          <rect x="2" y="3.5" width="20" height="4" rx="1.5" fill="#f59e0b" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>
          <line x1="6.5"  y1="3.5" x2="5"  y2="7.5" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>
          <line x1="11.5" y1="3.5" x2="10" y2="7.5" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>
          <line x1="16.5" y1="3.5" x2="15" y2="7.5" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>
          <polygon points="9.5,11 16,14.5 9.5,18" fill="rgba(255,255,255,0.75)"/>
          <ellipse cx="5.5" cy="4.8" rx="2.2" ry="0.9" fill="rgba(255,255,255,0.4)"/>
        </svg>
        وضع السينما
      </button>
      <div style="display:none">
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
  const exists = list.find(i => i.id === id);
  const favBtn = document.querySelector(`.dp-btn-fav[data-id="${id}"]`);
  const svg = favBtn?.querySelector('svg');
  if (exists) {
    saveLib('rox_watchlist', list.filter(i => i.id !== id));
    localStorage.removeItem(`rox_fav_${id}`);
    showToast('💔 تمت الإزالة من المفضلة');
    if (favBtn) { favBtn.style.color=''; favBtn.style.borderColor=''; favBtn.style.boxShadow=''; }
    if (svg) { svg.style.fill='none'; svg.style.stroke='currentColor'; }
  } else {
    list.unshift({ id, type, addedAt: Date.now() });
    saveLib('rox_watchlist', list);
    localStorage.setItem(`rox_fav_${id}`, '1');
    showToast('❤️ تمت الإضافة إلى المفضلة');
    if (favBtn) { favBtn.style.color='#e50914'; favBtn.style.borderColor='rgba(229,9,20,0.7)'; favBtn.style.boxShadow='0 0 14px rgba(229,9,20,0.4)'; }
    if (svg) { svg.style.fill='#e50914'; svg.style.stroke='none'; }
  }
}
function toggleAlertSubscription(id, title, type) {
  const list = getLib('rox_alerts');
  const exists = list.find(i => String(i.id) === String(id));
  const btn = document.getElementById(`alertBtn_${id}`);
  if (exists) {
    saveLib('rox_alerts', list.filter(i => i.id !== id));
    if (btn) { btn.classList.remove('active'); btn.style.color=''; btn.style.borderColor='rgba(229,9,20,0.25)'; btn.style.boxShadow=''; btn.style.background=''; const ico=btn.querySelector('.dp-act-ico,svg'); if(ico){ico.style.stroke='';ico.style.filter='';} btn.querySelector('span')&&(btn.querySelector('span').textContent='تنبيه'); }
    showToast('تم إلغاء الاشتراك');
  } else {
    list.unshift({ id, title, type, addedAt: Date.now() });
    saveLib('rox_alerts', list);
  if (btn) { btn.classList.add('active'); btn.style.color='#1ce783'; btn.style.borderColor='rgba(28,231,131,0.7)'; btn.style.boxShadow='0 0 14px rgba(28,231,131,0.3)'; btn.style.background='rgba(28,231,131,0.1)'; const ico=btn.querySelector('.dp-act-ico,svg'); if(ico){ico.style.stroke='#1ce783';ico.style.filter='drop-shadow(0 0 8px #1ce783)';} btn.querySelector('span')&&(btn.querySelector('span').textContent='مفعّل'); }    showToast('تم الاشتراك بالتنبيهات');
    checkAlertUpdates(id, title);
  }
}

async function checkAlertUpdates(id, title) {
  try {
    const key = `rox_alert_seen_${id}`;
    const data = await fetch(buildTMDBUrl(`/tv/${id}`)).then(r => r.json());
    const ep = data.last_episode_to_air;
    if (!ep) return;
    const epKey = `${ep.season_number}_${ep.episode_number}`;
    const seen = localStorage.getItem(key);
    if (seen === epKey) return;
    if (!seen) { localStorage.setItem(key, epKey); return; }
    localStorage.setItem(key, epKey);
    const epThumb = ep.still_path
      ? `${CONFIG.IMAGES.BACKDROP}${ep.still_path}`
      : (data.poster_path ? `${CONFIG.IMAGES.POSTER_SM}${data.poster_path}` : CONFIG.IMAGES.PLACEHOLDER);
    addNotif(title, `الموسم ${ep.season_number} · الحلقة ${ep.episode_number} — ${ep.name||''}`, epThumb);
  } catch {}
}
function saveProgress(id, season, episode) {
  localStorage.setItem(`rox_progress_${id}`, JSON.stringify({ season, episode }));
}
function getProgress(id) {
  try { return JSON.parse(localStorage.getItem(`rox_progress_${id}`)); } catch { return null; }
    }
function switchTab(btn, tabId) {
  const parent = btn.closest('.detail-body') || document.getElementById('detailPage');
  parent.querySelectorAll('.dtab').forEach(b => b.classList.remove('active'));
  parent.querySelectorAll('.dtab-content').forEach(c => {
    c.classList.remove('active');
    c.style.display = 'none';
    c.style.opacity = '0';
  });
  btn.classList.add('active');
  const tab = document.getElementById(tabId);
  if (tab) {
    tab.style.display = 'block';
    tab.classList.add('active');
    setTimeout(() => tab.style.opacity = '1', 10);
  }
}

function checkAllAlerts() {
  const list = getLib('rox_alerts');
  list.forEach(item => checkAlertUpdates(item.id, item.title));
}
function addToWatchLater(id, type) {
  if (!window.ROX_USER) { showToast('🔐 سجّل دخولك أولاً'); bnavGo('profile'); return; }
  const list = getLib('rox_watchlater');
  const exists = list.find(i => i.id === id);
  const laterBtn = document.querySelector(`.dp-btn-later[data-id="${id}"]`);
  const svg = laterBtn?.querySelector('svg');
  if (exists) {
    saveLib('rox_watchlater', list.filter(i => i.id !== id));
    localStorage.removeItem(`rox_later_${id}`);
    showToast('🗑️ تمت الإزالة من سأشاهده');
    if (laterBtn) { laterBtn.style.color=''; laterBtn.style.borderColor=''; laterBtn.style.boxShadow=''; }
    if (svg) { svg.style.fill='none'; svg.style.stroke='currentColor'; }
  } else {
    list.unshift({ id, type, addedAt: Date.now() });
    saveLib('rox_watchlater', list);
    localStorage.setItem(`rox_later_${id}`, '1');
    showToast('⏰ تمت الإضافة إلى سأشاهده لاحقاً');
    if (laterBtn) { laterBtn.style.color='#f5c518'; laterBtn.style.borderColor='rgba(245,197,24,0.7)'; laterBtn.style.boxShadow='0 0 14px rgba(245,197,24,0.4)'; }
    if (svg) { svg.style.fill='#f5c518'; svg.style.stroke='none'; }
  }
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
    Object.keys(localStorage).filter(k=>k.startsWith('rox_fav_')||k.startsWith('rox_later_')).forEach(k=>localStorage.removeItem(k));
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
const svgRadar = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="rg1" cx="50%" cy="40%" r="55%"><stop offset="0%" stop-color="#00ffcc" stop-opacity="0.95"/><stop offset="100%" stop-color="#007755" stop-opacity="0.7"/></radialGradient><filter id="rf1"><feGaussianBlur stdDeviation="0.4" result="blur"/><feComposite in="SourceGraphic" in2="blur" operator="over"/></filter></defs><circle cx="12" cy="12" r="10" fill="url(#rg1)" opacity="0.15" filter="url(#rf1)"/><circle cx="12" cy="12" r="10" stroke="url(#rg1)" stroke-width="1.5"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10" stroke="#00ffcc" stroke-width="1.2" opacity="0.8"/><path d="M2 12h20" stroke="#00ffcc" stroke-width="1.2" opacity="0.8"/><path d="M12 2a15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0 4 10" stroke="#00ffcc" stroke-width="1.2" opacity="0.8"/><circle cx="12" cy="12" r="2.5" fill="#00ffcc" opacity="0.9"/><circle cx="12" cy="12" r="1" fill="#ffffff"/></svg>`;
  const hasTrakt = localStorage.getItem('trakt_token');

  const radarHTML = await loadRadarSection();
  page.innerHTML = `
    <div class="lib-header"><h2 class="lib-title">مكتبتي</h2></div>
    ${buildSection('lib-laser-magenta','lib-icon3d-magenta', svgArchive, 'أرشيفي الخاص',   wlHTML,  'rox_watchlist',  watchlist)}
    ${buildSection('lib-laser-cyan',   'lib-icon3d-cyan',    svgClock,   'قائمة الانتظار', wlrHTML, 'rox_watchlater', watchlater)}
    ${buildSection('lib-laser-orange', 'lib-icon3d-orange',  svgPlay,    'أكمل المشاهدة',  cwHTML,  '',               cwItems)}
    ${buildSection('lib-laser-green',  'lib-icon3d-green',   svgRadar,   'رادار حلقاتك', radarHTML, '', [])}
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
        <button class="detail-btn" onclick="window._lastDetailId?openDetail(window._lastDetailId,window._lastDetailType||'movie'):goBack()" style="margin-bottom:16px">← رجوع</button>
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
// ===== NOTIFICATION SIDEBAR =====
let notifOpen = false;
function loadNotifData() {
  try { return JSON.parse(localStorage.getItem('rox_notif_data') || '[]'); } catch { return []; }
}
function saveNotifData() {
  localStorage.setItem('rox_notif_data', JSON.stringify(NOTIF_DATA.slice(0, 50)));
}
const NOTIF_DATA = loadNotifData();

function updateBadge() {
  const badge = document.getElementById('notifBadge');
  if (!badge) return;
  const unread = NOTIF_DATA.filter(n => !n.read).length;
  if (unread > 0) {
    badge.textContent = unread;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

function markAsRead(id) {
  const notif = NOTIF_DATA.find(n => n.id === id);
  if (notif) { notif.read = true; saveNotifData(); }
  updateBadge();
  renderNotifList();
}

function addNotif(title, ep, thumb) {
  NOTIF_DATA.unshift({
    id: Date.now(),
    title, ep, thumb,
    time: new Date().toLocaleString('ar-SA', { hour:'2-digit', minute:'2-digit' }),
    read: false
  });
  saveNotifData();
  updateBadge();
}

function renderNotifList() {
  const list = document.getElementById('notifList');
  if (!list) return;
  if (NOTIF_DATA.length === 0) {
    list.innerHTML = '<div class="notif-empty">الرادار نظيف تماماً.. لا توجد حلقات جديدة حالياً</div>';
    return;
  }
  list.innerHTML = NOTIF_DATA.map(n => `
    <div class="notif-item ${!n.read ? 'notif-item--new' : ''}" onclick="markAsRead(${n.id})">
      <div class="notif-item-thumb">
        <img src="${n.thumb}" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'"
          style="width:100%;height:100%;object-fit:cover;border-radius:8px;">
      </div>
      <div class="notif-item-body">
        <div class="notif-item-title">${n.title}</div>
        <div class="notif-item-ep">${n.ep}</div>
        <div class="notif-item-time">${n.time}</div>
      </div>
      ${!n.read ? '<span class="notif-item-dot"></span>' : ''}
    </div>
  `).join('');
}

function toggleNotifSidebar() {
  notifOpen = !notifOpen;
  const sidebar   = document.getElementById('notifSidebar');
  const overlay   = document.getElementById('notifOverlay');
  const hamburger = document.getElementById('hamburgerBtn');
  sidebar?.classList.toggle('open', notifOpen);
  overlay?.classList.toggle('open', notifOpen);
  hamburger?.classList.toggle('open', notifOpen);
  if (notifOpen) renderNotifList();
}
function shareContent(id, title, type) {
  const btn = document.getElementById(`shareBtn_${id}`);
  const url = `${location.origin}${location.pathname}?id=${id}&type=${type}`;
  const text = `🎬 ${title}\n\nشاهده الآن على Cinema ROX`;
  if (navigator.share) {
    navigator.share({ title, text, url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(`${text}\n${url}`)
      .then(() => showToast('🔗 تم نسخ الرابط'))
      .catch(() => showToast('⚠️ تعذّر النسخ'));
  }
  if (btn) {
    btn.classList.add('shared');
    setTimeout(() => btn.classList.remove('shared'), 3000);
  }
}
function toggleCinemaMode() {
  const isOn = document.body.classList.toggle('cinema-mode');
  const btn  = document.getElementById('cinemaModeBtn');
  if (btn) btn.classList.toggle('active', isOn);
  if (isOn) {
    window.scrollTo(0, 0);
    showToast('🎬 وضع السينما — اضغط للخروج');
  }
}
async function loadRadarSection() {
  const alerts = getLib('rox_alerts');
  if (!alerts.length) return '<div class="radar-empty">📡 لا توجد اشتراكات بعد — فعّل التنبيه من صفحة أي مسلسل</div>';
  const today = new Date();
  const cards = await Promise.all(alerts.map(async item => {
    try {
      const d = await fetch(buildTMDBUrl(`/tv/${item.id}`)).then(r => r.json());
      const poster = d.poster_path ? `${CONFIG.IMAGES.POSTER_SM}${d.poster_path}` : CONFIG.IMAGES.PLACEHOLDER;
      const title  = d.name || d.original_name || item.title || '';
      const last   = d.last_episode_to_air;
      const next   = d.next_episode_to_air;
      const lastTxt = last
        ? `آخر حلقة: م${last.season_number} · ح${last.episode_number}`
        : 'لا توجد حلقات بعد';
      let nextTxt = '', nextClass = 'nodate';
      if (next?.air_date) {
        const diff = Math.ceil((new Date(next.air_date) - today) / 86400000);
        if (diff <= 0)      { nextTxt = '🟢 الحلقة القادمة صدرت اليوم!'; nextClass = 'soon'; }
        else if (diff === 1){ nextTxt = '⏳ الحلقة القادمة غداً';         nextClass = 'soon'; }
        else if (diff <= 7) { nextTxt = `⏳ الحلقة القادمة بعد ${diff} أيام`; nextClass = 'days'; }
        else                { nextTxt = `📅 ${next.air_date}`;             nextClass = 'days'; }
      } else {
        nextTxt = '— لا يوجد موعد بعد'; nextClass = 'nodate';
      }
      return `
        <div class="radar-card" onclick="openDetail(${item.id},'tv')">
          <img class="radar-poster" src="${poster}" onerror="this.src='${CONFIG.IMAGES.PLACEHOLDER}'">
          <div class="radar-info">
            <div class="radar-title">${title}</div>
            <div class="radar-last">${lastTxt}</div>
            <div class="radar-next ${nextClass}">${nextTxt}</div>
          </div>
          <button class="radar-watch-btn" onclick="event.stopPropagation();openWatchPage(${item.id},'tv',${last?.season_number||1},${last?.episode_number||1})">
            ▶ شاهد
          </button>
        </div>`;
    } catch { return ''; }
  }));
  return `<div class="radar-list">${cards.join('')}</div>`;
}
// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
  bnavGo('home');
  setTimeout(checkAllAlerts, 4000);
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(() => console.log('SW registered'))
      .catch(() => {});
  }
setInterval(checkAllAlerts, 30 * 60 * 1000);
  cwRender();
  renderNotifList();
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
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
}
