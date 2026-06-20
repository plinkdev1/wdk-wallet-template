# Setup & Run

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | ≥ 20 |
| pnpm | 10.x (`corepack enable`) |

This is a pnpm workspace — use `pnpm`.

## Install & run

```bash
pnpm install
pnpm dev          # builds shared packages, then `next dev` at http://localhost:3000
```

`pnpm dev` first builds `wdk-web-core` and `wdk-ui` (the app consumes their built output), then starts Next.js.

## Production build

```bash
pnpm build        # build packages + next build
pnpm start        # serve the production build
```

## Configure RPC (optional)

Balances and sends use public RPC endpoints by default (rate-limited). For reliability, set your own endpoints. Create `apps/web/.env.local`:

```bash
# Example — only NEXT_PUBLIC_-prefixed vars reach the browser
NEXT_PUBLIC_ETH_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
```

`.env.local` is gitignored. The chain RPC URLs live in `wdk-web-core`'s chain registry; override them there or via the RPC adapter for your deployment.

## Useful scripts

```bash
pnpm typecheck    # strict typecheck across app + packages
pnpm test         # shared-package test suites
pnpm -F @wdk-starter/web lint
```

## Resetting wallet state during development

The encrypted vault lives in IndexedDB. To wipe it, open DevTools → Application → IndexedDB → delete the `wdk-vault` database (or use the in-app **Reset wallet** action on the unlock screen), then reload.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Cannot find module '@wdk-starter/wdk-web-core/...'` | Run `pnpm build:packages` first — the app consumes the packages' built `dist/`. |
| Page stuck on "Starting the wallet worklet…" | Ensure you're on a Chromium/Firefox build with Web Worker + WASM support; check the console for worker errors. |
| Balances show `0` | Set your own RPC endpoint; public fallbacks are rate-limited. |
| Build error about `Buffer`/`process`/wasm | Confirm `next.config.mjs` is intact — it configures the browser polyfills and `asyncWebAssembly`. |
