'use client'
import { useState } from 'react'

const PLAYLISTS = {
  sad: [
    { name: "Hold On, We're Going Home", url: 'https://open.spotify.com/search/Hold%20On%20We%27re%20Going%20Home%20Drake', reason: "When distance hurts — home is each other." },
    { name: "Fire & Desire",             url: 'https://open.spotify.com/search/Fire%20and%20Desire%20Drake', reason: "Chill and dedicated. For the quiet longing night." },
    { name: "Jungle",                    url: 'https://open.spotify.com/search/Jungle%20Drake', reason: "Reflecting on how deep this feeling runs." },
    { name: "Passionfruit",              url: 'https://open.spotify.com/search/Passionfruit%20Drake', reason: "For trust across distance. Don't let it fade." },
  ],
  happy: [
    { name: "God's Plan",      url: 'https://open.spotify.com/search/Gods%20Plan%20Drake', reason: "30 months is not a coincidence. It's all part of the plan." },
    { name: "Nice For What",   url: 'https://open.spotify.com/search/Nice%20For%20What%20Drake', reason: "She's amazing and she deserves to feel it." },
    { name: "Best I Ever Had", url: 'https://open.spotify.com/search/Best%20I%20Ever%20Had%20Drake', reason: "From day one to month 30, the answer is still the same." },
    { name: "Legend",          url: 'https://open.spotify.com/search/Legend%20Drake', reason: "What you two have is iconic." },
  ],
  neutral: [
    { name: "Find Your Love", url: 'https://open.spotify.com/search/Find%20Your%20Love%20Drake', reason: "The effort to find the right person — and she is that person." },
    { name: "Papi's Home",    url: 'https://open.spotify.com/search/Papis%20Home%20Drake', reason: "I'm on my way back to you. Always." },
    { name: "Best I Ever Had",url: 'https://open.spotify.com/search/Best%20I%20Ever%20Had%20Drake', reason: "From day one to month 30, the answer is still the same." },
  ],
}

type Mood = 'sad' | 'happy' | 'neutral'

const MOOD_CONFIG = {
  sad:     { label: '🌧 Comfort mode', color: 'rgba(100,120,220,0.2)', textColor: '#a0b0ff', borderColor: 'rgba(100,120,220,0.3)' },
  happy:   { label: '✦ Good vibes',    color: 'rgba(220,160,60,0.2)',  textColor: '#ffd080', borderColor: 'rgba(220,160,60,0.3)' },
  neutral: { label: '🌙 Chill mode',   color: 'rgba(180,60,100,0.2)', textColor: '#ff90b0', borderColor: 'rgba(180,60,100,0.3)' },
}

export default function DrakePlayer() {
  const [text, setText]           = useState('')
  const [mood, setMood]           = useState<Mood | null>(null)
  const [activeIdx, setActiveIdx] = useState(0)

  const analyze = () => {
    if (!text.trim()) return
    const lower = text.toLowerCase()
    const pos = ['happy','good','great','love','excited','grateful','smile','amazing','wonderful','lucky','beautiful','lovely','joy','blessed']
    const neg = ['sad','tired','lonely','hard','cry','hurt','pain','scared','worried','anxious','empty','miss','dark']
    let score = 0
    pos.forEach(w => { if (lower.includes(w)) score++ })
    neg.forEach(w => { if (lower.includes(w)) score-- })
    setMood(score > 0 ? 'happy' : score < 0 ? 'sad' : 'neutral')
    setActiveIdx(0)
  }

  const playlist = mood ? PLAYLISTS[mood] : null
  const config   = mood ? MOOD_CONFIG[mood] : null
  const active   = playlist?.[activeIdx]

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 20, marginBottom: 16 }}>
      <p style={{ fontFamily: 'var(--font-playfair), serif', fontStyle: 'italic', fontSize: 15, color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>
        "Tell me what's on your mind right now..."
      </p>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="I'm feeling a little tired but happy thinking about us..."
        style={{
          width: '100%', background: 'rgba(255,255,255,0.04)',
          border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 12,
          padding: 12, fontFamily: 'var(--font-dm-sans), sans-serif',
          fontSize: 13, color: '#fff', resize: 'none', height: 80,
          outline: 'none', boxSizing: 'border-box',
        }}
      />

      <button
        onClick={analyze}
        style={{
          width: '100%', marginTop: 10, padding: '10px 0',
          background: 'linear-gradient(135deg, rgba(180,60,100,0.4), rgba(100,60,160,0.4))',
          border: '0.5px solid rgba(220,100,140,0.3)', borderRadius: 12,
          color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          fontFamily: 'var(--font-dm-sans), sans-serif',
        }}
      >
        Analyze & Play Drake ♪
      </button>

      {mood && active && config && (
        <div style={{ marginTop: 16 }}>
          <span style={{
            display: 'inline-block', fontSize: 11, padding: '3px 12px',
            borderRadius: 20, background: config.color, color: config.textColor,
            border: `0.5px solid ${config.borderColor}`, marginBottom: 12,
          }}>
            {config.label}
          </span>

          <p style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 17, color: '#fff', marginBottom: 4 }}>
            {active.name}
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, marginBottom: 14 }}>
            {active.reason}
          </p>

          {/* Play on Spotify */}
          <a
            href={active.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 8, width: '100%', padding: '10px 0', background: '#1DB954',
              borderRadius: 12, color: '#000', fontSize: 13, fontWeight: 600,
              textDecoration: 'none', marginBottom: 14,
            }}
          >
            <span>▶</span> Play on Spotify
          </a>

          {/* Playlist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {playlist!.map((t, i) => (
              <button
                key={t.name}
                onClick={() => setActiveIdx(i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px',
                  background: i === activeIdx ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                  border: '0.5px solid rgba(255,255,255,0.06)',
                  borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                }}
              >
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', width: 16, textAlign: 'center' }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: 13, color: i === activeIdx ? '#e8a0b0' : 'rgba(255,255,255,0.55)' }}>
                  {t.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
