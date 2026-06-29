'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

// ── Types ──────────────────────────────────────────────────────────────────────

type MonthMemory = {
  id: string
  month_index: number       // 0 = Jun 2025, 11 = Jun 2026
  title: string
  description: string | null
  photo_url: string | null
  emoji: string | null
}

// ── Month metadata ─────────────────────────────────────────────────────────────

const MONTH_LABELS = [
  { short: 'Jul', full: 'Jul 2025',  num: '01' },
  { short: 'Aug', full: 'Aug 2025',  num: '02' },
  { short: 'Sep', full: 'Sep 2025',  num: '03' },
  { short: 'Oct', full: 'Oct 2025',  num: '04' },
  { short: 'Nov', full: 'Nov 2025',  num: '05' },
  { short: 'Dec', full: 'Dec 2025',  num: '06' },
  { short: 'Jan', full: 'Jan 2026',  num: '07' },
  { short: 'Feb', full: 'Feb 2026',  num: '08' },
  { short: 'Mar', full: 'Mar 2026',  num: '09' },
  { short: 'Apr', full: 'Apr 2026',  num: '10' },
  { short: 'May', full: 'May 2026',  num: '11' },
  { short: 'Jun', full: 'Jun 2026',  num: '12' },
]

// ── Supabase table: month_memories
// Required columns: id (uuid), month_index (int), title (text),
//                   description (text nullable), photo_url (text nullable),
//                   emoji (text nullable)
// Run this SQL to create:
/*
  create table month_memories (
    id          uuid primary key default gen_random_uuid(),
    month_index int  not null unique,
    title       text not null,
    description text,
    photo_url   text,
    emoji       text,
    created_at  timestamptz default now()
  );
*/

