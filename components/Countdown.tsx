'use client'
import { useEffect, useState } from 'react'

export default function Countdown() {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 })

  useEffect(() => {
    // Updated to 1 year anniversary
    const target = new Date('2026-06-30T00:00:00')
    const tick = () => {
      const diff = target.getTime() - Date.now()
      if (diff <= 0) return
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(30,10,60,0.25))',
      border: '0.5px solid rgba(124,58,237,0.2)',
      borderRadius: 20,
      padding: '24px 20px',
      textAlign: 'center',
      marginBottom: 16,
    }}>
      <p style={{
        fontSize: 10, letterSpacing: '0.18em',
        color: 'rgba(192,132,252,0.5)', textTransform: 'uppercase', marginBottom: 8,
      }}>
        Our Story
      </p>
      <h1 style={{
        fontFamily: 'var(--font-playfair), serif', fontSize: 34,
        color: '#f0e8ff', margin: '0 0 4px',
      }}>
        1 Year Together 🤍
      </h1>
      <p style={{ fontSize: 13, color: 'rgba(192,132,252,0.35)', marginBottom: 16 }}>
        Anniversary · April 30, 2027
      </p>

      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'rgba(124,58,237,0.08)', border: '0.5px solid rgba(124,58,237,0.2)',
        borderRadius: 24, padding: '5px 14px', fontSize: 11,
        color: 'rgba(192,132,252,0.5)', marginBottom: 20,
      }}>
        <span style={{
          width: 6, height: 6, background: '#c084fc',
          borderRadius: '50%', display: 'inline-block',
          animation: 'pulse 2s infinite',
        }} />
        LDR Mode · Connected
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {[
          { val: pad(time.h), label: 'Hours' },
          { val: pad(time.m), label: 'Mins' },
          { val: pad(time.s), label: 'Secs' },
          { val: '12',        label: 'Months' },
        ].map(({ val, label }) => (
          <div key={label} style={{
            background: 'rgba(124,58,237,0.06)',
            border: '0.5px solid rgba(124,58,237,0.15)',
            borderRadius: 12, padding: '10px 4px',
          }}>
            <div style={{
              fontFamily: 'var(--font-playfair), serif',
              fontSize: 22, color: '#c084fc',
            }}>{val}</div>
            <div style={{
              fontSize: 9, color: 'rgba(192,132,252,0.3)',
              letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2,
            }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
