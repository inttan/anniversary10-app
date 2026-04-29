'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type Letter = {
  id: string
  from_name: string
  content: string
  unlock_date: string
  is_opened: boolean
}

const PARAGRAPHS = (content: string) =>
  content.split('\n\n').filter(Boolean)

export default function FutureLetter() {
  const [letter, setLetter]       = useState<Letter | null>(null)
  const [canOpen, setCanOpen]     = useState(false)
  const [isOpen, setIsOpen]       = useState(false)
  const [showHearts, setShowHearts] = useState(false)
  const [timeLeft, setTimeLeft]   = useState({ d: 0, h: 0, m: 0, s: 0 })
  const [loading, setLoading]     = useState(true)

  const supabase = createClient()

  // Fetch surat dari Supabase
  useEffect(() => {
    const fetchLetter = async () => {
      const { data } = await supabase
        .from('letters')
        .select('*')
        .eq('from_name', 'Intan')
        .single()
      if (data) setLetter(data)
      setLoading(false)
    }
    fetchLetter()
  }, [])

  // Countdown real-time
  useEffect(() => {
    if (!letter) return
    const unlock = new Date(letter.unlock_date + 'T00:00:00')

    const tick = () => {
      const diff = unlock.getTime() - Date.now()
      if (diff <= 0) {
        setCanOpen(true)
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 })
        return
      }
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [letter])

  const handleOpen = async () => {
    if (!canOpen || !letter) return

    // Update is_opened di Supabase
    await supabase
      .from('letters')
      .update({ is_opened: true })
      .eq('id', letter.id)

    setIsOpen(true)
    setShowHearts(true)
    setTimeout(() => setShowHearts(false), 3000)
  }

  const pad = (n: number) => String(n).padStart(2, '0')

  if (loading) return (
    <div className="rounded-2xl border border-white/8 bg-white/3 p-8 text-center">
      <p className="text-white/30 text-sm">Loading...</p>
    </div>
  )

  if (!letter) return null

  return (
    <>
      {showHearts && <HeartBurst />}

      {!isOpen ? (
        // ── SEALED ──────────────────────────────────────────
        <div className="rounded-2xl border border-white/8 bg-white/3 p-6 text-center">

          <FlowerBorder />

          <div
            className="text-6xl my-4 inline-block cursor-pointer transition-transform hover:scale-105"
            onClick={!canOpen ? undefined : handleOpen}
            style={{ animation: 'pulse 2.4s ease infinite' }}
          >
            💌
          </div>

          <h2 className="font-serif text-2xl text-pink-200 font-normal mb-1">
            For Pansy
          </h2>
          <p className="font-serif italic text-xs text-pink-200/40 mb-4">
            A letter from ur Sayang · Written with love
          </p>

          <div className="inline-flex items-center gap-2 bg-pink-900/10 border border-pink-500/20 rounded-full px-4 py-1.5 text-xs text-pink-200/60 mb-5">
            🔒 Sealed until June 30, 2026
          </div>

          {/* Countdown */}
          {!canOpen && (
            <div className="flex justify-center gap-3 mb-6">
              {[
                { val: pad(timeLeft.d), label: 'Days' },
                { val: pad(timeLeft.h), label: 'Hours' },
                { val: pad(timeLeft.m), label: 'Mins' },
                { val: pad(timeLeft.s), label: 'Secs' },
              ].map(({ val, label }) => (
                <div key={label} className="bg-white/4 border border-pink-200/10 rounded-xl px-4 py-2.5 text-center min-w-[58px]">
                  <div className="font-serif text-xl text-pink-200">{val}</div>
                  <div className="text-[9px] text-pink-200/30 tracking-widest uppercase mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleOpen}
            disabled={!canOpen}
            className={`w-full max-w-xs py-3 rounded-xl border text-sm font-medium transition
              ${canOpen
                ? 'border-pink-500/30 bg-pink-900/20 text-pink-200 hover:bg-pink-900/35 cursor-pointer'
                : 'border-white/8 bg-white/3 text-white/20 cursor-not-allowed'
              }`}
          >
            {canOpen ? '💌 Open this letter' : '🔒 Not yet, sayang...'}
          </button>

          <FlowerBorder flipped />
        </div>

      ) : (
        // ── LETTER TERBUKA ───────────────────────────────────
        <div className="animate-[fadeUp_0.9s_ease_forwards]">
          <div className="bg-gradient-to-b from-pink-50 via-rose-50 to-pink-50 rounded-2xl p-9 relative overflow-hidden shadow-2xl shadow-pink-900/30">

            {/* Corner flowers */}
            {['🌸','🌺','🌷','🌸'].map((f, i) => (
              <span key={i} className="absolute text-2xl opacity-25 pointer-events-none" style={{
                top:    i < 2 ? 10 : 'auto',
                bottom: i >= 2 ? 10 : 'auto',
                left:   i % 2 === 0 ? 10 : 'auto',
                right:  i % 2 === 1 ? 10 : 'auto',
                transform: `rotate(${[-20,20,20,-20][i]}deg)`,
              }}>{f}</span>
            ))}

            {/* Header */}
            <div className="text-center mb-7">
              <p className="text-[10px] tracking-widest text-rose-400/50 uppercase mb-2">
                April 30, 2026 · 10th Month
              </p>
              <h2 className="font-serif italic text-3xl text-rose-800 font-normal mb-2">
                To my dearest Pansy,
              </h2>
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent mx-auto mb-2" />
              <div className="text-sm tracking-[6px] text-rose-400/40">🌸 ✦ 🌸</div>
            </div>

            {/* Content */}
            <div className="font-serif text-[14.5px] text-rose-950 leading-[1.95]">
              {PARAGRAPHS(letter.content).map((para, i) => (
                <p key={i} className="mb-4" dangerouslySetInnerHTML={{ __html: para }} />
              ))}
            </div>

            {/* Sign off */}
            <div className="text-right mt-8 pt-5 border-t border-rose-200/60">
              <p className="text-[10px] tracking-widest text-rose-400/40 uppercase mb-1">Always yours,</p>
              <p className="font-serif italic text-2xl text-rose-700">Intan 🌸</p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="block mx-auto mt-4 text-xs text-pink-200/25 hover:text-pink-200/50 bg-transparent border-none cursor-pointer transition"
          >
            ← Seal again
          </button>
        </div>
      )}
    </>
  )
}

// ── Helper components ─────────────────────────────────────────────────────────

function FlowerBorder({ flipped = false }: { flipped?: boolean }) {
  return (
    <svg viewBox="0 0 440 64" xmlns="http://www.w3.org/2000/svg"
      className="w-full" style={{ height: 56, opacity: 0.5, transform: flipped ? 'scaleY(-1)' : undefined }}>
      <g>
        <ellipse cx="32" cy="40" rx="8" ry="13" fill="#f0a0b8" transform="rotate(-30 32 40)"/>
        <ellipse cx="46" cy="30" rx="8" ry="13" fill="#e87098" transform="rotate(15 46 30)"/>
        <ellipse cx="22" cy="28" rx="7" ry="11" fill="#f5b8cc" transform="rotate(-60 22 28)"/>
        <ellipse cx="40" cy="46" rx="7" ry="11" fill="#e890b0" transform="rotate(50 40 46)"/>
        <circle cx="35" cy="37" r="5" fill="#ffd0e0"/>
        <path d="M18 58 Q26 42 35 37" stroke="#b87090" strokeWidth="1.5" fill="none"/>
        <path d="M52 60 Q44 46 35 37" stroke="#b87090" strokeWidth="1.5" fill="none"/>
        <ellipse cx="200" cy="22" rx="6" ry="10" fill="#f5a0c0" transform="rotate(0 200 22)"/>
        <ellipse cx="210" cy="17" rx="6" ry="10" fill="#e880a8" transform="rotate(36 210 17)"/>
        <ellipse cx="218" cy="24" rx="6" ry="10" fill="#f0b0c8" transform="rotate(72 218 24)"/>
        <ellipse cx="208" cy="30" rx="6" ry="10" fill="#e890b0" transform="rotate(108 208 30)"/>
        <ellipse cx="198" cy="27" rx="6" ry="10" fill="#f5a8cc" transform="rotate(144 198 27)"/>
        <circle cx="207" cy="23" r="4" fill="#ffd8e8"/>
        <ellipse cx="408" cy="40" rx="8" ry="13" fill="#f0a0b8" transform="rotate(30 408 40)"/>
        <ellipse cx="394" cy="30" rx="8" ry="13" fill="#e87098" transform="rotate(-15 394 30)"/>
        <ellipse cx="418" cy="28" rx="7" ry="11" fill="#f5b8cc" transform="rotate(60 418 28)"/>
        <ellipse cx="400" cy="46" rx="7" ry="11" fill="#e890b0" transform="rotate(-50 400 46)"/>
        <circle cx="405" cy="37" r="5" fill="#ffd0e0"/>
        <path d="M422 58 Q414 42 405 37" stroke="#b87090" strokeWidth="1.5" fill="none"/>
        <path d="M388 60 Q396 46 405 37" stroke="#b87090" strokeWidth="1.5" fill="none"/>
      </g>
    </svg>
  )
}

function HeartBurst() {
  const items = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    emoji: ['💗','🌸','💕','🌷','💌','✨','🩷'][i % 7],
    left:  `${10 + Math.random() * 80}%`,
    top:   `${20 + Math.random() * 60}%`,
    size:  14 + Math.random() * 14,
    delay: `${i * 70}ms`,
  }))
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {items.map(h => (
        <div key={h.id} className="absolute animate-[heartFloat_2s_ease_forwards]"
          style={{ left: h.left, top: h.top, fontSize: h.size, animationDelay: h.delay }}>
          {h.emoji}
        </div>
      ))}
    </div>
  )
}