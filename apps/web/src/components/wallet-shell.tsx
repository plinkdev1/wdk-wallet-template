'use client'

/**
 * WalletShell — the navigable pro-wallet IA (PRD Phase 1 cornerstone).
 *
 * Replaces the single-page "modal soup" with a real tab shell: Home (balance +
 * tokens + action cluster), Swap (Velora), Earn (Aave lend / USDT0 bridge /
 * gasless), Activity (history), and Settings (appearance, security, account).
 * The dedicated Swap/Earn destinations retire the old cramped DeFi modal; the
 * remaining heavy flows (receive/send/buy/spark) stay as Home action launchers.
 * Built on the shared wdk-ui TabBar so the extension popup can adopt the same IA.
 */

import { useState } from 'react'
import { Button, Card, TabBar, type TabItem } from '@wdk-starter/wdk-ui'
import { useWallet } from '@/wallet/wallet-provider'
import { Dashboard } from './dashboard'
import { Activity } from './activity'
import { Screen } from './screen'
import { SwapScreen } from './swap-screen'
import { EarnScreen } from './earn-screen'
import { AppearanceDialog } from './appearance-dialog'
import { useAppearance } from './appearance-provider'

type TabId = 'home' | 'swap' | 'earn' | 'activity' | 'settings'

const TABS: readonly TabItem[] = [
  { id: 'home', label: 'Home', icon: '◎' },
  { id: 'swap', label: 'Swap', icon: '⇄' },
  { id: 'earn', label: 'Earn', icon: '％' },
  { id: 'activity', label: 'Activity', icon: '≡' },
  { id: 'settings', label: 'Settings', icon: '⚙' }
]

export function WalletShell ({ initialTab = 'home' }: { initialTab?: TabId } = {}): React.JSX.Element {
  const [tab, setTab] = useState<TabId>(initialTab)
  const { open: appearanceOpen } = useAppearance()

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 460 }}>
          {tab === 'home' && <Dashboard />}
          {tab === 'swap' && <SwapScreen />}
          {tab === 'earn' && <EarnScreen />}
          {tab === 'activity' && <Screen title="Activity"><Activity /></Screen>}
          {tab === 'settings' && <SettingsTab />}
        </div>
      </div>
      <TabBar tabs={TABS} active={tab} onChange={(id) => setTab(id as TabId)} aria-label="Wallet" />
      {appearanceOpen && <AppearanceDialog />}
    </div>
  )
}

function SettingsTab (): React.JSX.Element {
  const { address, accountIndex, lock } = useWallet()
  const { setOpen: setAppearanceOpen } = useAppearance()
  return (
    <Screen title="Settings">
      <Card padding="lg" variant="elevated" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Row label="Account" value={`Account ${accountIndex + 1}`} />
        {address && <Row label="Address" value={`${address.slice(0, 6)}…${address.slice(-4)}`} mono />}
        <Button variant="secondary" onClick={() => setAppearanceOpen(true)} style={{ width: '100%' }}>Appearance</Button>
        <Button variant="outline" onClick={() => void lock()} style={{ width: '100%' }}>Lock wallet</Button>
      </Card>
      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-secondary, #b3a79f)' }}>
        Self-custodial · keys never leave the worklet · built on Tether WDK
      </p>
    </Screen>
  )
}

function Row ({ label, value, mono = false }: { label: string, value: string, mono?: boolean }): React.JSX.Element {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
      <span style={{ color: 'var(--text-secondary, #b3a79f)' }}>{label}</span>
      <span style={mono ? { fontFamily: 'ui-monospace, monospace' } : undefined}>{value}</span>
    </div>
  )
}
