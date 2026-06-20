'use client'

import { useState } from 'react'
import {
  Button,
  Card,
  MnemonicDisplay,
  MnemonicInput,
  MnemonicVerify,
  PasswordSetupScreen
} from '@wdk-starter/wdk-ui'
import { useWallet } from '@/wallet/wallet-provider'
import { BrandHeader } from './brand-header'

type Step =
  | { name: 'choice' }
  | { name: 'create-show'; mnemonic: string }
  | { name: 'create-verify'; mnemonic: string }
  | { name: 'create-password'; mnemonic: string }
  | { name: 'import-input' }
  | { name: 'import-password'; mnemonic: string }

export function OnboardingFlow () {
  const { generateMnemonic, validateMnemonic, createVault } = useWallet()
  const [step, setStep] = useState<Step>({ name: 'choice' })
  const [acknowledged, setAcknowledged] = useState(false)
  const [importValue, setImportValue] = useState('')
  const [importError, setImportError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function startCreate () {
    setBusy(true)
    try {
      const mnemonic = await generateMnemonic()
      setAcknowledged(false)
      setStep({ name: 'create-show', mnemonic })
    } finally {
      setBusy(false)
    }
  }

  async function confirmImport () {
    const normalized = importValue.trim().replace(/\s+/g, ' ')
    const valid = await validateMnemonic(normalized)
    if (!valid) { setImportError('That is not a valid recovery phrase.'); return }
    setImportError(null)
    setStep({ name: 'import-password', mnemonic: normalized })
  }

  return (
    <Shell>
      {step.name === 'choice' && (
        <Card padding="lg" style={cardStyle}>
          <h2 style={h2}>Set up your wallet</h2>
          <p style={dim}>Create a new self-custodial wallet, or restore one from a recovery phrase. Your keys are encrypted and stored only on this device.</p>
          <Button onClick={startCreate} disabled={busy} style={{ width: '100%' }}>
            {busy ? 'Generating…' : 'Create a new wallet'}
          </Button>
          <Button variant="secondary" onClick={() => setStep({ name: 'import-input' })} style={{ width: '100%' }}>
            Import an existing wallet
          </Button>
        </Card>
      )}

      {step.name === 'create-show' && (
        <Card padding="lg" style={cardStyle}>
          <MnemonicDisplay mnemonic={step.mnemonic} onAcknowledged={setAcknowledged} />
          <Button
            onClick={() => setStep({ name: 'create-verify', mnemonic: step.mnemonic })}
            disabled={!acknowledged}
            style={{ width: '100%' }}
          >
            I&apos;ve saved it — continue
          </Button>
        </Card>
      )}

      {step.name === 'create-verify' && (
        <Card padding="lg" style={cardStyle}>
          <MnemonicVerify
            mnemonic={step.mnemonic}
            onVerified={() => setStep({ name: 'create-password', mnemonic: step.mnemonic })}
          />
          <Button variant="ghost" onClick={() => setStep({ name: 'create-show', mnemonic: step.mnemonic })} style={{ width: '100%' }}>
            Back
          </Button>
        </Card>
      )}

      {(step.name === 'create-password' || step.name === 'import-password') && (
        <Card padding="lg" style={cardStyle}>
          <PasswordSetupScreen
            title="Create a password"
            subtitle="This password encrypts your wallet on this device. You'll need it to unlock."
            onSubmit={async (password) => { await createVault(step.mnemonic, password) }}
          />
        </Card>
      )}

      {step.name === 'import-input' && (
        <Card padding="lg" style={cardStyle}>
          <h2 style={h2}>Import wallet</h2>
          <p style={dim}>Enter your 12 or 24-word recovery phrase, separated by spaces.</p>
          <MnemonicInput value={importValue} onChange={(v) => { setImportValue(v); setImportError(null) }} error={importError} />
          <Button onClick={confirmImport} disabled={importValue.trim().length === 0} style={{ width: '100%' }}>
            Continue
          </Button>
          <Button variant="ghost" onClick={() => setStep({ name: 'choice' })} style={{ width: '100%' }}>
            Back
          </Button>
        </Card>
      )}
    </Shell>
  )
}

function Shell ({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 24 }}>
      <BrandHeader />
      <div style={{ width: '100%', maxWidth: 460 }}>{children}</div>
    </main>
  )
}

const cardStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 16 }
const h2: React.CSSProperties = { margin: 0, fontSize: 20 }
const dim: React.CSSProperties = { margin: 0, color: 'var(--text-secondary, var(--text-dim))', fontSize: 14, lineHeight: 1.5 }
