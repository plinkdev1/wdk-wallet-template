'use client'

import { useEffect } from 'react'

export function Modal ({ title, onClose, children }: { title: string, onClose: () => void, children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div onClick={onClose} style={overlay}>
      <div onClick={(e) => e.stopPropagation()} style={panel}>
        <div style={header}>
          <strong style={{ fontSize: 16 }}>{title}</strong>
          <button onClick={onClose} aria-label="Close" style={closeBtn}>✕</button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  )
}

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 50
}
const panel: React.CSSProperties = {
  width: '100%', maxWidth: 420, background: 'var(--bg-elevated, var(--surface))',
  border: '1px solid var(--border-subtle, var(--border))', borderRadius: 16, overflow: 'hidden',
  boxShadow: '0 24px 60px rgba(0,0,0,0.5)'
}
const header: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '14px 18px', borderBottom: '1px solid var(--border-subtle, var(--border))'
}
const closeBtn: React.CSSProperties = {
  background: 'none', border: 'none', color: 'var(--text-secondary, #b3a79f)', fontSize: 16, cursor: 'pointer'
}
