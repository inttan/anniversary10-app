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
  const [letter, setLetter]         = useState<Letter | null>(null)
  const [canOpen, setCanOpen]       = useState(false)
  const [isOpen, setIsOpen]         = useState(false)
  const [showHearts, setShowHearts] = useState(false)
  const [timeLeft, setTimeLeft]     = useState({ d: 0, h: 0, m: 0, s: 0 })
  const [loading, setLoading]       = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const fetchLetter = async () => {
      const { data } = await supabase
        .from('letters')
        .select('*')
        .eq('from_name', 'Intan')
        .single()

      if (data) {
        setLetter(data)
        // If already opened previously, restore open state
        if (data.is_opened) setIsOpen(true)
      }
      setLoading(false)
    }
    fetchLetter()
  }, [])

  useEffect(() => {
    if (!letter) return
    // Updated unlock date: 1 year anniversary
    const unlock = new Date('2026-06-30T00:00:00')

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

    if (!letter.is_opened) {
      await supabase
        .from('letters')
        .update({ is_opened: true })
        .eq('id', letter.id)
      setLetter(prev => prev ? { ...prev, is_opened: true } : prev)
    }

    setIsOpen(true)
    setShowHearts(true)
    setTimeout(() => setShowHearts(false), 3000)
  }

  // Allow re-sealing visually (local only, DB stays is_opened: true)
  const handleSeal = () => setIsOpen(false)

  const pad = (n: number) => String(n).padStart(2, '0')

  if (loading) return (
    <div style={{ borderRadius: 20, border: '0.5px solid rgba(124,58,237,0.15)', padding: '28px 0', textAlign: 'center' }}>
      <p style={{ fontSize: 12, color: 'rgba(192,132,252,0.3)' }}>Loading...</p>
    </div>
  )

  if (!letter) return null

  return (
    <>
      {showHearts && <HeartBurst />}

      {!isOpen ? (
        // ── SEALED ─────────────────────────────────────────────────────────────
        <div style={{
          background: 'rgba(124,58,237,0.05)',
          border: '0.5px solid rgba(124,58,237,0.18)',
          borderRadius: 20,
          padding: '24px 20px',
          textAlign: 'center',
        }}>

          <div style={{ fontSize: 52, margin: '8px 0 14px', cursor: canOpen ? 'pointer' : 'default' }}
            onClick={canOpen ? handleOpen : undefined}>
            💌
          </div>

          <h2 style={{
            fontFamily: 'var(--font-playfair), serif', fontSize: 24,
            color: '#f0e8ff', fontWeight: 400, marginBottom: 4,
          }}>
            For Pansy
          </h2>
          <p style={{
            fontFamily: 'var(--font-playfair), serif', fontStyle: 'italic',
            fontSize: 11, color: 'rgba(192,132,252,0.35)', marginBottom: 16,
          }}>
            A letter from ur Sayang · 1 Year Edition
          </p>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(124,58,237,0.08)', border: '0.5px solid rgba(124,58,237,0.2)',
            borderRadius: 20, padding: '4px 14px', fontSize: 10,
            color: 'rgba(192,132,252,0.5)', marginBottom: 18,
          }}>
            Sealed until June 30, 2026
          </div>

          {/* Countdown */}
          {!canOpen && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 18 }}>
              {[
                { val: timeLeft.d,      label: 'Days' },
                { val: pad(timeLeft.h), label: 'Hours' },
                { val: pad(timeLeft.m), label: 'Mins' },
                { val: pad(timeLeft.s), label: 'Secs' },
              ].map(({ val, label }) => (
                <div key={label} style={{
                  background: 'rgba(124,58,237,0.06)',
                  border: '0.5px solid rgba(124,58,237,0.15)',
                  borderRadius: 10, padding: '8px 12px', textAlign: 'center', minWidth: 52,
                }}>
                  <div style={{
                    fontFamily: 'var(--font-playfair), serif',
                    fontSize: 18, color: '#c084fc',
                  }}>{val}</div>
                  <div style={{
                    fontSize: 8, color: 'rgba(192,132,252,0.3)',
                    letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2,
                  }}>{label}</div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleOpen}
            disabled={!canOpen}
            style={{
              width: '100%', maxWidth: 320, padding: '12px 0',
              borderRadius: 12,
              border: `0.5px solid ${canOpen ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.06)'}`,
              background: canOpen ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.02)',
              color: canOpen ? '#c084fc' : 'rgba(255,255,255,0.18)',
              fontSize: 13, cursor: canOpen ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit', transition: 'all 0.3s',
            }}
          >
            {canOpen ? '💌 Open this letter' : 'Not yet, sayang...'}
          </button>
        </div>

      ) : (
        // ── LETTER OPEN ─────────────────────────────────────────────────────────
        <div style={{ animation: 'fadeIn 0.9s ease forwards' }}>
          <div style={{
            background: 'linear-gradient(160deg, #fff8f8, #fff0f5, #fef8ff)',
            borderRadius: 20, padding: '36px 28px',
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(100,50,120,0.15)',
          }}>
            {/* Corner decorations */}
            {(['🌸','🌺','🌷','🌸'] as const).map((f, i) => (
              <span key={i} style={{
                position: 'absolute', fontSize: 22, opacity: 0.22,
                pointerEvents: 'none',
                top:    i < 2 ? 10 : 'auto',
                bottom: i >= 2 ? 10 : 'auto',
                left:   i % 2 === 0 ? 10 : 'auto',
                right:  i % 2 === 1 ? 10 : 'auto',
                transform: `rotate(${[-20,20,20,-20][i]}deg)`,
              }}>{f}</span>
            ))}

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <p style={{
                fontSize: 9, letterSpacing: '0.16em', color: 'rgba(160,60,100,0.4)',
                textTransform: 'uppercase', marginBottom: 8,
              }}>
                April 30, 2027 · 1 Year Together
              </p>
              <h2 style={{
                fontFamily: 'var(--font-playfair), serif', fontStyle: 'italic',
                fontSize: 28, color: '#7c2d4a', fontWeight: 400, marginBottom: 8,
              }}>
                To my dearest Pansy,
              </h2>
              <div style={{ width: 60, height: 1, background: 'linear-gradient(to right, transparent, #e8a0b8, transparent)', margin: '0 auto 8px' }} />
              <p style={{ fontSize: 12, letterSpacing: '0.4em', color: 'rgba(160,60,100,0.3)' }}>
                🌸 ✦ 🌸
              </p>
            </div>

            {/* Body */}
            <div style={{
              fontFamily: 'var(--font-playfair), serif',
              fontSize: 14, color: '#4a1a2e', lineHeight: 1.95,
            }}>
              {PARAGRAPHS(letter.content).map((para, i) => (
                <p key={i} style={{ marginBottom: 16 }}
                  dangerouslySetInnerHTML={{ __html: para }} />
              ))}
            </div>

            {/* Sign off */}
            <div style={{
              textAlign: 'right', marginTop: 28, paddingTop: 20,
              borderTop: '0.5px solid rgba(200,100,130,0.2)',
            }}>
              <p style={{ fontSize: 9, letterSpacing: '0.14em', color: 'rgba(160,60,100,0.35)', textTransform: 'uppercase', marginBottom: 4 }}>
                Always yours,
              </p>
              <p style={{
                fontFamily: 'var(--font-playfair), serif', fontStyle: 'italic',
                fontSize: 24, color: '#9c3d5a',
              }}>
                Intan 🌸
              </p>
            </div>
          </div>

          <button
            onClick={handleSeal}
            style={{
              display: 'block', margin: '12px auto 0',
              fontSize: 11, color: 'rgba(192,132,252,0.25)',
              background: 'transparent', border: 'none',
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'color 0.2s',
            }}
          >
            ← Seal again
          </button>
        </div>
      )}
    </>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function HeartBurst() {
  const items = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    emoji: ['💜','🌸','💕','🌷','💌','✨','🩷'][i % 7],
    left:  `${10 + Math.random() * 80}%`,
    top:   `${20 + Math.random() * 60}%`,
    size:  14 + Math.random() * 14,
    delay: `${i * 70}ms`,
  }))
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50 }}>
      {items.map(h => (
        <div key={h.id}
          style={{
            position: 'absolute',
            left: h.left, top: h.top,
            fontSize: h.size,
            animationDelay: h.delay,
            animation: 'heartFloat 2s ease forwards',
          }}
        >
          {h.emoji}
        </div>
      ))}
    </div>
  )
}
