# Demo Video Script (2–5 min)

Target ~3 minutes. Record at 1280×800 in a clean browser profile.

## Setup
- `pnpm install && pnpm build && pnpm start` → open <http://localhost:3000>.
- Have a testnet faucet handy (e.g. Sepolia) to show a real balance and send.

## Beats

**0:00 — Intro (20s)**
> "This is the WDK Wallet Template for Next.js — a self-custodial multi-chain wallet you can fork. Everything you'll see is open source and built on Tether's Wallet Development Kit."

Show the repo, then the running app.

**0:20 — Create a wallet (40s)**
- Click **Create a new wallet** → recovery phrase appears.
- Reveal, acknowledge, continue → verify a few words → set a password.
- Land on the dashboard. Say: *"The seed was just generated inside a Web Worker — the worklet — encrypted with AES-GCM and stored locally. The page you're looking at never sees the private key."*

**1:00 — Multi-chain & accounts (40s)**
- Open the chain selector; switch **Plasma → Ethereum → Polygon → Arbitrum → Solana → Bitcoin → TON → Tron**. Point out the live per-chain address and balance (with **USD** value).
- Use the **Account 1 / 2** switcher to show BIP-44 multi-account derivation.

**1:40 — DeFi & on-ramp (40s)**
- On an EVM chain, click **DeFi** — show the tabbed dialog: **Lend (Aave)** with a live position, **Swap (Velora)** with a quote, **Bridge (USDT0)**, and the **Gasless** tab. Toggle **⚡ Gasless** — *"with a bundler configured, these run as ERC-4337 UserOperations — no native gas."*
- Click **Buy crypto** — show the MoonPay quote flow (or the "configure" notice). *"These activate from the developer's own keys — nothing hard-coded. It's a template standard."*
- One line: *"The same engine can also pay HTTP 402 challenges (x402), so an agent can pay per-request for an API."*

**2:20 — Receive (20s)**
- Click **Receive** → show the QR code and copyable address.

**2:40 — Send (35s)**
- Switch to a testnet with funds, click **Send**, paste an address, enter an amount, send.
- Show the success state and the **explorer link**; point out the new entry in **Activity**.

**3:15 — Architecture & reuse (25s)**
- Flash the architecture diagram from the README.
- *"All keys live in the worklet. The same wdk-web-core engine and wdk-ui components power the WDK browser extension — write the wallet once, ship it on every framework."*

**3:40 — Outro (10s)**
- *"Open source, MIT licensed, documented end to end. Fork it and ship a WDK wallet in Next.js."* Show the GitHub URL.

## Verifying the new features live (bring your own config/funds)

Automated suites cover the engine + UI contracts + x402 round-trip (`pnpm test`).
For the on-chain paths: set RPC env (`NEXT_PUBLIC_*_RPC_URL`); DeFi (Aave/Velora/
USDT0) needs only a funded EVM account; gasless/Smart-Account needs
`NEXT_PUBLIC_BUNDLER_URL`; Buy needs `NEXT_PUBLIC_MOONPAY_API_KEY` (sandbox by
default). Screenshots regenerate after RPC is wired.

## Tips
- Use a throwaway wallet — never show a seed tied to real funds.
- Lock and unlock once to demonstrate the password gate.
