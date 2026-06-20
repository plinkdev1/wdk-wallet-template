/**
 * Chain catalogue for the template wallet UI.
 *
 * Each entry maps a wdk-web-core chain id to display metadata. The set is
 * intentionally focused on the WDK / Tether stack; add a chain by adding one
 * entry here (and ensuring wdk-web-core has a loader for it).
 */
import type { ReactNode } from 'react'

export type ChainFamily = 'evm' | 'solana'

export interface ChainInfo {
  readonly id: string
  readonly name: string
  readonly symbol: string
  readonly family: ChainFamily
  readonly testnet?: boolean
  readonly decimals: number
  /** Block-explorer base URL (no trailing slash), used for tx/address links. */
  readonly explorer?: string
}

export const CHAINS: readonly ChainInfo[] = [
  { id: 'plasma-mainnet', name: 'Plasma', symbol: 'XPL', family: 'evm', decimals: 18, explorer: 'https://explorer.plasma.to' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', family: 'evm', decimals: 18, explorer: 'https://etherscan.io' },
  { id: 'polygon-mainnet', name: 'Polygon', symbol: 'POL', family: 'evm', decimals: 18, explorer: 'https://polygonscan.com' },
  { id: 'arbitrum-mainnet', name: 'Arbitrum', symbol: 'ETH', family: 'evm', decimals: 18, explorer: 'https://arbiscan.io' },
  { id: 'solana-mainnet', name: 'Solana', symbol: 'SOL', family: 'solana', decimals: 9, explorer: 'https://explorer.solana.com' },
  { id: 'sepolia-testnet', name: 'Sepolia', symbol: 'ETH', family: 'evm', testnet: true, decimals: 18, explorer: 'https://sepolia.etherscan.io' },
  { id: 'plasma-testnet', name: 'Plasma Testnet', symbol: 'XPL', family: 'evm', testnet: true, decimals: 18, explorer: 'https://testnet.plasmascan.to' },
  { id: 'solana-devnet', name: 'Solana Devnet', symbol: 'SOL', family: 'solana', testnet: true, decimals: 9, explorer: 'https://explorer.solana.com' }
]

export const DEFAULT_CHAIN_ID = 'plasma-mainnet'

const byId = new Map(CHAINS.map((c) => [c.id, c]))

export function getChain (id: string): ChainInfo {
  const chain = byId.get(id)
  if (!chain) throw new Error(`Unknown chain: ${id}`)
  return chain
}

export function isSolana (id: string): boolean {
  return getChain(id).family === 'solana'
}

/** Builds the option list consumed by wdk-ui's <ChainSelector />. */
export function chainOptions (iconFor: (id: string) => ReactNode) {
  return CHAINS.map((c) => ({
    id: c.id,
    name: c.name,
    symbol: c.symbol,
    ...(c.testnet ? { testnet: true } : {}),
    icon: iconFor(c.id)
  }))
}

/** Formats a base-unit bigint amount to a human string with up to 6 decimals. */
export function formatAmount (base: bigint, decimals: number): string {
  const negative = base < 0n
  const v = negative ? -base : base
  const divisor = 10n ** BigInt(decimals)
  const whole = v / divisor
  const frac = v % divisor
  let fracStr = frac.toString().padStart(decimals, '0').slice(0, 6).replace(/0+$/, '')
  fracStr = fracStr ? '.' + fracStr : ''
  return `${negative ? '-' : ''}${whole.toString()}${fracStr}`
}

/** Parses a human decimal string into a base-unit bigint. Throws on bad input. */
export function parseAmount (input: string, decimals: number): bigint {
  const trimmed = input.trim()
  if (!/^\d*\.?\d*$/.test(trimmed) || trimmed === '' || trimmed === '.') {
    throw new Error('Enter a valid amount.')
  }
  const [whole, frac = ''] = trimmed.split('.')
  if (frac.length > decimals) throw new Error(`Too many decimals (max ${decimals}).`)
  const padded = frac.padEnd(decimals, '0')
  return BigInt(whole || '0') * 10n ** BigInt(decimals) + BigInt(padded || '0')
}