export default function MonthTimeline() {
  const [memories, setMemories]   = useState<MonthMemory[]>([])
  const [active, setActive]       = useState<number>(0)
  const [editing, setEditing]     = useState(false)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading]     = useState(true)
  const [draft, setDraft]         = useState({ title: '', description: '', emoji: '🌸' })
  const fileRef                   = useRef<HTMLInputElement>(null)
  const supabase                  = createClient()

  useEffect(() => { fetchMemories() }, [])

  const fetchMemories = async () => {
    const { data } = await supabase.from('month_memories').select('*')
    if (data) setMemories(data)
    setLoading(false)
  }

  const memoryFor = (idx: number) => memories.find(m => m.month_index === idx) ?? null

  const activeMemory = memoryFor(active)

  // ── Save / upsert memory ─────────────────────────────────────────────────────

  const saveMemory = async (photoUrl?: string) => {
    const payload = {
      month_index:  active,
      title:        draft.title || MONTH_LABELS[active].full,
      description:  draft.description || null,
      emoji:        draft.emoji || '🌸',
      photo_url:    photoUrl ?? activeMemory?.photo_url ?? null,
    }

    if (activeMemory) {
      await supabase.from('month_memories').update(payload).eq('id', activeMemory.id)
    } else {
      await supabase.from('month_memories').insert(payload)
    }

    fetchMemories()
    setEditing(false)
  }

  // ── Upload photo ─────────────────────────────────────────────────────────────

  const uploadPhoto = async (file: File) => {
    setUploading(true)
    const ext  = file.name.split('.').pop()
    const path = `month-${active}-${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('memories')
      .upload(path, file, { upsert: true })

    if (error) { console.error(error); setUploading(false); return }

    const { data: { publicUrl } } = supabase.storage.from('memories').getPublicUrl(path)
    setUploading(false)
    await saveMemory(publicUrl)
  }

  // ── Open edit form prepopulated ───────────────────────────────────────────────

  const openEdit = () => {
    setDraft({
      title:       activeMemory?.title       ?? '',
      description: activeMemory?.description ?? '',
      emoji:       activeMemory?.emoji       ?? '🌸',
    })
    setEditing(true)
  }

  if (loading) return (
    <div style={{ padding: '24px 0', textAlign: 'center' }}>
      <p style={{ fontSize: 12, color: 'rgba(192,132,252,0.3)' }}>Loading memories...</p>
    </div>
  )

  const EMOJIS = ['🌸', '🌷', '💜', '🌙', '✨', '🎵', '☕', '🌧', '🌈', '💌', '🎉', '🥂']

  return (
    <div style={{
      background: 'rgba(124,58,237,0.05)',
      border: '0.5px solid rgba(124,58,237,0.18)',
      borderRadius: 20,
      padding: '18px 16px',
      marginBottom: 16,
    }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <p style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 15, color: '#d0b0f0' }}>
          Our Journey
        </p>
        <span style={{ fontSize: 10, color: 'rgba(192,132,252,0.3)' }}>12 months</span>
      </div>

      {/* Month grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 14 }}>
        {MONTH_LABELS.map((m, i) => {
          const mem = memoryFor(i)
          const isActive = active === i
          return (
            <button
              key={i}
              onClick={() => { setActive(i); setEditing(false) }}
              style={{
                background:   isActive ? 'rgba(124,58,237,0.18)' : 'rgba(124,58,237,0.04)',
                border:       `0.5px solid ${isActive ? 'rgba(124,58,237,0.5)' : 'rgba(124,58,237,0.12)'}`,
                borderRadius: 10,
                padding:      '8px 4px',
                cursor:       'pointer',
                textAlign:    'center',
                transition:   'all 0.2s',
              }}
            >
              <p style={{
                fontSize: 12,
                color: isActive ? '#c084fc' : 'rgba(192,132,252,0.35)',
                fontFamily: 'var(--font-playfair), serif',
                margin: 0,
              }}>{m.num}</p>
              <p style={{
                fontSize: 8, color: isActive ? 'rgba(192,132,252,0.5)' : 'rgba(192,132,252,0.2)',
                letterSpacing: '0.05em', marginTop: 2,
              }}>{m.short}</p>
              {/* Memory dot */}
              {mem && (
                <div style={{
                  width: 4, height: 4, borderRadius: '50%',
                  background: '#7c3aed', margin: '4px auto 0',
                }} />
              )}
            </button>
          )
        })}
      </div>

      {/* Memory panel */}
      <div style={{
        background: 'rgba(124,58,237,0.04)',
        border: '0.5px solid rgba(124,58,237,0.12)',
        borderRadius: 12,
        padding: '14px',
        minHeight: 120,
      }}>
        {!editing ? (
          <>
            <p style={{ fontSize: 9, letterSpacing: '0.1em', color: 'rgba(192,132,252,0.4)', textTransform: 'uppercase', marginBottom: 4 }}>
              {MONTH_LABELS[active].full}
            </p>

            {activeMemory ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 22 }}>{activeMemory.emoji ?? '🌸'}</span>
                  <p style={{
                    fontFamily: 'var(--font-playfair), serif',
                    fontSize: 15, color: '#d0b0f0',
                  }}>{activeMemory.title}</p>
                </div>
                {activeMemory.description && (
                  <p style={{ fontSize: 12, color: 'rgba(192,132,252,0.45)', lineHeight: 1.7, marginBottom: 10 }}>
                    {activeMemory.description}
                  </p>
                )}
                {activeMemory.photo_url && (
                  <img
                    src={activeMemory.photo_url}
                    alt="memory"
                    style={{ width: '100%', maxHeight: 140, objectFit: 'cover', borderRadius: 10, opacity: 0.75, marginBottom: 10 }}
                  />
                )}
                <button
                  onClick={openEdit}
                  style={{
                    fontSize: 11, padding: '5px 12px', borderRadius: 8,
                    border: '0.5px solid rgba(124,58,237,0.25)',
                    color: 'rgba(192,132,252,0.6)', background: 'transparent',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Edit memory
                </button>
              </>
            ) : (
              <>
                <p style={{ fontSize: 13, color: 'rgba(192,132,252,0.25)', marginBottom: 12, fontStyle: 'italic' }}>
                  No memory yet for this month...
                </p>
                <button
                  onClick={openEdit}
                  style={{
                    fontSize: 12, padding: '8px 16px', borderRadius: 10,
                    border: '0.5px solid rgba(124,58,237,0.3)',
                    color: '#c084fc', background: 'rgba(124,58,237,0.08)',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  + Add memory
                </button>
              </>
            )}
          </>
        ) : (
          /* Edit form */
          <>
            <p style={{ fontSize: 9, letterSpacing: '0.1em', color: 'rgba(192,132,252,0.4)', textTransform: 'uppercase', marginBottom: 10 }}>
              {MONTH_LABELS[active].full} · Edit
            </p>

            {/* Emoji picker */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setDraft(d => ({ ...d, emoji: e }))}
                  style={{
                    fontSize: 18, background: draft.emoji === e ? 'rgba(124,58,237,0.2)' : 'transparent',
                    border: `0.5px solid ${draft.emoji === e ? 'rgba(124,58,237,0.4)' : 'transparent'}`,
                    borderRadius: 8, padding: '3px 5px', cursor: 'pointer',
                  }}>{e}</button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Title for this month..."
              value={draft.title}
              onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
              style={{
                width: '100%', background: 'rgba(124,58,237,0.05)',
                border: '0.5px solid rgba(124,58,237,0.2)', borderRadius: 8,
                padding: '8px 10px', fontSize: 13, color: '#d0b0f0',
                fontFamily: 'inherit', marginBottom: 8, boxSizing: 'border-box',
                outline: 'none',
              }}
            />

            <textarea
              placeholder="What happened this month..."
              value={draft.description}
              onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
              rows={3}
              style={{
                width: '100%', background: 'rgba(124,58,237,0.05)',
                border: '0.5px solid rgba(124,58,237,0.2)', borderRadius: 8,
                padding: '8px 10px', fontSize: 12, color: 'rgba(192,132,252,0.7)',
                fontFamily: 'inherit', resize: 'none', marginBottom: 10,
                boxSizing: 'border-box', lineHeight: 1.6, outline: 'none',
              }}
            />

            {/* Photo upload */}
            <input
              type="file" accept="image/*" ref={fileRef}
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadPhoto(f) }}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{
                fontSize: 12, padding: '6px 12px', borderRadius: 8,
                border: '0.5px dashed rgba(124,58,237,0.3)',
                color: 'rgba(192,132,252,0.5)', background: 'transparent',
                cursor: 'pointer', fontFamily: 'inherit', marginBottom: 10,
                opacity: uploading ? 0.4 : 1,
              }}
            >
              {uploading ? 'Uploading...' : '📷 Add photo'}
            </button>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => saveMemory()}
                disabled={!draft.title}
                style={{
                  flex: 1, padding: '9px', borderRadius: 10,
                  border: '0.5px solid rgba(124,58,237,0.4)',
                  background: 'rgba(124,58,237,0.12)', color: '#c084fc',
                  fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                  opacity: draft.title ? 1 : 0.4,
                }}
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                style={{
                  padding: '9px 14px', borderRadius: 10,
                  border: '0.5px solid rgba(255,255,255,0.08)',
                  background: 'transparent', color: 'rgba(255,255,255,0.3)',
                  fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
