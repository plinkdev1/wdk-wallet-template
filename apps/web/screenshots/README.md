# Component screenshot harness

Renders the real, worklet-coupled dashboard dialogs in isolation so their
imagery can be regenerated without a running wallet (the worklet client +
provider are stubbed; the dark theme comes from the app's own `globals.css`).

```bash
# from apps/web
pnpm screenshots:build            # vite-build the harness → screenshots/dist
npx http-server screenshots/dist  # or any static server
# then headless-capture screenshots/dist/{defi,buy}.html
```

- `stubs/` — `getWalletApi()` (async no-ops) + `useWallet()` (a benign context).
- `defi-entry.tsx` / `buy-entry.tsx` mount `<DefiDialog>` / `<BuyDialog>`.
- `vite.config.ts` aliases `@/wallet/wallet-client` + `@/wallet/wallet-provider`
  to the stubs and `@` to `../src`.

Output is git-ignored (it includes the @web3icons dynamic chunks). The captured
PNGs live in `media/screenshots/`.
