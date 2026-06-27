'use client'

/**
 * EarnScreen — a dedicated "Earn" destination grouping the yield / portability
 * flows that used to be crammed into the DeFi modal: Lend (Aave V3), Bridge
 * (USDT0, Ethereum ⇄ Arbitrum), and the gasless smart account (ERC-4337). A
 * light sub-tab strip switches between them; the gasless toggle rides above the
 * Lend/Bridge forms when a bundler is configured. EVM-only.
 */

import { useState } from 'react'
import { Button } from '@wdk-starter/wdk-ui'
import { useWallet } from '@/wallet/wallet-provider'
import { getChain } from '@/wallet/chains'
import { Screen } from './screen'
import { Lending, Bridge, Gasless, GaslessToggle, useGaslessAvailable, defiSupported, note } from './defi-panels'

type SubTab = 'lend' | 'bridge' | 'gasless'
const SUBTABS: readonly { id: SubTab, label: string }[] = [
  { id: 'lend', label: 'Lend' },
  { id: 'bridge', label: 'Bridge' },
  { id: 'gasless', label: 'Gasless' }
]

export function EarnScreen (): React.JSX.Element {
  const { chainId, accountIndex } = useWallet()
  const gaslessAvailable = useGaslessAvailable()
  const [gasless, setGasless] = useState(false)
  const [sub, setSub] = useState<SubTab>('lend')
  const supported = defiSupported(chainId)

  if (!supported) {
    return (
      <Screen title="Earn" subtitle="Lend, bridge, and gasless smart-account flows.">
        <p style={note}>Earn runs on EVM chains (Ethereum, Polygon, Arbitrum). The active network is {getChain(chainId).name} — switch to an EVM chain.</p>
      </Screen>
    )
  }

  return (
    <Screen title="Earn" subtitle="Aave V3 lending, the USDT0 bridge, and the gasless smart account — all over the worklet.">
      <div style={{ display: 'flex', gap: 6 }}>
        {SUBTABS.map((t) => (
          <Button key={t.id} size="sm" variant={sub === t.id ? 'primary' : 'secondary'} onClick={() => setSub(t.id)} style={{ flex: 1 }}>{t.label}</Button>
        ))}
      </div>
      {gaslessAvailable && sub !== 'gasless' && <GaslessToggle gasless={gasless} onChange={setGasless} />}
      {sub === 'lend' && <Lending chainId={chainId} accountIndex={accountIndex} gasless={gasless} />}
      {sub === 'bridge' && <Bridge chainId={chainId} accountIndex={accountIndex} gasless={gasless} />}
      {sub === 'gasless' && <Gasless chainId={chainId} accountIndex={accountIndex} />}
    </Screen>
  )
}
