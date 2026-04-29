'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type Task = {
  id: string
  title: string
  description: string | null
  category: 'romantic' | 'utilitas'
  photo_reference_url: string | null
  status: boolean
  completion_photo_url: string | null
}

export default function TaskList() {
  const [tasks, setTasks]         = useState<Task[]>([])
  const [loading, setLoading]     = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [done, setDone]           = useState<string | null>(null)
  const inputRefs                 = useRef<Record<string, HTMLInputElement | null>>({})
  const supabase                  = createClient()

  useEffect(() => { fetchTasks() }, [])

  const fetchTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: true })
    if (data) setTasks(data)
    setLoading(false)
  }

  const toggleStatus = async (task: Task) => {
  const newStatus = !task.status
  await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id)
  setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
}

  const deleteProof = async (task: Task) => {
    if (!window.confirm('Remove proof photo and reopen this task?')) return
    if (task.completion_photo_url) {
      const path = task.completion_photo_url.split('/proofs/')[1]
      await supabase.storage.from('proofs').remove([path])
    }
    await supabase
      .from('tasks')
      .update({ completion_photo_url: null, status: false })
      .eq('id', task.id)
    setTasks(prev => prev.map(t =>
      t.id === task.id ? { ...t, status: false, completion_photo_url: null } : t
    ))
  }

  const uploadProof = async (taskId: string, file: File) => {
    setUploading(taskId)
    const ext  = file.name.split('.').pop()
    const path = `${taskId}-${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('proofs')
      .upload(path, file, { upsert: true })

    if (error) { console.error(error); setUploading(null); return }

    const { data: { publicUrl } } = supabase.storage
      .from('proofs')
      .getPublicUrl(path)

    await supabase
      .from('tasks')
      .update({ completion_photo_url: publicUrl, status: true })
      .eq('id', taskId)

    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, status: true, completion_photo_url: publicUrl } : t
    ))
    setUploading(null)
    setDone(taskId)
    setTimeout(() => setDone(null), 3000)
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '24px 0' }}>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Loading tasks...</p>
    </div>
  )

  const completed = tasks.filter(t => t.status).length
  const percent   = tasks.length ? Math.round((completed / tasks.length) * 100) : 0

  return (
    <div>
      {/* Progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
          {completed}/{tasks.length} completed
        </span>
        <span style={{ fontSize: 12, color: 'rgba(232,160,176,0.6)' }}>{percent}%</span>
      </div>
      <div style={{ width: '100%', height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 4, marginBottom: 16, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${percent}%`,
          background: 'linear-gradient(90deg, rgba(220,80,120,0.6), rgba(160,80,220,0.6))',
          borderRadius: 4,
          transition: 'width 0.7s ease',
        }} />
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tasks.map(task => (
          <div key={task.id} style={{
            position: 'relative',
            background: task.status ? 'rgba(180,50,90,0.06)' : 'rgba(255,255,255,0.03)',
            border: `0.5px solid ${task.status ? 'rgba(220,80,120,0.2)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 16,
            padding: '14px 16px',
            transition: 'all 0.3s',
          }}>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>

              {/* Checkbox */}
              <button
                onClick={() => toggleStatus(task)}
                style={{
                  marginTop: 2, width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: task.status ? 'rgba(220,80,120,0.3)' : 'transparent',
                  border: `0.5px solid ${task.status ? 'rgba(220,80,120,0.5)' : 'rgba(255,255,255,0.15)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {task.status && <span style={{ color: '#e8a0b0', fontSize: 11 }}>✓</span>}
              </button>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>

                {/* Title + badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                  <p style={{
                    fontSize: 14, fontWeight: 500, margin: 0,
                    color: task.status ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.85)',
                    textDecoration: task.status ? 'line-through' : 'none',
                  }}>
                    {task.title}
                  </p>
                  <span style={{
                    fontSize: 9, padding: '2px 8px', borderRadius: 20,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    background: task.category === 'romantic' ? 'rgba(220,80,120,0.1)' : 'rgba(80,120,220,0.1)',
                    color:      task.category === 'romantic' ? 'rgba(232,160,176,0.7)' : 'rgba(160,180,255,0.7)',
                    border:     `0.5px solid ${task.category === 'romantic' ? 'rgba(220,80,120,0.2)' : 'rgba(80,120,220,0.2)'}`,
                  }}>
                    {task.category}
                  </span>
                </div>

                {/* Description */}
                {task.description && (
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '0 0 10px', lineHeight: 1.6 }}>
                    {task.description}
                  </p>
                )}

                {/* Memory reference */}
                {task.photo_reference_url && (
                  <div style={{ marginBottom: 10 }}>
                    <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                      Memory Reference
                    </p>
                    <img src={task.photo_reference_url} alt="reference"
                      style={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 10, opacity: 0.6 }} />
                  </div>
                )}

                {/* Proof section */}
                {!task.status ? (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      ref={el => { inputRefs.current[task.id] = el }}
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) uploadProof(task.id, file)
                      }}
                      style={{ display: 'none' }}
                    />
                    <button
                      onClick={() => inputRefs.current[task.id]?.click()}
                      disabled={uploading === task.id}
                      style={{
                        fontSize: 12, padding: '6px 14px', borderRadius: 10,
                        border: '0.5px solid rgba(220,80,120,0.2)',
                        color: 'rgba(232,160,176,0.6)',
                        background: 'rgba(220,80,120,0.05)',
                        cursor: 'pointer',
                        opacity: uploading === task.id ? 0.4 : 1,
                        fontFamily: 'inherit',
                      }}
                    >
                      {uploading === task.id ? 'Uploading...' : '📸 Upload Proof of Love'}
                    </button>
                  </div>
                ) : (
                  <div>
                    {task.completion_photo_url && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <p style={{ fontSize: 9, color: 'rgba(232,160,176,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
                            Proof ✓
                          </p>
                          <button
                            onClick={() => deleteProof(task)}
                            style={{
                              fontSize: 10, color: 'rgba(255,255,255,0.25)',
                              background: 'none', border: 'none',
                              cursor: 'pointer', fontFamily: 'inherit',
                            }}
                          >
                            remove photo
                          </button>
                        </div>
                        <img src={task.completion_photo_url} alt="proof"
                          style={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 10, opacity: 0.7 }} />
                      </div>
                    )}
                    {done === task.id && (
                      <p style={{ fontSize: 12, color: 'rgba(232,160,176,0.7)', marginTop: 8, textAlign: 'center' }}>
                        🎉 Challenge Accomplished!
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No tasks yet.</p>
        </div>
      )}
    </div>
  )
}