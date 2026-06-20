'use client'

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Button } from '@wdk-starter/wdk-ui'
import { Modal } from './modal'
import { getChain } from '@/wallet/chains'

export function ReceiveDialog ({ address, chainId, onClose }: { address: string, chainId: string, onClose: () => void }) {
  const [qr, setQr] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const chain = getChain(chainId)

  useEffect(() => {
    QRCode.toDataURL(address, { margin: 1, width: 220, color: { dark: '#161312', light: '#f7eee8' } })
      .then(setQr)
      .catch(() => setQr(''))
  }, [address])

  async function copy () {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Modal title={`Receive ${chain.symbol}`} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <p style={{ margin: 0, color: 'var(--text-secondary, #b3a79f)', fontSize: 13, textAlign: 'center' }}>
          Send only {chain.name} assets to this address.
        </p>
        {qr
          ? <img src={qr} alt="Address QR code" width={220} height={220} style={{ borderRadius: 12 }} />
          : <div style={{ width: 220, height: 220, background: 'var(--bg-elevated-2)', borderRadius: 12 }} />}
        <code style={{ wordBreak: 'break-all', fontSize: 12, textAlign: 'center', color: 'var(--text-primary)', background: 'var(--bg-elevated-2, #241f1c)', padding: '10px 12px', borderRadius: 8, width: '100%' }}>
          {address}
        </code>
        <Button onClick={copy} style={{ width: '100%' }}>{copied ? 'Copied ✓' : 'Copy address'}</Button>
      </div>
    </Modal>
  )
}
