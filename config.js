// ============================================================
//   Cinema-ROX — CONFIG.JS
//   الدستور الرسمي للموقع | النسخة 2.0
//   ⚠️  لا تُعدِّل هذا الملف إلا من هنا — كل الموقع يتبعه
// ============================================================

const CONFIG = Object.freeze({

  // ─────────────────────────────────────────
  //  🔑  مفاتيح API
  // ─────────────────────────────────────────
  KEYS: Object.freeze({
    TMDB    : '943bac496146cd6404017535d3c0e8ec',
    OMDB    : '629bc3c5',
    FANART  : '06c3be40269e45894e300cddff3950bc',
    YOUTUBE : 'AIzaSyC14y1pNjfqbP8h0eMYLynl_XIi87yXyis',
    TRAKT   : '11ce43a6882f1da18a6f875a07d2a863ee62b1a7e3bd1d00a64f7a9fd8759301',
    NEWS    : '7451bf041d1e4011a57e520ebba343e8',
  }),
HERO: Object.freeze({
    LIMIT         : 5,
    AUTOPLAY_MS   : 6500,
    TRANSITION_MS : 400,
    POSTER_SIZE   : 'POSTER_MD',
    BACKDROP_SIZE : 'BACKDROP',
  }),
  // ─────────────────────────────────────────
  //  🌐  روابط قواعد البيانات (Base URLs)
  // ─────────────────────────────────────────
  API: Object.freeze({
    TMDB_BASE   : 'https://api.themoviedb.org/3',
    OMDB_BASE   : 'https://www.omdbapi.com',
    TRAKT_BASE  : 'https://api.trakt.tv',
    FANART_BASE : 'https://webservice.fanart.tv/v3',
    NEWS_BASE   : 'https://newsapi.org/v2',
  }),

  // ─────────────────────────────────────────
  //  🖼️  مسارات الصور
  // ─────────────────────────────────────────
  IMAGES: Object.freeze({
    POSTER_SM   : 'https://image.tmdb.org/t/p/w185',
    POSTER_MD   : 'https://image.tmdb.org/t/p/w342',
    POSTER_LG   : 'https://image.tmdb.org/t/p/w500',
    POSTER_XL   : 'https://image.tmdb.org/t/p/w780',
    BACKDROP    : 'https://image.tmdb.org/t/p/w1280',
    ORIGINAL    : 'https://image.tmdb.org/t/p/original',
    PLACEHOLDER : '/assets/images/no-poster.png',
    STILL_SM    : 'https://image.tmdb.org/t/p/w185',
    STILL_MD    : 'https://image.tmdb.org/t/p/w300',
    PROFILE     : 'https://image.tmdb.org/t/p/w185',
  }),

  // ─────────────────────────────────────────
  //  🔍  إعدادات البحث
  // ─────────────────────────────────────────
  SEARCH: Object.freeze({
    MIN_CHARS         : 2,       // أقل عدد أحرف لتفعيل البحث
    DEBOUNCE_MS       : 400,     // تأخير البحث التلقائي (مللي ثانية)
    MAX_RESULTS       : 10,      // أقصى عدد نتائج في القائمة
    INCLUDE_ADULT     : false,   // إخفاء المحتوى الكبار
  }),
  VIDEO: Object.freeze({
    YOUTUBE_EMBED    : 'https://www.youtube.com/embed/',
    TMDB_VIDEO_PATH  : '/videos',
    YOUTUBE_PARAMS   : '?autoplay=0&rel=0&modestbranding=1&cc_load_policy=0',
    YOUTUBE_NOCOOKIE : 'https://www.youtube-nocookie.com/embed/',
    TRAILER_TYPE     : 'Trailer',
  }),
  SERVERS: Object.freeze({
  // ── أفلام ──
  MOV  : 'https://vidsrc-embed.ru/embed/movie/',
  MOV2 : 'https://vidsrc-embed.su/embed/movie/',
  MOV3 : 'https://vidlink.pro/movie/',
  MOV4 : 'https://www.2embed.online/embed/movie/',
  MOV5 : 'https://vidsrc.icu/embed/movie/',
  MOV6 : 'https://moviesapi.club/movie/',
  MOV7 : 'https://player.smashy.stream/movie/',
  MOV8 : 'https://multiembed.mov/?video_id=',
  MOV9 : 'https://vidsrc.cc/v2/embed/movie/',
  MOV10: 'https://www.NontonGo.win/embed/movie/',
  MOV11: 'https://player.videasy.net/movie/',
  MOV12: 'https://vidsrc.ru/movie/',
  MOV13: 'https://www.2embed.cc/embed/',
  MOV14: 'https://player.vidzee.wtf/embed/movie/',
  MOV15: 'https://vidfast.pro/movie/',
  MOV16: 'https://player.vidify.top/embed/movie/',
  MOV17: 'https://vidrock.net/movie/',
  MOV18: 'https://vidsrc.to/embed/movie/',
  MOV19: 'https://vidsrc.mov/embed/movie/',
  MOV20: 'https://vidsrc.online/embed/movie/',
  MOV21: 'https://111movies.net/movie/',
  MOV22: 'https://multiembed.mov/directstream.php?video_id=',
  MOV23: 'https://vidsrc.me/embed/movie/',
  MOV24: 'https://autoembed.cc/movie/tmdb/',
  MOV25: 'https://embed.su/embed/movie/',
  // ── مسلسلات ──
  TV   : 'https://vidsrc-embed.ru/embed/tv/',
  TV2  : 'https://vidsrc-embed.su/embed/tv/',
  TV3  : 'https://vidlink.pro/tv/',
  TV4  : 'https://www.2embed.online/embed/tv/',
  TV5  : 'https://vidsrc.icu/embed/tv/',
  TV6  : 'https://moviesapi.club/tv/',
  TV7  : 'https://player.smashy.stream/tv/',
  TV8  : 'https://vidsrc.cc/v2/embed/tv/',
  TV9  : 'https://www.NontonGo.win/embed/tv/',
  TV10 : 'https://player.videasy.net/tv/',
  TV11 : 'https://vidsrc.ru/tv/',
  TV12 : 'https://www.2embed.cc/embedtv/',
  TV13 : 'https://player.vidzee.wtf/embed/tv/',
  TV14 : 'https://vidfast.pro/tv/',
  TV15 : 'https://player.vidify.top/embed/tv/',
  TV16 : 'https://vidrock.net/tv/',
  TV17 : 'https://vidsrc.to/embed/tv/',
  TV18 : 'https://godriveplayer.com/player.php?type=series&tmdb=',
  TV19 : 'https://vidsrc.mov/embed/tv/',
  TV20 : 'https://vidsrc.online/embed/tv/',
  TV21 : 'https://111movies.net/tv/',
  TV22 : 'https://multiembed.mov/directstream.php?video_id=',
  TV23 : 'https://vidsrc.me/embed/tv/',
  TV24 : 'https://vidsrc.to/embed/tv/',
  TV25 : 'https://embed.su/embed/tv/',
  // ── أنمي ──
  ANIME  : 'https://vidsrc-embed.ru/embed/tv/',
  ANIME2 : 'https://vidsrc-embed.su/embed/tv/',
  ANIME3 : 'https://vidsrc.icu/embed/tv/',
  ANIME4 : 'https://vidsrc.cc/v2/embed/tv/',
  ANIME5 : 'https://moviesapi.club/tv/',
  ANIME6 : 'https://www.2embed.online/embed/tv/',
  ANIME7 : 'https://vidlink.pro/tv/',
  ANIME8 : 'https://www.NontonGo.win/embed/tv/',
  ANIME9 : 'https://player.videasy.net/tv/',
  ANIME10: 'https://vidsrc.ru/tv/',
  ANIME11: 'https://www.2embed.cc/embedtv/',
  ANIME12: 'https://player.vidzee.wtf/embed/tv/',
  ANIME13: 'https://vidfast.pro/tv/',
  ANIME14: 'https://player.vidify.top/embed/tv/',
  ANIME15: 'https://vidrock.net/tv/',
  ANIME16: 'https://vidsrc.to/embed/tv/',
  ANIME17: 'https://vidsrc.mov/embed/tv/',
  ANIME18: 'https://vidsrc.online/embed/tv/',
  ANIME19: 'https://111movies.net/tv/',
  ANIME20: 'https://multiembed.mov/directstream.php?video_id=',
  ANIME21: 'https://vidsrc.me/embed/tv/',
  ANIME22: 'https://vidsrc.to/embed/tv/',
  ANIME23: 'https://embed.su/embed/tv/',
}),
  // ─────────────────────────────────────────
  //  🎬  إعدادات عرض المحتوى
  // ─────────────────────────────────────────
  DISPLAY: Object.freeze({
    POSTERS_PER_ROW   : 6,       // عدد البوسترات في كل صف
    POSTERS_IN_SEARCH : 20,      // عدد البوسترات في نتائج البحث
    TRENDING_LIMIT    : 20,      // عدد عناصر قسم الرائج
    ANIMATION_SPEED   : 300,     // سرعة الأنيميشن (مللي ثانية)
    LAZY_LOAD         : true,    // تحميل الصور عند الظهور فقط
  }),

  // ─────────────────────────────────────────
  //  🌍  إعدادات اللغة والمنطقة
  // ─────────────────────────────────────────
  LOCALE: Object.freeze({
    DEFAULT_LANG   : 'ar',       // اللغة الافتراضية
    FALLBACK_LANG  : 'en',       // لغة بديلة إذا لم تتوفر الترجمة
    REGION         : 'SA',       // المنطقة (تؤثر على ترتيب النتائج)
    DATE_FORMAT    : 'ar-SA',    // تنسيق التواريخ
    RTL            : true,       // اتجاه النص من اليمين لليسار
  }),

  // ─────────────────────────────────────────
  //  🎨  إعدادات الثيم والواجهة
  // ─────────────────────────────────────────
  THEME: Object.freeze({
    DEFAULT         : 'dark',            // الثيم الافتراضي: 'dark' | 'light'
    ACCENT_COLOR    : '#e50914',         // اللون المميز (أحمر Netflix-style)
    SECONDARY_COLOR : '#f5c518',         // اللون الثانوي (ذهبي IMDb-style)
    FONT_FAMILY     : 'Cairo, sans-serif',
    ENABLE_BLUR     : true,              // تأثير الضبابية في الخلفية
    ENABLE_PARTICLES: false,             // جسيمات متحركة في الخلفية
  }),

  // ─────────────────────────────────────────
  //  ⚡  إعدادات الأداء والكاش
  // ─────────────────────────────────────────
  PERFORMANCE: Object.freeze({
    CACHE_DURATION_MIN : 30,     // مدة الكاش بالدقائق
    MAX_CACHE_ITEMS    : 100,    // أقصى عدد عناصر في الكاش
    ENABLE_CACHE       : true,
    REQUEST_TIMEOUT_MS : 8000,   // مهلة انتظار الطلبات
  }),

  // ─────────────────────────────────────────
  //  ℹ️  معلومات الموقع
  // ─────────────────────────────────────────
  APP: Object.freeze({
    NAME        : 'Cinema-ROX',
    VERSION     : '2.0.0',
    DESCRIPTION : 'موقع أفلام ومسلسلات بمستوى عالمي',
    AUTHOR      : 'Cinema-ROX Team',
  }),
  
NEWS: Object.freeze({
    PROXY  : 'https://api.rss2json.com/v1/api.json?rss_url=',
    CINEMA : 'https://www.aljazeera.net/rss/culture-arts',
    ANIME  : 'https://myanimelist.net/rss/news.xml',
  }),
});

