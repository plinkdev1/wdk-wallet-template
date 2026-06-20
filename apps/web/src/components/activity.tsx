'use client'

import { Card } from '@wdk-starter/wdk-ui'
import { useWallet } from '@/wallet/wallet-provider'
import { formatAmount, getChain } from '@/wallet/chains'

function short (addr: string) {
  return addr.length > 14 ? `${addr.slice(0, 8)}…${addr.slice(-6)}` : addr
}

export function Activity () {
  const { transactions } = useWallet()

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <h3 style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary, #b3a79f)' }}>Activity</h3>
      {transactions.length === 0
        ? (
          <Card padding="md">
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary, #b3a79f)' }}>
              No transactions yet. Transactions you send appear here with live status. Full historical
              history is provided by the <strong>WDK Indexer API</strong> — see the README for wiring the
              indexer adapter.
            </p>
          </Card>
          )
        : (
          <Card padding="none">
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {transactions.map((tx) => {
                const chain = getChain(tx.chainId)
                return (
                  <li key={tx.hash} style={row}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: 14 }}>Sent to {short(tx.to)}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary, #b3a79f)' }}>
                        {chain.name} · {new Date(tx.ts).toLocaleTimeString()}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: 14 }}>-{formatAmount(BigInt(tx.amount), chain.decimals)} {tx.symbol}</span>
                      {chain.explorer
                        ? <a href={`${chain.explorer}/tx/${tx.hash}`} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>view ↗</a>
                        : <span style={{ fontSize: 12, color: 'var(--text-secondary, #b3a79f)' }}>{tx.status}</span>}
                    </div>
                  </li>
                )
              })}
            </ul>
          </Card>
          )}
    </section>
  )
}

const row: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '12px 16px', borderBottom: '1px solid var(--border-subtle, var(--border))'
}
