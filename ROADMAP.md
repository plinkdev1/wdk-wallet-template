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

## ✅ Phase 2 — Multi-asset depth surfaced in the UI (SHIPPED)

The shared engine in this repo (`packages/wdk-web-core`) is at **full parity with
the browser extension**: it ships **EVM, Solana, Bitcoin (BIP-84), TON (v5r1), and
Tron** address/balance/send, **USDt/XAUt token balances + transfers**, and
**real-time transaction status** — all built, bundled, and covered by the same 100
engine tests. The template's worklet already exposes every one of these worker
methods; and the Next.js surface now wires them in:

1. ✅ **Bitcoin / TON / Tron** — address, balance, send + USD value are live in the
   dashboard, chain switcher, and send dialog (per-family address validation).
2. ✅ **DeFi — Lend · Swap · Bridge** — Aave V3, Velora, and USDT0 are live in a
   DeFi dialog on the dashboard (Comlink-driven; EVM chains).
3. ✅ **Activity + status monitoring** — broadcast txs show **live status** (pending →
   confirmed/failed) in the Activity list and detail view, via a bounded poll of the
   engine's `rpc_getTransactionStatus` (EVM/Solana; other families stay pending with the
   explorer as source of truth).
3. ✅ **Gasless (ERC-4337) + MoonPay on-ramp** — live in the app, config-driven
   (set `NEXT_PUBLIC_BUNDLER_URL` / `NEXT_PUBLIC_MOONPAY_API_KEY`).