// ─────────────────────────────────────────
//  🛠️  دوال مساعدة (Helpers)
// ─────────────────────────────────────────

/**
 * يبني رابط صورة TMDB بالحجم المطلوب
 * @param {string} path   - مسار الصورة من TMDB
 * @param {string} size   - الحجم: 'SM' | 'MD' | 'LG' | 'XL' | 'BACKDROP' | 'ORIGINAL'
 * @returns {string}
 */
function buildImageURL(path, size = 'LG') {
  if (!path) return CONFIG.IMAGES.PLACEHOLDER;
  const base = CONFIG.IMAGES[size] || CONFIG.IMAGES.POSTER_LG;
  return `${base}${path}`;
}

/**
 * يبني رابط TMDB API كاملاً مع المفتاح واللغة
 * @param {string} endpoint  - مثال: '/movie/popular'
 * @param {Object} params    - بارامترات إضافية
 * @returns {string}
 */
function buildTMDBUrl(endpoint, params = {}) {
  const url = new URL(`${CONFIG.API.TMDB_BASE}${endpoint}`);
  url.searchParams.set('api_key', CONFIG.KEYS.TMDB);
  url.searchParams.set('language', CONFIG.LOCALE.DEFAULT_LANG);
  url.searchParams.set('region',   CONFIG.LOCALE.REGION);
  for (const [key, val] of Object.entries(params)) {
    url.searchParams.set(key, val);
  }
  return url.toString();
}
const IMG_W300  = 'https://image.tmdb.org/t/p/w300';
