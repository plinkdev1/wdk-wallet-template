'use client'

/**
 * Screen — the shared full-height layout for a tab destination in the wallet
 * shell (title + optional subtitle + body). Swap / Earn / Activity / Settings
 * all sit on it so the pro-wallet IA reads consistently. Pure presentation.
 */

export function Screen ({ title, subtitle, children }: { title: string, subtitle?: string, children: React.ReactNode }): React.JSX.Element {
  return (
    <main style={{ display: 'flex', flexDirection: 'column', padding: '24px 16px', gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--text-secondary, #b3a79f)' }}>{subtitle}</p>}
      </div>
      {children}
    </main>
  )
}
