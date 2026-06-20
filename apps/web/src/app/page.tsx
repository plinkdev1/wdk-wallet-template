'use client'

import { Providers } from './providers'
import { useWallet } from '@/wallet/wallet-provider'
import { OnboardingFlow } from '@/components/onboarding-flow'
import { UnlockView } from '@/components/unlock-view'
import { Dashboard } from '@/components/dashboard'

function Centered ({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, color: 'var(--text-secondary, #b3a79f)' }}>
      {children}
    </main>
  )
}

function Router () {
  const { phase, error } = useWallet()
  switch (phase) {
    case 'loading': return <Centered>Starting the wallet worklet…</Centered>
    case 'error': return <Centered>Wallet error: {error}</Centered>
    case 'no-vault': return <OnboardingFlow />
    case 'locked': return <UnlockView />
    case 'unlocked': return <Dashboard />
  }
}

export default function Home () {
  return (
    <Providers>
      <Router />
    </Providers>
  )
}
