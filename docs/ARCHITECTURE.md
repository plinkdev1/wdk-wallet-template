# Architecture & Proposal (M1)

This document is the **M1 deliverable**: framework-selection rationale, the architecture, and the integration plan for a WDK wallet template on Next.js.

## 1. Framework selection: why Next.js

WDK currently ships a starter template only for **React Native**. The largest uncovered, highest-leverage target is the web — and within the React web ecosystem, **Next.js** is the obvious choice:

- **Reach.** Next.js is the most widely adopted React framework; a WDK Next.js template unlocks the largest pool of developers in one move.
- **Shared mental model with React Native.** Teams already using WDK's RN starter transfer their knowledge directly — same React, same hooks, same component patterns.
- **Production defaults.** App Router, file-based routing, first-class TypeScript, image/asset handling, and a mature build pipeline mean the template is production-grade out of the box, not a toy.
- **Worker support.** Next's webpack pipeline supports `new Worker(new URL(...))` natively, which is exactly what the WDK "worklet" security model needs in the browser.

The template is structured so the **wallet logic is framework-agnostic** (see §3), so a Vue / Svelte / SvelteKit variant is a thin re-skin of the same engine — a deliberate path to covering the rest of the bounty's framework list with minimal incremental work.

## 2. The security model: the worklet boundary

The bounty is explicit: *use the worklet as the secure execution layer for seed/key custody, signing, account/wallet operations, and config-driven multi-chain transaction flows, while the app layer handles UX, history, and monitoring.* This template implements exactly that.

```
        main thread (untrusted with keys)        │   Web Worker (the worklet — the trust boundary)
  ┌───────────────────────────────────────────┐  │  ┌──────────────────────────────────────────────┐
  │  React UI · WalletProvider · components    │  │  │  WalletWorker                                  │
  │                                            │  │  │   • WebCrypto vault (PBKDF2 + AES-GCM)         │
  │   getWalletApi() ── Comlink.wrap ──────────┼──┼──┼─► exposed via Comlink.expose                   │
  │                                            │  │  │   • @tetherto/wdk derivation + signing         │
  │   never holds a private key                │  │  │   • seed + keys live ONLY here                 │
  └───────────────────────────────────────────┘  │  └──────────────────────────────────────────────┘
```

- The **seed and all derived private keys exist only inside the worker.** No message returns raw key material; the API exposes *operations* (derive an address, read a balance, sign/send a transaction), never secrets.
- The worker is a **process boundary**, not just a module boundary — main-thread code (and any injected script) physically cannot read the worker's memory.
- On a fresh page load the worker has no in-memory key, so an existing vault starts **locked**; the user must re-enter their password to re-derive.

## 3. Reuse: one engine, many surfaces

Wallet logic is **not** written into the Next.js app. It lives in two packages:

| Package | Responsibility |
|---|---|
| `@wdk-starter/wdk-web-core` | The engine: WebCrypto vault, `WalletWorker` (Comlink-exposed), chain registry, RPC/indexer/relayer adapters, EIP-3009 builder. Framework-agnostic, no React. |
| `@wdk-starter/wdk-ui` | Reusable React components: onboarding (mnemonic display/verify, password setup), unlock, primitives, theming, chain selector. No wallet logic. |

These are the **same packages that power the [WDK Browser Extension](https://github.com/plinkdev1/wdk-wallet-extension)**. The extension runs the engine in an MV3 *service worker*; this template runs it in a *Web Worker*. The engine's Comlink bootstrap was written for both. This is the strategic payoff: the hard, security-critical code is written and tested once, and each framework template is a thin, cheap surface on top.

## 4. The Next.js integration

### 4.1 The worklet (`apps/web/src/wallet/worker.ts`)

```ts
import '@wdk-starter/wdk-web-core/polyfill-globals'   // Buffer/process/globalThis first
import * as Comlink from 'comlink'
import { WalletWorker } from '@wdk-starter/wdk-web-core/worker'
import { createHttpRpcAdapter } from '@wdk-starter/wdk-web-core'

const instance = new WalletWorker({ rpcAdapter: createHttpRpcAdapter() })
if (typeof (globalThis as any).postMessage === 'function') Comlink.expose(instance)
```

### 4.2 The client bridge (`wallet-client.ts`)

Spawns the worker once and wraps it:

```ts
worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
api = Comlink.wrap<WalletWorker>(worker)
```

### 4.3 Bundling (`next.config.mjs`)

The WDK crypto stack needs Node-style globals and WebAssembly in the browser:

- `NodePolyfillPlugin` + `ProvidePlugin` provide `Buffer` / `process`.
- `experiments.asyncWebAssembly` enables sodium's wasm.
- `resolve.alias['sodium-native'] = 'sodium-javascript'` pins the pure-JS sodium backend for the browser/worker bundle (the native addon can't run there).

All of this is scoped to the client/worker build; the server build is left untouched (the wallet is client-only).

### 4.4 The state machine (`wallet-provider.tsx`)

A React context drives a four-state machine and exposes typed actions:

```
loading ──► no-vault ──(create/import)──► unlocked
        └─► locked  ──(unlock)──────────► unlocked ──(lock)──► locked
                                          unlocked ──(reset)─► no-vault
```

Every privileged action (`createVault`, `unlock`, `sendEvm`, balance/address reads) routes through the Comlink proxy to the worklet.

## 5. Core flows (M2)

| Flow | Implementation |
|---|---|
| Onboarding | `wdk-ui` MnemonicDisplay → MnemonicVerify → PasswordSetupScreen (create) / MnemonicInput (import) → `vault_store` + `vault_load` |
| Unlock | `wdk-ui` UnlockScreen → `vault_load(password)` (throws on wrong password) |
| Balances | `rpc_getBalance(chain, address)` via the HTTP RPC adapter, per active chain/account |
| Receive | QR (via `qrcode`) + copyable address |
| Send | recipient + amount validation → review → `account_sendTransaction` → explorer link |
| Activity | live status for submitted transactions; **WDK Indexer API** adapter is the extension point for full history |
| Multi-account | account-index switcher; BIP-44 derivation per index |

## 6. Roadmap (post-M3)

1. **Token assets** — USDt/XAUt balances and transfers (indexer + token adapter; the engine already builds EIP-3009 gasless transfers via [`wdk-protocol-eip3009`](https://github.com/plinkdev1/wdk-protocol-eip3009)).
2. **Solana send** and SPL balances.
3. **Bitcoin & Lightning (Spark)** via the WDK bitcoin/spark wallet packages.
4. **Full transaction history** wired to the WDK Indexer API.
5. **Vue / Svelte variants** reusing `wdk-web-core` unchanged.

## 7. Out of scope

Per the bounty: polished production design systems, advanced DeFi (swaps/bridges/staking), custom backend infrastructure or indexer implementations, and modifications to WDK core. This template integrates WDK as-is.
