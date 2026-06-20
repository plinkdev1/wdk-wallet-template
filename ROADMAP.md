# WDK Wallet Template (Next.js) — Roadmap

> This template and the [browser extension](https://github.com/plinkdev1/wdk-wallet-extension)
> are two surfaces over **one shared engine** (`wdk-web-core`) and **one shared
> component library** (`wdk-ui`). That is the point: a capability built once in the
> engine appears on every surface. This roadmap shows what ships today and what the
> shared engine unlocks next. Items are scoped against real, published
> `@tetherto/*` packages (verified to exist/install).

## ✅ Phase 1 — Worklet wallet foundation (SHIPPED)

- **Security model the bounty asks for** — the WDK engine runs inside a dedicated
  **Web Worker ("worklet")** for all seed custody, derivation, and signing; the
  React app holds only a Comlink proxy and never sees a private key.
- **Flows** — onboarding (create/import), unlock, dashboard, multi-chain selector,
  multi-account, balances, receive (QR), send (validated, explorer links), activity.
- **Reuse** — consumes the same `wdk-web-core` + `wdk-ui` packages as the extension.
- **Verified** — strict typecheck, full `next build`, and a headless runtime test
  that boots the worklet and generates a mnemonic through the real UI.
- `docs/ARCHITECTURE.md` (the M1 deliverable), setup/integration/demo docs, media.

## ⏳ Phase 2 — Surface the engine's multi-asset depth in the UI

The shared engine in this repo (`packages/wdk-web-core`) is at **full parity with
the browser extension**: it ships **EVM, Solana, Bitcoin (BIP-84), TON (v5r1), and
Tron** address/balance/send, **USDt/XAUt token balances + transfers**, and
**real-time transaction status** — all built, bundled, and covered by the same 100
engine tests. The template's worklet already exposes every one of these worker
methods; the remaining work is **wiring them into the Next.js surface**:

1. **Bitcoin / TON / Tron + token assets** — surface the engine's already-shipped
   BTC/TON/Tron and ERC-20 capabilities in the dashboard and send flow (the
   extension's popup does this today; the same hooks port directly).
2. **Activity + status monitoring** — the engine's status polling, in the app layer.
3. **Lightning (Spark)** — `@tetherto/wdk-wallet-spark` instant BTC payments
   (shared bundler-shim work tracked in the extension roadmap).

## ⏳ Phase 3 — Next.js-native concerns

4. **SSR/edge boundaries** — document and harden the worklet/SSR split (the engine
   is client-only by design); App Router patterns for wallet-gated routes.
5. **Account abstraction** — `@tetherto/wdk-wallet-evm-erc-4337` gasless smart
   accounts; **TON/Tron** account families.
6. **Fiat values** — balances in USD via `@tetherto/wdk-pricing-*`.

## ⏳ Phase 4 — DeFi & distribution

7. In-wallet **swaps / lending / bridging** (`@tetherto/wdk-protocol-swap-velora-evm`,
   `-lending-aave-evm`, `-bridge-usdt0-evm`) and **fiat on-ramp** (`-fiat-moonpay`).
8. Deploy-ready reference (Vercel) + theming guide so teams can fork-and-ship.

---

The thesis — **write the engine once, ship on every framework** — is why this
template, the [extension](https://github.com/plinkdev1/wdk-wallet-extension/blob/main/ROADMAP.md),
and the [WooCommerce checkout](https://github.com/plinkdev1/wdk-checkout-and-woocommerce-plugin/blob/main/ROADMAP.md)
advance together.
