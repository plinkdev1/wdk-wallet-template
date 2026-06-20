'use client'

import { useState } from 'react'
import { Button, Card, ChainSelector, NetworkIcon, Skeleton } from '@wdk-starter/wdk-ui'
import { useWallet } from '@/wallet/wallet-provider'
import { chainOptions, formatAmount, getChain } from '@/wallet/chains'
import { BrandHeader } from './brand-header'
import { ReceiveDialog } from './receive-dialog'
import { SendDialog } from './send-dialog'
import { Activity } from './activity'

const OPTIONS = chainOptions((id) => <NetworkIcon chain={id} size={16} />)

function short (addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function Dashboard () {
  const {
    chainId, setChainId, accountIndex, setAccountIndex,
    address, addressLoading, balance, balanceLoading, refreshBalance, lock
  } = useWallet()
  const [dialog, setDialog] = useState<'none' | 'receive' | 'send'>('none')
  const [copied, setCopied] = useState(false)
  const chain = getChain(chainId)

  async function copy () {
    if (!address) return
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 460, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <BrandHeader />
          <Button variant="ghost" size="sm" onClick={() => void lock()}>Lock</Button>
        </header>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <ChainSelector active={chainId} options={OPTIONS} onChange={setChainId} />
          <AccountSwitcher index={accountIndex} onChange={setAccountIndex} />
        </div>

        <Card padding="lg" variant="elevated" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary, #b3a79f)', fontSize: 13 }}>
            <NetworkIcon chain={chainId} size={18} />
            <span>{chain.name}{chain.testnet ? ' · testnet' : ''}</span>
          </div>
          <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: -0.5 }}>
            {balanceLoading || balance === undefined
              ? <Skeleton style={{ width: 160, height: 38 }} />
              : <>{formatAmount(balance, chain.decimals)} <span style={{ fontSize: 18, color: 'var(--text-secondary, #b3a79f)' }}>{chain.symbol}</span></>}
          </div>
          <button onClick={copy} style={addrBtn} title="Copy address">
            {addressLoading || !address ? 'deriving address…' : copied ? 'Copied ✓' : `${short(address)} · copy`}
          </button>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <Button onClick={() => setDialog('receive')} disabled={!address} style={{ flex: 1 }}>Receive</Button>
            <Button onClick={() => setDialog('send')} variant="secondary" disabled={!address} style={{ flex: 1 }}>Send</Button>
            <Button onClick={() => void refreshBalance()} variant="outline" size="icon" title="Refresh">↻</Button>
          </div>
        </Card>

        <Activity />

        <footer style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-secondary, #b3a79f)', marginTop: 8 }}>
          Self-custodial · keys never leave the worklet · built on Tether WDK
        </footer>
      </div>

      {dialog === 'receive' && address && <ReceiveDialog address={address} chainId={chainId} onClose={() => setDialog('none')} />}
      {dialog === 'send' && address && <SendDialog chainId={chainId} onClose={() => setDialog('none')} />}
    </main>
  )
}

function AccountSwitcher ({ index, onChange }: { index: number, onChange: (i: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
      <button onClick={() => onChange(Math.max(0, index - 1))} disabled={index === 0} style={stepBtn} aria-label="Previous account">◀</button>
      <span style={{ color: 'var(--text-secondary, #b3a79f)' }}>Account {index + 1}</span>
      <button onClick={() => onChange(index + 1)} style={stepBtn} aria-label="Next account">▶</button>
    </div>
  )
}

const addrBtn: React.CSSProperties = {
  alignSelf: 'flex-start', background: 'var(--bg-elevated-2, #241f1c)', border: '1px solid var(--border-subtle, var(--border))',
  borderRadius: 999, padding: '5px 12px', color: 'var(--text-primary)', fontSize: 12, cursor: 'pointer', fontFamily: 'ui-monospace, monospace'
}
const stepBtn: React.CSSProperties = {
  background: 'none', border: 'none', color: 'var(--text-secondary, #b3a79f)', cursor: 'pointer', fontSize: 11, padding: 4
}
