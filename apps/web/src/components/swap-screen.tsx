'use client'

/**
 * SwapScreen — a dedicated, full-height Swap destination (Velora best-route DEX
 * aggregation) in the tab shell, replacing the cramped DeFi modal's swap tab.
 * Pulls the active chain + account from the wallet and offers the gasless smart
 * account when the ERC-4337 bundler is configured. EVM-only — non-EVM /
 * unsupported chains get a clear note instead of a dead form.
 */

import { useState } from 'react'
import { useWallet } from '@/wallet/wallet-provider'
import { getChain } from '@/wallet/chains'
import { Screen } from './screen'
import { Swap, GaslessToggle, useGaslessAvailable, defiSupported, note } from './defi-panels'

export function SwapScreen (): React.JSX.Element {
  const { chainId, accountIndex } = useWallet()
  const gaslessAvailable = useGaslessAvailable()
  const [gasless, setGasless] = useState(false)
  const supported = defiSupported(chainId)

  return (
    <Screen title="Swap" subtitle="Swap tokens via Velora — best-route DEX aggregation, executed inside the worklet.">
      {!supported
        ? <p style={note}>Swaps run on EVM chains (Ethereum, Polygon, Arbitrum). The active network is {getChain(chainId).name} — switch to an EVM chain to swap.</p>
        : (
          <>
            {gaslessAvailable && <GaslessToggle gasless={gasless} onChange={setGasless} />}
            <Swap chainId={chainId} accountIndex={accountIndex} gasless={gasless} />
          </>
        )}
    </Screen>
  )
}
