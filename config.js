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
// ===== إعدادات نظام الفيديو =====
VIDEO: Object.freeze({
    YOUTUBE_EMBED   : 'https://www.youtube.com/embed/',
    TMDB_VIDEO_PATH : '/videos',
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