4. ✅ **Spark (Bitcoin L2) + Lightning** — `@tetherto/wdk-wallet-spark`, shipped
   end-to-end on both the template and the extension.
   - ✅ **Engine groundwork** — the shared `wdk-web-core` exports a payment-target
     module (per-family address validation + BIP-21/EIP-681/**BOLT11** parsing:
     `validateAddress`, `parsePaymentUri`, `decodeBolt11`), no new dependency.
   - ✅ **Full native L2 engine surface** — on-demand Spark manager + worker methods:
     `account_getSparkAddress` / `account_getSparkBalance` / `account_sendSparkTransaction`
     (Spark↔Spark), `account_getSparkDepositAddress` (fund from Bitcoin L1),
     `account_quoteSparkWithdraw` / `account_sparkWithdraw` (cooperative exit to BTC,
     Fast/Med/Slow + fee quote), and `lightning_createInvoice` / `lightning_payInvoice`
     (BOLT11). Lazy-loaded into its own chunk.
   - ✅ **Bundling solved** — the `@noble/hashes` v1↔v2 conflict is resolved
     (`pnpm.packageExtensions` pins `wdk-wallet-btc` → v1; Spark keeps v2), so Bitcoin
     L1 + Spark coexist in one bundle (Next.js + crxjs/MV3, verified).
   - ✅ **Branded UI shipped** — a two-tab **Spark** dialog on the dashboard: a Spark
     tab (Receive · Send · Deposit-from-BTC · Withdraw-to-BTC) and a Lightning tab
     (BOLT11 receive/pay), with the Spark logo, all over the worklet. The extension
     ships the same surface as a popup view; on the MV3 service worker the lazy
     `import()` restriction (F-MV3-04) is surfaced as a clear connect-error.

## ✅ Phase 3 — Next.js-native concerns (mostly shipped)

4. ✅ **PWA** — installable: `app/manifest.ts` (web manifest) + a security-conscious
   app-shell service worker (`public/sw.js`) that caches **only** immutable
   `/_next/static/*` build assets and icons — never HTML, RPC, or any wallet data.
5. ✅ **Cross-VM bridge signpost** (ADR-005) — pasting a recipient address from a
   different network family in Send detects it and points the user at the right
   bridge (Wormhole for EVM↔Solana, etc.) instead of letting funds cross into a
   black hole (`wallet/bridge.ts`).
6. ✅ **Transaction detail view** — click any activity row for a detail modal
   (amount, parties, status, time, copyable hash, explorer link).
7. ✅ **SSR/edge boundaries** — the worklet/SSR split is hardened (the single
   `wallet-client.ts` boundary throws on server use; everything that reaches the
   worker sits under `'use client'`) and documented: [`docs/INTEGRATION.md` §3](./docs/INTEGRATION.md)
   covers the do/don't (no engine imports in Server Components / Route Handlers /
   `middleware` / edge runtime), client-side wallet-gating, and why nothing is
   gated or rendered on the server (the vault + key are client-only).

## ⏳ Phase 4 — DeFi & distribution

7. In-wallet **swaps / lending / bridging** (`@tetherto/wdk-protocol-swap-velora-evm`,
   `-lending-aave-evm`, `-bridge-usdt0-evm`) and **fiat on-ramp** (`-fiat-moonpay`).
8. Deploy-ready reference (Vercel) + theming guide so teams can fork-and-ship.

---

The thesis — **write the engine once, ship on every framework** — is why this
template, the [extension](https://github.com/plinkdev1/wdk-wallet-extension/blob/main/ROADMAP.md),
and the [WooCommerce checkout](https://github.com/plinkdev1/wdk-checkout-and-woocommerce-plugin/blob/main/ROADMAP.md)
advance together.


## Customization & presentation follow-ups

- ✅ **Runtime theme/brand picker UI** — done. A gear-button **Appearance panel**
  (`AppearanceProvider` + `AppearanceDialog`) wires the `wdk-ui` pickers
  (`ThemePicker`, `BrandPicker`, `useThemePicker`, `useBrandPicker`,
  `useCustomPrimary`) into the app, with an any-hex primary override — all
  persisted to localStorage. Code-level theming still works (see `docs/CUSTOMIZATION.md`).
- ✅ **Capture screenshots** of the real wallet surfaces (Home shell, Swap, Earn,
  Buy) — done via a reusable component-render harness (`apps/web/screenshots/`,
  `pnpm screenshots:build`) that mounts the real worklet-coupled `WalletShell` /
  dialogs with the client/provider stubbed, the app's own dark theme, and the
  real `public/` brand + token assets; captured to
  `media/screenshots/{home-shell,swap-screen,earn-screen,buy-dialog}.png` and
  shown in the README. No running wallet / RPC needed.


## Security / dependency follow-ups

- ✅ **App-level tests** — done (closes the parity gap: the shared packages carried
  the suite, the `apps/web` code had none). A vitest config + 23 specs over the
  wallet utilities (`chains` amount math + family predicates, `bridge` cross-VM
  route table + engine-backed detection, `erc20` calldata, `tokens` registry),
  wired into `pnpm test`. Run with `pnpm -C apps/web test`.
- ✅ **Next.js 15 + React 19 migration** — done. Upgraded to Next 15.5.16 + React 19
  and rebuilt `wdk-ui` against React 19 (the 14 `JSX.Element` annotations now import
  the JSX type from 'react'). Cleared all five Next.js highs plus the postcss
  moderate; audit is down to a single unfixable low (`elliptic`). Production build
  green, 462 tests pass.

## Pro-wallet build (per the Design PRD)

Sequencing the template up to a pro-wallet bar (Phantom/Coinbase/Rainbow-class)
on the already-pro engine. Phase 1 cornerstone shipped; the rest is incremental.

- ✅ **Token logos everywhere** — shared `TokenChip` (logo + symbol) in every
  selector (DeFi Lend/Swap/Bridge, Buy); the dashboard token rows + balance card
  already show real marks. Ready for any token.
- ✅ **Navigation shell (Phase 1)** — the single-page "modal soup" is now a real
  tabbed IA: a shared `wdk-ui` `TabBar` primitive drives a **Home · Swap · Earn ·
  Activity · Settings** `WalletShell`. Home keeps the balance + token list +
  action cluster; Swap/Earn/Activity/Settings are first-class destinations.
- ✅ **Dedicated Swap / Earn screens** — the cramped DeFi modal is retired. Swap
  (Velora best-route) and Earn (Aave V3 lend · USDT0 bridge · gasless smart
  account) are now full tab destinations on a shared `Screen` layout, sharing one
  set of protocol wiring (`defi-panels.tsx`) with no duplication. The gasless
  toggle rides above the forms when a bundler is configured; non-EVM chains get a
  clear note instead of a dead form. (Next: AmountInput with fiat⇄crypto + Max,
  ReviewSheet/SuccessScreen, real Send flow, asset detail.)
