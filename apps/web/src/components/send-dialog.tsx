'use client'

import { useState } from 'react'
import { Button, Input } from '@wdk-starter/wdk-ui'
import { Modal } from './modal'
import { useWallet } from '@/wallet/wallet-provider'
import { getChain, isSolana, parseAmount } from '@/wallet/chains'

const EVM_ADDRESS = /^0x[0-9a-fA-F]{40}$/

export function SendDialog ({ chainId, onClose }: { chainId: string, onClose: () => void }) {
  const { sendEvm, balance } = useWallet()
  const chain = getChain(chainId)
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [phase, setPhase] = useState<'form' | 'sending' | 'sent'>('form')
  const [hash, setHash] = useState('')

  const solana = isSolana(chainId)

  async function submit () {
    setError(null)
    if (!EVM_ADDRESS.test(to.trim())) { setError('Enter a valid recipient address.'); return }
    let amountBase: bigint
    try {
      amountBase = parseAmount(amount, chain.decimals)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid amount.'); return
    }
    if (amountBase <= 0n) { setError('Amount must be greater than zero.'); return }
    if (balance !== undefined && amountBase > balance) { setError('Insufficient balance.'); return }

    setPhase('sending')
    try {
      const txHash = await sendEvm(to.trim(), amountBase)
      setHash(txHash)
      setPhase('sent')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Transaction failed.')
      setPhase('form')
    }
  }

  return (
    <Modal title={`Send ${chain.symbol}`} onClose={onClose}>
      {solana && (
        <p style={note}>
          Send is wired for EVM chains in this template. Solana transfers reuse the same
          worklet signing path — see the roadmap in the README.
        </p>
      )}

      {phase !== 'sent' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={field}>
            <span style={labelText}>Recipient address</span>
            <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="0x…" disabled={solana} />
          </label>
          <label style={field}>
            <span style={labelText}>Amount ({chain.symbol})</span>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.0" inputMode="decimal" disabled={solana} />
          </label>
          {error && <p style={errorText}>{error}</p>}
          <Button onClick={submit} disabled={solana || phase === 'sending'} style={{ width: '100%' }}>
            {phase === 'sending' ? 'Submitting…' : 'Review & send'}
          </Button>
        </div>
      )}

      {phase === 'sent' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
          <div style={{ fontSize: 40 }}>✅</div>
          <p style={{ margin: 0, textAlign: 'center' }}>Transaction submitted.</p>
          {chain.explorer && (
            <a href={`${chain.explorer}/tx/${hash}`} target="_blank" rel="noreferrer" style={{ fontSize: 13, wordBreak: 'break-all', textAlign: 'center' }}>
              View on explorer ↗
            </a>
          )}
          <Button onClick={onClose} style={{ width: '100%' }}>Done</Button>
        </div>
      )}
    </Modal>
  )
}

const field: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 }
const labelText: React.CSSProperties = { fontSize: 13, color: 'var(--text-secondary, #b3a79f)' }
const errorText: React.CSSProperties = { margin: 0, color: 'var(--color-error, #ef4444)', fontSize: 13 }
const note: React.CSSProperties = { margin: '0 0 14px', padding: '10px 12px', background: 'var(--bg-elevated-2, #241f1c)', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary, #b3a79f)' }
