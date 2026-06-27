<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./brand/template-lockup-ondark.png" />
  <img src="./brand/template-lockup-onlight.png" alt="WDK · Template Wallet" width="420" />
</picture>

# WDK Wallet Template — Next.js

**A production-ready, self-custodial multi-chain wallet template for [Next.js](https://nextjs.org), built on [Tether's Wallet Development Kit (WDK)](https://docs.wallet.tether.io).**

Reference implementation for the Tether WDK **Template Wallet** bounty — extending WDK's starter templates beyond React Native to the web's most popular React framework.

[![CI](https://github.com/plinkdev1/wdk-wallet-template/actions/workflows/ci.yml/badge.svg)](https://github.com/plinkdev1/wdk-wallet-template/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-F4642F.svg)](./LICENSE)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-000.svg)](https://nextjs.org)
[![Worklet](https://img.shields.io/badge/keys-in%20a%20Web%20Worker-1f6feb.svg)](#architecture)

</div>

---

## Why this exists

WDK ships a starter template for **React Native** — but the web is where most wallets begin, and Next.js is its most popular React framework. Developers wanting to build a WDK wallet in Next.js have had to wire up the SDK, the secure-execution boundary, the worker bridge, and the wallet UX from scratch.

This template is the missing reference. It is a **real, working, self-custodial wallet**: encrypted seed vault, WDK-backed multi-chain key derivation and signing, live balances, send/receive with QR, and a transaction feed — all in an idiomatic Next.js App Router app. Fork it and you have a wallet in minutes, not weeks.

> **The secure-execution model the bounty asks for.** All seed custody, key derivation, and signing happen inside a dedicated **Web Worker — the "worklet"** — exactly as WDK prescribes. The React app holds only a [Comlink](https://github.com/GoogleChromeLabs/comlink) proxy and **never touches a private key**. The app layer owns UX, history, and monitoring; the worklet owns secrets.

> **Compounding leverage.** The wallet logic lives in two reusable, framework-agnostic packages — `wdk-web-core` (engine) and `wdk-ui` (components) — the *same* packages that power the [WDK Browser Extension](https://github.com/plinkdev1/wdk-wallet-extension). The Next.js app is a thin, idiomatic surface on top. Build the engine once; ship it on every framework.

> **A browser port the official SDK doesn't ship.** WDK officially targets Bare / Node / React-Native — not the browser. Running it *correctly* in a browser (and a Web Worker) was proved out first in a dedicated [Phase 0 validation gate](https://github.com/plinkdev1/wdk-phase0-validation): byte-identical BIP-44 derivation, a documented polyfill recipe, and — as a capstone — even a **Bare-first** WDK module (`@tetherto/wdk-wallet-spark`, Lightning) running in a browser Web Worker. That evidence base is *why* this template can exist.

---

## Features

- 🔐 **Self-custodial vault** — BIP-39 generate / import / validate, encrypted at rest with **AES-256-GCM + PBKDF2-SHA-512 (600k)** in IndexedDB.
- 🧵 **Worklet security** — WDK runs in a Web Worker; the UI talks to it over a typed Comlink bridge and can never read a key.
- ⛓️ **Multi-chain** — EVM (Plasma, Ethereum, Polygon, Arbitrum + testnets), **Solana**, **Bitcoin** (BIP-84), **TON** (v5r1), and **Tron** — each with one-line registry extensibility.
- 👛 **Multi-account** — standard BIP-44 derivation; switch accounts in the UI. _(Multiple **distinct wallets / seed vaults** per user is on the [roadmap](./ROADMAP.md); today it's multiple accounts within one encrypted vault.)_
- 💸 **Send & Receive** — receive with QR + copy; send with **per-family address validation** (EVM/Solana/Bitcoin/TON/Tron), review, and explorer links.
- 📜 **Activity** — live status for transactions you submit, ready to extend with the **WDK Indexer API** for full history.
- 💵 **Fiat values** — native balances shown in **USD** via the WDK CoinGecko pricing client.
- 🎨 **Polished UX** — onboarding, unlock, and dashboard built from the `wdk-ui` component library with a themable design system.
- 🔁 **Lock / reset** — manual lock; reset restores from recovery phrase.

---

## Screenshots

| Home (tabbed shell) | Onboarding | Recovery phrase |
|:--:|:--:|:--:|
| ![Home — tabbed shell](./media/screenshots/home-shell.png) | ![Onboarding](./media/screenshots/01-onboarding.png) | ![Recovery phrase](./media/screenshots/02-recovery-phrase.png) |

| Receive (QR) | Send | Multi-chain |
|:--:|:--:|:--:|
| ![Receive](./media/screenshots/07-receive.png) | ![Send](./media/screenshots/08-send.png) | ![Chains](./media/screenshots/06-chain-selector.png) |

| Swap (Velora) | Earn — Lend / Bridge / Gasless | Buy (fiat on-ramp) |
|:--:|:--:|:--:|
| ![Swap screen](./media/screenshots/swap-screen.png) | ![Earn screen](./media/screenshots/earn-screen.png) | ![Buy crypto dialog](./media/screenshots/buy-dialog.png) |

**▶ Demo video** — a real screen recording of the running app: set up → create wallet → reveal the 12-word recovery phrase → verify it → dashboard (live on-chain balance) → receive QR.

<video src="https://github.com/plinkdev1/wdk-wallet-template/raw/main/media/demo/wdk-wallet-template-demo.webm" controls muted></video>

> Player not loading (e.g. before the repo is public)? **Download the raw `.webm`:** [`media/demo/wdk-wallet-template-demo.webm`](./media/demo/wdk-wallet-template-demo.webm) (or click **Raw** on the file page). Walkthrough script: [`docs/DEMO.md`](./docs/DEMO.md).

> Screenshots are captured from the running app via headless Chromium against a throwaway test wallet (no real funds).

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Next.js App Router (client)                                  │
│   WalletProvider (React context, state machine)               │
│   onboarding · unlock · dashboard · send · receive · activity │   ← wdk-ui components
│                         │  Comlink proxy (typed RPC)          │
└─────────────────────────┼──────────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  Web Worker — the "worklet" (the trust boundary)              │
│   WalletWorker (@wdk-starter/wdk-web-core)                    │
│     • WebCrypto vault (PBKDF2 + AES-GCM, IndexedDB)           │
│     • @tetherto/wdk — derivation, signing, tx broadcast       │
│     • chain registry · HTTP RPC adapter · indexer adapter     │
│   seed + private keys live ONLY here                          │
└──────────────────────────────────────────────────────────────┘
```

The full design — framework-selection rationale, the worklet boundary, the Comlink bridge, the state machine, and the integration plan — is in [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) (this is the bounty's M1 deliverable).

### Repository layout

```
wdk-wallet-template/
├── apps/
│   └── web/                  # The Next.js wallet template
│       └── src/
│           ├── app/          # App Router pages + providers
│           ├── wallet/       # worker.ts (worklet) · wallet-client (Comlink) · provider · chains
│           └── components/   # onboarding · unlock · dashboard · send · receive · activity
├── packages/
│   ├── wdk-web-core/         # Reusable engine (shared with the extension)
│   └── wdk-ui/               # Reusable React component library
├── brand/                    # Brand kit
└── docs/                     # Architecture (M1), setup, integration, demo
```

---

## Quickstart

**Prerequisites:** Node ≥ 20, `pnpm` 10 (`corepack enable`).

```bash
pnpm install
pnpm dev          # builds the shared packages, then starts Next.js at http://localhost:3000
```

Production build:

```bash
pnpm build        # builds packages + the Next.js app
pnpm start
```

Then open <http://localhost:3000>, create a wallet, and you're in. See [`docs/SETUP.md`](./docs/SETUP.md) for RPC configuration and troubleshooting.

---

## Supported chains & assets

| | Status |
|---|---|
| **Plasma, Ethereum, Polygon, Arbitrum** | ✅ derivation, signing, balances, send/receive |
| **Solana** (mainnet / devnet) | ✅ derivation, address, balances, **send** |
| **Bitcoin** (mainnet / testnet) | ✅ BIP-84 address, balance, **send** (Blockbook) |
| **TON** (mainnet) | ✅ v5r1 address, balance, **send** (TonCenter) |
| **Tron** (mainnet) | ✅ address, balance, **send** (TronGrid) |
| **USD fiat values** | ✅ via CoinGecko pricing client |
| **DeFi: Aave lend · Velora swap · USDT0 bridge** | ✅ live in the dashboard DeFi dialog (Comlink) |
| **ERC-4337 gasless · MoonPay on-ramp** | ✅ in the engine; config-driven (see extension for the same UI pattern) |
| **USDt / XAUt tokens** | ✅ balances on the dashboard (per EVM chain) + tap-to-send via ERC-20 `transfer()` |
| **Spark (Bitcoin L2) + Lightning** | ✅ live in the dashboard **Spark** dialog — address, balance, Spark↔Spark send, fund-from-Bitcoin deposit, withdraw to BTC (cooperative exit), BOLT11 receive/pay |

The template is transparent about implemented vs. planned scope. Adding a chain is a single entry in `apps/web/src/wallet/chains.ts` plus a loader in `wdk-web-core`.

---

## Spark & Lightning

**Is Spark the same as Lightning? No — but they work together.**

- **Spark** is its own Bitcoin layer-2 (by Lightspark): a statechain + FROST-threshold-signing network with `spark1…` addresses. It is *not* the Bitcoin L1 chain and *not* the Lightning Network.
- **Lightning** is a separate, older payment rail. A Spark wallet settles BOLT11 Lightning invoices **natively**, so Lightning is exposed here as a *payment method on top of Spark*, not as a standalone package.
- **Bitcoin L1** is bridged in and out: **deposit** BTC to a Spark address to fund the L2 balance, **withdraw** back to an on-chain address via a cooperative exit.

The mental model: **Spark = the chain · Lightning = a payment rail on it · Bitcoin L1 = bridged via deposit/withdraw.** In the WDK there is no standalone Lightning package — Lightning ships *through* [`@tetherto/wdk-wallet-spark`](https://www.npmjs.com/package/@tetherto/wdk-wallet-spark).

The dashboard's **Spark** dialog has two tabs:

- **Spark** — Receive (your `spark1…` address + QR), Send (Spark→Spark, sats), Deposit (reusable Bitcoin L1 address to top up), Withdraw (to a BTC address, with a fee quote + Fast/Medium/Slow exit speed).
- **Lightning** — Receive (create a BOLT11 invoice) and Pay (settle one), capped by a max routing fee.

Engine surface (worker methods, keys never leave the worklet): `account_getSparkAddress` · `account_getSparkBalance` · `account_sendSparkTransaction` · `account_getSparkDepositAddress` · `account_quoteSparkWithdraw` · `account_sparkWithdraw` · `lightning_createInvoice` · `lightning_payInvoice`. The ~6.4 MB Spark SDK is **lazy-loaded** into its own chunk on first use (F-SPARK-03), so it never enters the default bundle.

> **@noble/hashes coexistence.** `@tetherto/wdk-wallet-btc` and the Spark SDK pin different major versions of `@noble/hashes` (v1 vs v2). The workspace resolves this with a `pnpm.packageExtensions` pin so Bitcoin L1 and Spark coexist in one bundle — see the [Phase 0 deep-dive](https://github.com/plinkdev1/wdk-phase0-validation).

---

## How it integrates WDK

- **The worklet** (`apps/web/src/wallet/worker.ts`) loads the WDK polyfills, constructs `WalletWorker` with an HTTP RPC adapter, and exposes it via Comlink.
- **The client** (`wallet-client.ts`) spawns the worker once and wraps it with `Comlink.wrap<WalletWorker>`.
- **The provider** (`wallet-provider.tsx`) is a React context + state machine (`loading → no-vault → locked → unlocked`) that calls the worklet for every privileged operation.
- **Next.js config** (`next.config.mjs`) enables the browser polyfills (Buffer/process) and WebAssembly the WDK crypto stack needs, and pins the pure-JS sodium backend for the browser.

Framework-specific notes are in [`docs/INTEGRATION.md`](./docs/INTEGRATION.md).

---

## The shared engine — `@wdk-starter/wdk-web-core`

This wallet is a thin Next.js surface over a reusable, framework-agnostic engine
published to npm as **[`@wdk-starter/wdk-web-core`](https://www.npmjs.com/package/@wdk-starter/wdk-web-core)**
(v0.2.0). The **same engine — byte-identical** — also powers the
[WDK Wallet Extension](https://github.com/plinkdev1/wdk-wallet-extension); build it
once, ship it on every surface.

It wraps Tether's WDK SDK (`@tetherto/wdk-*`) and provides:

- **Encrypted vault** — `WebCryptoVault`, AES-256-GCM + PBKDF2-SHA-512 (600k) in IndexedDB.
- **Multi-chain registry** — EVM · Solana · BTC · TON · Tron · Plasma, one-line extensible.
- **Signing + EIP-3009** gasless transfer builders.
- **Adapters** — HTTP RPC, indexer, relayer, and WebSocket subscriptions.
- **The "worklet"** — a Comlink-exposed Web Worker surface so private keys never leave the worker.

Full API and import paths: [`packages/wdk-web-core/README.md`](./packages/wdk-web-core/README.md).

> **Provenance.** This product didn't start with product code — it started with a
> proof of concept. WDK's viability in the browser, a Web Worker, and an MV3 service
> worker was validated first in **[WDK Phase 0](https://github.com/plinkdev1/wdk-phase0-validation)**
> (9 tests, 12 findings, and the architecture decisions that shaped this repo).

---

## Quality

- **Strict TypeScript** across the app and both packages.
- **`pnpm typecheck`** and **`pnpm test`** (the shared packages carry 504 passing tests) run in CI on every push, followed by a full `next build`.
- The worklet is runtime-verified: a headless smoke test boots the worker, derives, and generates a mnemonic through the real UI.

---

## Customization — theming & branding

Re-skin and re-brand **without touching component code**. The template consumes
the same `@wdk-starter/wdk-ui` theme + brand system as the extension: three
built-in presets (warm/cool/light), full color/type/radius/motion control via
CSS variables, and `BrandProvider` for the name/wordmark/mark. One edit in
`apps/web/src/app/providers.tsx` re-skins the whole app:

```tsx
<WdkThemeProvider theme={{ ...wdkWarmTheme, colors: { ...wdkWarmTheme.colors, primary: '#0D9488' } }}>
```

Runtime theme/brand pickers (as in the extension) are available from `wdk-ui` to
wire if you want end-user customization. Full guide:
**[`docs/CUSTOMIZATION.md`](./docs/CUSTOMIZATION.md)**.

---

## x402 — agentic / per-request payments

The shared engine can **pay HTTP `402 Payment Required` challenges**: the worklet
signs an EIP-3009 authorization (x402's "exact" scheme) and returns the
`X-PAYMENT` header (`worker.x402_createPayment`, callable over Comlink). The
server-side facilitator (for charging bots/agents) ships in
[wdk-checkout](https://github.com/plinkdev1/wdk-checkout-and-woocommerce-plugin);
the settlement primitive in
[wdk-protocol-eip3009](https://github.com/plinkdev1/wdk-protocol-eip3009).

---

## Documentation

- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — **M1**: framework selection, the worklet model, integration plan.
- [`docs/SETUP.md`](./docs/SETUP.md) — install, run, configure RPC, troubleshoot.
- [`docs/CUSTOMIZATION.md`](./docs/CUSTOMIZATION.md) — theming & branding (swap colors/logo).
- [`docs/INTEGRATION.md`](./docs/INTEGRATION.md) — how WDK is wired into Next.js (worker, polyfills, Comlink).
- [`docs/DEMO.md`](./docs/DEMO.md) — the demo-video walkthrough script.

---

## Roadmap

📍 **Full phased roadmap: [`ROADMAP.md`](./ROADMAP.md).** It shows what ships today
(worklet architecture, EVM + Solana + Bitcoin + TON + Tron, onboarding/send/receive/activity + USD values) and how the
**shared `wdk-web-core` engine** unlocks Bitcoin, tokens, Lightning (Spark),
account abstraction, TON/Tron, in-wallet DeFi, and fiat pricing across this
template and the other WDK surfaces — one engine, many products.

---

## License

[MIT](./LICENSE). Built with [Tether WDK](https://docs.wallet.tether.io). A community reference implementation submitted to the Tether WDK bounty program; not an official Tether product.
