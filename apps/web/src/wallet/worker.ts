/**
 * The wallet worklet — the secure execution layer.
 *
 * Entry point of a dedicated Web Worker. Loads the WDK polyfills, constructs a
 * `WalletWorker` (with an HTTP RPC adapter so balance reads work), and exposes
 * it over the worker port via Comlink. All seed custody, key derivation, and
 * signing happen here, off the main thread — the React app only ever holds a
 * Comlink proxy and never sees a private key.
 *
 * Import order matters: polyfill-globals must run before anything pulls WDK or
 * sodium so that Buffer / process / globalThis are in place first.
 */
import '@wdk-starter/wdk-web-core/polyfill-globals'
import * as Comlink from 'comlink'
import { WalletWorker } from '@wdk-starter/wdk-web-core/worker'
import {
  createHttpRpcAdapter,
  createFallbackPricingAdapter,
  createBitfinexPricingAdapter,
  createCoingeckoPricingAdapter,
} from '@wdk-starter/wdk-web-core'

// Public EVM RPCs (also the ERC-4337 smart-account provider). Override the main
// ones with NEXT_PUBLIC_*_RPC_URL env vars (Next inlines these at build).
const RPC_URLS: Record<string, string> = {
  ethereum: process.env.NEXT_PUBLIC_ETH_RPC_URL ?? 'https://ethereum-rpc.publicnode.com',
  'polygon-mainnet': process.env.NEXT_PUBLIC_POLYGON_RPC_URL ?? 'https://polygon-bor-rpc.publicnode.com',
  'arbitrum-mainnet': process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL ?? 'https://arb1.arbitrum.io/rpc',
  'plasma-mainnet': 'https://rpc.plasma.to'
}

// MoonPay on-ramp — activates from the app's own publishable key (template
// standard; nothing hard-coded). Absent key => the Buy view shows a notice.
const moonpayApiKey = process.env.NEXT_PUBLIC_MOONPAY_API_KEY
const moonpayConfig = moonpayApiKey
  ? {
      apiKey: moonpayApiKey,
      environment: (process.env.NEXT_PUBLIC_MOONPAY_ENV === 'production' ? 'production' : 'sandbox') as 'production' | 'sandbox',
      ...(process.env.NEXT_PUBLIC_MOONPAY_SIGN_URL ? { signUrl: process.env.NEXT_PUBLIC_MOONPAY_SIGN_URL } : {})
    }
  : undefined

// ERC-4337 smart accounts — activates from the app's own bundler (+ optional paymaster).
const bundlerUrl = process.env.NEXT_PUBLIC_BUNDLER_URL
const erc4337Config = bundlerUrl
  ? {
      bundlerUrl,
      ...(process.env.NEXT_PUBLIC_PAYMASTER_URL ? { paymasterUrl: process.env.NEXT_PUBLIC_PAYMASTER_URL } : {}),
      providerFor: (chain: string) => RPC_URLS[chain]
    }
  : undefined

const instance = new WalletWorker({
  // Wire the per-chain RPC URLs (incl. NEXT_PUBLIC_*_RPC_URL overrides) into the
  // adapter — otherwise balance reads fall back to each chain's baked-in public
  // default and a dev's configured endpoint is ignored.
  rpcAdapter: createHttpRpcAdapter({ rpcUrls: RPC_URLS }),
  // Fiat values: Bitfinex (Tether / iFinex) primary → CoinGecko fallback, so a
  // single price source going down (or rate-limiting) no longer blanks USD values.
  pricingAdapter: createFallbackPricingAdapter([
    createBitfinexPricingAdapter(),
    createCoingeckoPricingAdapter(),
  ]),
  ...(moonpayConfig ? { moonpayConfig } : {}),
  ...(erc4337Config ? { erc4337Config } : {})
})

// Only expose in an actual worker context (guards SSR / test imports).
const g = globalThis as unknown as { postMessage?: unknown }
if (typeof g.postMessage === 'function') {
  Comlink.expose(instance)
}
