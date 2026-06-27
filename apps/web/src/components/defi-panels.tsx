'use client'

/**
 * DeFi panels — the reusable Aave-lending / Velora-swap / USDT0-bridge / gasless
 * forms, driven through the worklet over Comlink. Extracted so the dedicated
 * SwapScreen and EarnScreen tab destinations share one set of protocol wiring
 * with no duplication. EVM-only; public-infra (public RPC + provider APIs).
 */

import { useEffect, useState } from 'react'
import { Button, Input, TokenChip } from '@wdk-starter/wdk-ui'
import { useWallet } from '@/wallet/wallet-provider'
import { getWalletApi } from '@/wallet/wallet-client'
import { parseAmount, formatAmount } from '@/wallet/chains'

interface Token { readonly symbol: string, readonly address: string, readonly decimals: number }

export const AAVE_TOKENS: Record<string, readonly Token[]> = {
  ethereum: [{ symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 }, { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 }],
  'polygon-mainnet': [{ symbol: 'USDT', address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6 }, { symbol: 'USDC', address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', decimals: 6 }],
  'arbitrum-mainnet': [{ symbol: 'USDT', address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', decimals: 6 }, { symbol: 'USDC', address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6 }]
}
const SWAP_TOKENS: Record<string, readonly Token[]> = {
  ethereum: [...AAVE_TOKENS.ethereum, { symbol: 'WETH', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', decimals: 18 }],
  'polygon-mainnet': [...AAVE_TOKENS['polygon-mainnet'], { symbol: 'WETH', address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', decimals: 18 }],
  'arbitrum-mainnet': [...AAVE_TOKENS['arbitrum-mainnet'], { symbol: 'WETH', address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', decimals: 18 }]
}
const BRIDGE_ROUTES: Record<string, { targetChain: string, targetName: string, usdt: string, oft: string }> = {
  ethereum: { targetChain: 'arbitrum', targetName: 'Arbitrum', usdt: '0xdAC17F958D2ee523a2206206994597C13D831ec7', oft: '0x6C96dE32CEa08842dcc4058c14d3aaAD7Fa41dee' },
  'arbitrum-mainnet': { targetChain: 'ethereum', targetName: 'Ethereum', usdt: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', oft: '0x14E4A1B13bf7F943c8ff7C51fb60FA964A298D92' }
}

const ACTIONS = ['supply', 'withdraw', 'borrow', 'repay'] as const

/** True when the wallet's ERC-4337 bundler is configured (gasless available). */
export function useGaslessAvailable (): boolean {
  const [available, setAvailable] = useState(false)
  useEffect(() => {
    let off = false
    void (async () => {
      try { const ok = await getWalletApi().erc4337_isConfigured(); if (!off) setAvailable(ok) } catch { /* not configured */ }
    })()
    return () => { off = true }
  }, [])
  return available
}

/** "⚡ Gasless" toggle — render above any panel when gasless is available. */
export function GaslessToggle ({ gasless, onChange }: { gasless: boolean, onChange: (b: boolean) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
      <input type="checkbox" checked={gasless} onChange={(e) => onChange(e.target.checked)} />
      ⚡ Gasless (run via the smart account — pay no native gas)
    </label>
  )
}

/** Whether Aave/Velora/USDT0 are wired for this chain. */
export function defiSupported (chainId: string): boolean {
  return Boolean(AAVE_TOKENS[chainId])
}

function useTxState () {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hash, setHash] = useState<string | null>(null)
  return { busy, setBusy, error, setError, hash, setHash }
}

export function Lending ({ chainId, accountIndex, gasless }: { chainId: string, accountIndex: number, gasless: boolean }) {
  const tokens = AAVE_TOKENS[chainId]!
  const [action, setAction] = useState<typeof ACTIONS[number]>('supply')
  const [tokenIdx, setTokenIdx] = useState(0)
  const [amount, setAmount] = useState('')
  const [position, setPosition] = useState<string | null>(null)
  const { busy, setBusy, error, setError, hash, setHash } = useTxState()
  const token = tokens[tokenIdx]!

  useEffect(() => {
    let off = false
    void (async () => {
      try {
        const d = await getWalletApi().aave_getAccountData(chainId as never, accountIndex)
        if (!off) setPosition(`Collateral ${usd(d.totalCollateralBase)} · Debt ${usd(d.totalDebtBase)}`)
      } catch { if (!off) setPosition(null) }
    })()
    return () => { off = true }
  }, [chainId, accountIndex, hash])

  async function run () {
    setError(null)
    let base: bigint
    try { base = parseAmount(amount, token.decimals) } catch (e) { setError(e instanceof Error ? e.message : 'Bad amount'); return }
    if (base <= 0n) { setError('Amount must be greater than zero.'); return }
    setBusy(true)
    try {
      const api = getWalletApi()
      const fn = { supply: api.aave_supply, withdraw: api.aave_withdraw, borrow: api.aave_borrow, repay: api.aave_repay }[action]
      const r = await fn(chainId as never, accountIndex, token.address, base, gasless)
      setHash(r.hash)
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed') } finally { setBusy(false) }
  }

  return (
    <div style={col}>
      {position && <div style={pill}>{position}</div>}
      <Row label="Action">{ACTIONS.map((a) => <Button key={a} size="sm" variant={action === a ? 'primary' : 'secondary'} onClick={() => setAction(a)} style={{ flex: 1, textTransform: 'capitalize' }}>{a}</Button>)}</Row>
      <Row label="Token">{tokens.map((t, i) => <Button key={t.address} size="sm" variant={tokenIdx === i ? 'primary' : 'secondary'} onClick={() => setTokenIdx(i)} style={{ flex: 1 }}><TokenChip symbol={t.symbol} /></Button>)}</Row>
      <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`Amount (${token.symbol})`} inputMode="decimal" />
      {error && <p style={err}>{error}</p>}
      {hash ? <Done hash={hash} /> : <Button onClick={run} disabled={busy} style={{ width: '100%', textTransform: 'capitalize' }}>{busy ? 'Submitting…' : `${action} ${token.symbol}`}</Button>}
    </div>
  )
}

export function Swap ({ chainId, accountIndex, gasless }: { chainId: string, accountIndex: number, gasless: boolean }) {
  const tokens = SWAP_TOKENS[chainId]!
  const [inIdx, setInIdx] = useState(0)
  const [outIdx, setOutIdx] = useState(1)
  const [amount, setAmount] = useState('')
  const [quote, setQuote] = useState<string | null>(null)
  const { busy, setBusy, error, setError, hash, setHash } = useTxState()
  const tIn = tokens[inIdx]!, tOut = tokens[outIdx]!

  async function getQuote () {
    setError(null); setQuote(null)
    if (tIn.address === tOut.address) { setError('Choose two different tokens.'); return }
    let base: bigint
    try { base = parseAmount(amount, tIn.decimals) } catch { setError('Bad amount'); return }
    setBusy(true)
    try {
      const q = await getWalletApi().velora_quoteSwap(chainId as never, accountIndex, tIn.address, tOut.address, base)
      setQuote(`${formatAmount(q.tokenOutAmount, tOut.decimals)} ${tOut.symbol}`)
    } catch (e) { setError(e instanceof Error ? e.message : 'Quote failed') } finally { setBusy(false) }
  }
  async function run () {
    setBusy(true); setError(null)
    try {
      const base = parseAmount(amount, tIn.decimals)
      const r = await getWalletApi().velora_swap(chainId as never, accountIndex, tIn.address, tOut.address, base, undefined, gasless)
      setHash(r.hash)
    } catch (e) { setError(e instanceof Error ? e.message : 'Swap failed') } finally { setBusy(false) }
  }

  return (
    <div style={col}>
      <Row label="Sell">{tokens.map((t, i) => <Button key={t.address} size="sm" variant={inIdx === i ? 'primary' : 'secondary'} onClick={() => { setInIdx(i); setQuote(null) }} style={{ flex: 1 }}><TokenChip symbol={t.symbol} /></Button>)}</Row>
      <Row label="Buy">{tokens.map((t, i) => <Button key={t.address} size="sm" variant={outIdx === i ? 'primary' : 'secondary'} onClick={() => { setOutIdx(i); setQuote(null) }} style={{ flex: 1 }}><TokenChip symbol={t.symbol} /></Button>)}</Row>
      <Input value={amount} onChange={(e) => { setAmount(e.target.value); setQuote(null) }} placeholder={`Amount (${tIn.symbol})`} inputMode="decimal" />
      {quote && <div style={pill}>Expected: {quote}</div>}
      {error && <p style={err}>{error}</p>}
      {hash ? <Done hash={hash} /> : quote
        ? <Button onClick={run} disabled={busy} style={{ width: '100%' }}>{busy ? 'Swapping…' : 'Confirm swap'}</Button>
        : <Button onClick={getQuote} disabled={busy} style={{ width: '100%' }}>{busy ? 'Quoting…' : 'Get quote'}</Button>}
    </div>
  )
}

export function Bridge ({ chainId, accountIndex, gasless }: { chainId: string, accountIndex: number, gasless: boolean }) {
  const { address } = useWallet()
  const route = BRIDGE_ROUTES[chainId]
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState(address ?? '')
  const [quote, setQuote] = useState<string | null>(null)
  const { busy, setBusy, error, setError, hash, setHash } = useTxState()

  useEffect(() => { if (address) setRecipient(address) }, [address])
  if (!route) return <p style={note}>USDT0 bridge runs on the Ethereum ⇄ Arbitrum route.</p>

  function validate (): { base: bigint, to: string } | null {
    setError(null)
    const to = recipient.trim()
    if (!/^0x[0-9a-fA-F]{40}$/.test(to)) { setError('Enter a valid recipient address.'); return null }
    let base: bigint
    try { base = parseAmount(amount, 6) } catch { setError('Bad amount'); return null }
    if (base <= 0n) { setError('Amount must be greater than zero.'); return null }
    return { base, to }
  }
  async function getQuote () {
    const v = validate(); if (!v) return
    setBusy(true)
    try {
      const q = await getWalletApi().usdt0_quoteBridge(chainId as never, accountIndex, route!.targetChain, v.to, route!.usdt, v.base, route!.oft)
      setQuote(`${formatAmount(q.fee, 18)} (native)`)
    } catch (e) { setError(e instanceof Error ? e.message : 'Quote failed') } finally { setBusy(false) }
  }
  async function run () {
    const v = validate(); if (!v) return
    setBusy(true)
    try {
      const r = await getWalletApi().usdt0_bridge(chainId as never, accountIndex, route!.targetChain, v.to, route!.usdt, v.base, route!.oft, gasless)
      setHash(r.hash)
    } catch (e) { setError(e instanceof Error ? e.message : 'Bridge failed') } finally { setBusy(false) }
  }

  return (
    <div style={col}>
      <div style={{ textAlign: 'center', fontWeight: 600 }}>USDT → {route.targetName}</div>
      <Input value={amount} onChange={(e) => { setAmount(e.target.value); setQuote(null) }} placeholder="Amount (USDT)" inputMode="decimal" />
      <Input value={recipient} onChange={(e) => { setRecipient(e.target.value); setQuote(null) }} placeholder="Recipient 0x…" />
      {quote && <div style={pill}>Est. fee: {quote}</div>}
      {error && <p style={err}>{error}</p>}
      {hash ? <Done hash={hash} /> : quote
        ? <Button onClick={run} disabled={busy} style={{ width: '100%' }}>{busy ? 'Bridging…' : 'Confirm bridge'}</Button>
        : <Button onClick={getQuote} disabled={busy} style={{ width: '100%' }}>{busy ? 'Quoting…' : 'Get quote'}</Button>}
    </div>
  )
}

export function Gasless ({ chainId, accountIndex }: { chainId: string, accountIndex: number }) {
  const [config, setConfig] = useState<'checking' | 'on' | 'off'>('checking')
  const [smartAddr, setSmartAddr] = useState<string | null>(null)
  const [smartBal, setSmartBal] = useState<bigint | null>(null)
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const { busy, setBusy, error, setError, hash, setHash } = useTxState()

  useEffect(() => {
    let off = false
    void (async () => {
      try {
        const api = getWalletApi()
        const ok = await api.erc4337_isConfigured()
        if (off) return
        if (!ok) { setConfig('off'); return }
        setConfig('on')
        const addr = await api.erc4337_getAddress(chainId as never, accountIndex)
        if (!off) setSmartAddr(addr)
        const bal = await api.erc4337_getBalance(chainId as never, accountIndex)
        if (!off) setSmartBal(bal)
      } catch (e) { if (!off) setError(e instanceof Error ? e.message : 'Failed to load smart account') }
    })()
    return () => { off = true }
  }, [chainId, accountIndex, setError])

  if (config === 'checking') return <p style={pill}>Checking…</p>
  if (config === 'off') {
    return <p style={note}>Gasless smart accounts are ready to enable. Set <code>NEXT_PUBLIC_BUNDLER_URL</code> (+ optional <code>NEXT_PUBLIC_PAYMASTER_URL</code>) and restart — the integration is fully wired.</p>
  }

  async function run () {
    setError(null)
    if (!/^0x[0-9a-fA-F]{40}$/.test(to.trim())) { setError('Enter a valid recipient address.'); return }
    let base: bigint
    try { base = parseAmount(amount, 18) } catch { setError('Bad amount'); return }
    setBusy(true)
    try {
      const r = await getWalletApi().erc4337_sendTransaction(chainId as never, accountIndex, to.trim(), base, undefined)
      setHash(r.hash)
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed') } finally { setBusy(false) }
  }

  return (
    <div style={col}>
      <div style={pill}>
        <div style={{ fontSize: 12, color: 'var(--text-secondary, #b3a79f)' }}>Smart-account address</div>
        <code style={{ fontSize: 12, wordBreak: 'break-all' }}>{smartAddr ?? 'deriving…'}</code>
        {smartBal !== null && <div style={{ fontSize: 13, marginTop: 4 }}>Balance: {formatAmount(smartBal, 18)}</div>}
      </div>
      <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Recipient 0x…" />
      <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (native)" inputMode="decimal" />
      {error && <p style={err}>{error}</p>}
      {hash ? <Done hash={hash} /> : <Button onClick={run} disabled={busy} style={{ width: '100%' }}>{busy ? 'Submitting…' : 'Send gasless'}</Button>}
    </div>
  )
}

export function Row ({ label, children }: { label: string, children: React.ReactNode }) {
  return <div><span style={{ fontSize: 12, color: 'var(--text-secondary, #b3a79f)' }}>{label}</span><div style={{ display: 'flex', gap: 6, marginTop: 4 }}>{children}</div></div>
}
function Done ({ hash }: { hash: string }) {
  return <div style={{ textAlign: 'center' }}><div style={{ fontSize: 28 }}>✅</div><code style={{ fontSize: 11, wordBreak: 'break-all' }}>{hash}</code></div>
}
function usd (base8: bigint): string { try { return '$' + (Number(base8) / 1e8).toFixed(2) } catch { return '—' } }

export const col: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 12 }
export const note: React.CSSProperties = { margin: 0, padding: '10px 12px', background: 'var(--bg-elevated-2, #241f1c)', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary, #b3a79f)' }
export const pill: React.CSSProperties = { padding: '8px 10px', background: 'var(--bg-elevated-2, #241f1c)', borderRadius: 8, fontSize: 13 }
export const err: React.CSSProperties = { margin: 0, color: 'var(--color-error, #ef4444)', fontSize: 13 }
