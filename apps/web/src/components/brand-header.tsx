'use client'

/* eslint-disable @next/next/no-img-element */

export function BrandHeader () {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <img src="/wdk-mark.png" alt="WDK" width={36} height={36} style={{ borderRadius: 8 }} />
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <strong style={{ fontSize: 16 }}>WDK Wallet</strong>
        <span style={{ fontSize: 12, color: 'var(--text-secondary, #b3a79f)' }}>Next.js template</span>
      </div>
    </div>
  )
}
