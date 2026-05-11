// /app/watch/[id]/page.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js'; // npm install hls.js

const PROXY = '/api/allanime';

export default function WatchPage({ params, searchParams }) {
  const showId  = params.id;
  const initEp  = Number(searchParams?.ep) || 1;
  const lang    = searchParams?.lang || 'sub';

  const [info,    setInfo]    = useState(null);
  const [ep,      setEp]      = useState(initEp);
  const [sources, setSources] = useState([]);
  const [stream,  setStream]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const videoRef = useRef(null);
  const hlsRef   = useRef(null);

  /* ─── جلب معلومات الأنمي مرة واحدة ─── */
  useEffect(() => {
    fetch(PROXY, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        action:  'episode',
        payload: { showId, ep, translationType: lang },
      }),
    })
    .then(r => r.json())
    .then(data => { setSources(data); setStream(pickBest(data)); })
    .catch(e  => setError(e.message))
    .finally(() => setLoading(false));
  }, [showId, ep, lang]);

  /* ─── HLS Player ─── */
  useEffect(() => {
    if (!stream || !videoRef.current) return;

    if (stream.type === 'hls') {
      if (hlsRef.current) hlsRef.current.destroy();
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(stream.url);
        hls.attachMedia(videoRef.current);
        hlsRef.current = hls;
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = stream.url;
      }
    }
  }, [stream]);

  /* ─── تغيير الحلقة ─── */
  function selectEp(n) {
    setEp(n);
    setStream(null);
    setLoading(true);
    setError(null);
    // تحديث URL بدون reload
    window.history.pushState({}, '', `?ep=${n}&lang=${lang}`);
  }

  function pickBest(srcs) {
    const m3u8  = srcs.find(s => s.sourceUrl?.includes('.m3u8'));
    const mp4   = srcs.find(s => s.sourceUrl?.includes('.mp4'));
    const embed = srcs.find(s => s.sourceUrl?.startsWith('http'));
    const s     = m3u8 || mp4 || embed || srcs[0];
    return s ? {
      url:  s.sourceUrl,
      type: m3u8 ? 'hls' : mp4 ? 'mp4' : 'iframe',
    } : null;
  }

  const totalEps = 24; // تجيبها من AniList لاحقاً

  return (
    <div style={{ background:'#060608', minHeight:'100vh', color:'#f0f0ff',
                  fontFamily:'Cairo, sans-serif', padding:'16px' }}>

      {/* ─── المشغّل ─── */}
      <div style={{ maxWidth:900, margin:'0 auto' }}>
        <div style={{ aspectRatio:'16/9', background:'#000',
                      borderRadius:14, overflow:'hidden', position:'relative' }}>
          {loading && (
            <div style={{ position:'absolute', inset:0, display:'flex',
                          alignItems:'center', justifyContent:'center',
                          color:'#66668a', fontSize:'.9rem' }}>
              ⏳ جاري التحميل...
            </div>
          )}
          {error && (
            <div style={{ position:'absolute', inset:0, display:'flex',
                          alignItems:'center', justifyContent:'center',
                          color:'#e63946', flexDirection:'column', gap:8 }}>
              <span style={{ fontSize:'1.5rem' }}>⚠️</span>
              <span>{error}</span>
            </div>
          )}
          {stream?.type === 'iframe' && (
            <iframe src={stream.url} style={{ width:'100%', height:'100%', border:'none' }}
              allowFullScreen allow="autoplay; fullscreen" referrerPolicy="no-referrer"/>
          )}
          {(stream?.type === 'hls' || stream?.type === 'mp4') && (
            <video ref={videoRef} controls autoPlay
              src={stream?.type === 'mp4' ? stream.url : undefined}
              style={{ width:'100%', height:'100%', background:'#000' }}/>
          )}
        </div>

        {/* ─── السورسات المتاحة ─── */}
        {sources.length > 0 && (
          <div style={{ marginTop:12, display:'flex', gap:8, flexWrap:'wrap' }}>
            <span style={{ color:'#66668a', fontSize:'.75rem', alignSelf:'center' }}>
              🔗 السورسات:
            </span>
            {sources.map((s, i) => (
              <button key={i}
                onClick={() => setStream({ url: s.sourceUrl,
                  type: s.sourceUrl?.includes('.m3u8') ? 'hls'
                      : s.sourceUrl?.includes('.mp4')  ? 'mp4' : 'iframe' })}
                style={{
                  background: stream?.url === s.sourceUrl ? '#e63946' : '#111118',
                  border:     '1px solid rgba(255,255,255,.08)',
                  color:      stream?.url === s.sourceUrl ? '#fff' : '#66668a',
                  padding:    '5px 12px', borderRadius:8,
                  cursor:'pointer', fontSize:'.72rem', fontFamily:'Cairo, sans-serif',
                }}>
                {s.sourceName || `سورس ${i+1}`}
              </button>
            ))}
          </div>
        )}

        {/* ─── الحلقات ─── */}
        <div style={{ marginTop:20, background:'#111118',
                      borderRadius:14, padding:14,
                      border:'1px solid rgba(255,255,255,.06)' }}>
          <div style={{ fontWeight:800, marginBottom:12, fontSize:'.85rem', color:'#66668a' }}>
            📋 الحلقات
          </div>
          <div style={{ display:'grid',
                        gridTemplateColumns:'repeat(auto-fill, minmax(48px, 1fr))',
                        gap:6, maxHeight:220, overflowY:'auto' }}>
            {Array.from({ length: totalEps }, (_, i) => i + 1).map(n => (
              <div key={n} onClick={() => selectEp(n)}
                style={{
                  background:   ep === n ? '#e63946' : '#18181f',
                  border:       `1px solid ${ep === n ? '#e63946' : 'rgba(255,255,255,.06)'}`,
                  borderRadius: 7, padding:'7px 3px',
                  textAlign:'center', fontSize:'.72rem',
                  fontWeight:700, cursor:'pointer',
                  transition:'all .2s',
                }}>
                {n}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
                  }
