'use client'

import { Card, UnlockScreen } from '@wdk-starter/wdk-ui'
import { useWallet } from '@/wallet/wallet-provider'
import { BrandHeader } from './brand-header'

export function UnlockView () {
  const { unlock, reset } = useWallet()

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 24 }}>
      <BrandHeader />
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Card padding="none" variant="elevated" style={{ overflow: 'hidden' }}>
          <UnlockScreen
            title="Welcome back"
            subtitle="Enter your password to unlock your wallet."
            onSubmit={async (password) => { await unlock(password) }}
          />
        </Card>
        <button onClick={() => { if (confirm('This removes the encrypted wallet from this device. You can restore it with your recovery phrase.')) void reset() }} style={resetBtn}>
          Forgot password? Reset wallet
        </button>
      </div>
    </main>
  )
}

const resetBtn: React.CSSProperties = {
  display: 'block',
  margin: '14px auto 0',
  background: 'none',
  border: 'none',
  color: 'var(--text-secondary, #b3a79f)',
  fontSize: 13,
  cursor: 'pointer',
  textDecoration: 'underline'
}
