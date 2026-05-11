// /app/api/allanime/route.js
import { NextResponse } from 'next/server';

const AA_API   = 'https://api.allanime.day/api';
const AA_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36';
const AA_REF   = 'https://allmanga.to/';

/* ─── الـ Headers المطلوبة حتى لا يرفض السيرفر ─── */
function aaHeaders() {
  return {
    'User-Agent':           AA_AGENT,
    'Referer':              AA_REF,
    'Content-Type':         'application/json',
    'sec-ch-ua-platform':   '"Windows"',
  };
}

/* ─── دالة GraphQL مساعدة ─── */
async function aaQuery(query, variables = {}) {
  const url = new URL(AA_API);
  url.searchParams.set('variables',  JSON.stringify(variables));
  url.searchParams.set('extensions', JSON.stringify({
    persistedQuery: { version: 1, sha256Hash: hashQuery(query) }
  }));

  // AllAnime تستخدم GET مع query params
  const res = await fetch(url.toString(), {
    method:  'GET',
    headers: aaHeaders(),
    // مهم: لا cache في السيرفر حتى نجيب أحدث بيانات
    next:    { revalidate: 60 }
  });

  if (!res.ok) throw new Error(`AllAnime HTTP ${res.status}`);
  return res.json();
}

/* ─── POST endpoint — يستقبل الطلب من Frontend ─── */
export async function POST(request) {
  try {
    const { action, payload } = await request.json();

    if (action === 'search')  return NextResponse.json(await searchAnime(payload));
    if (action === 'episode') return NextResponse.json(await getEpisodeSources(payload));

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ════════════════════════════════
   1. البحث عن الأنمي
════════════════════════════════ */
const SEARCH_QUERY = `
query($search: SearchInput, $limit: Int, $page: Int, $translationType: VaildTranslationTypeEnumType) {
  shows(search: $search, limit: $limit, page: $page, translationType: $translationType) {
    edges {
      _id
      name
      englishName
      thumbnail
      episodeCount
      status
      genres
    }
  }
}`;

async function searchAnime({ q, limit = 8, translationType = 'sub' }) {
  const data = await aaQuery(SEARCH_QUERY, {
    search:          { allowAdult: false, query: q },
    limit,
    page:            1,
    translationType,
  });
  return data?.data?.shows?.edges || [];
}

/* ════════════════════════════════
   2. جلب سورسات الحلقة
════════════════════════════════ */
const EPISODE_QUERY = `
query($showId: String!, $translationType: VaildTranslationTypeEnumType!, $episodeString: String!) {
  episode(showId: $showId, translationType: $translationType, episodeString: $episodeString) {
    episodeString
    sourceUrls
  }
}`;

async function getEpisodeSources({ showId, ep, translationType = 'sub' }) {
  const data = await aaQuery(EPISODE_QUERY, {
    showId,
    translationType,
    episodeString: String(ep),
  });

  const raw = data?.data?.episode?.sourceUrls;
  if (!raw || !raw.length) throw new Error('لا توجد مصادر لهذه الحلقة');

  // فك تشفير الـ URLs (AllAnime تشفّرها بـ ROT13 أحياناً)
  const sources = raw
    .map(s => ({
      ...s,
      sourceUrl: decodeAaUrl(s.sourceUrl),
      priority:  s.priority || 0,
    }))
    .sort((a, b) => b.priority - a.priority); // الأفضل أولاً

  return sources;
}

/* ════════════════════════════════
   Helpers
════════════════════════════════ */

// AllAnime تستخدم ROT13 لإخفاء بعض الروابط
function decodeAaUrl(url = '') {
  if (!url.startsWith('--')) return url;
  // إزالة الـ prefix ثم ROT13
  return rot13(url.slice(2));
}

function rot13(str) {
  return str.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
}

// AllAnime تستخدم Persisted Queries — نحتاج SHA256 hash للـ query
// لأنه بيئة Node.js في Next.js نستخدم crypto
import { createHash } from 'crypto';
function hashQuery(query) {
  return createHash('sha256').update(query.trim()).digest('hex');
  }
