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
- Open the chain selector; switch **Plasma → Ethereum → Polygon → Arbitrum → Solana**. Point out the live per-chain address and balance.
- Use the **Account 1 / 2** switcher to show BIP-44 multi-account derivation.

**1:40 — Receive (25s)**
- Click **Receive** → show the QR code and copyable address.

**2:05 — Send (40s)**
- Switch to a testnet with funds, click **Send**, paste an address, enter an amount, send.
- Show the success state and the **explorer link**; point out the new entry in **Activity**.

**2:45 — Architecture & reuse (25s)**
- Flash the architecture diagram from the README.
- *"All keys live in the worklet. The same wdk-web-core engine and wdk-ui components power the WDK browser extension — write the wallet once, ship it on every framework."*

**3:10 — Outro (10s)**
- *"Open source, MIT licensed, documented end to end. Fork it and ship a WDK wallet in Next.js."* Show the GitHub URL.

## Tips
- Use a throwaway wallet — never show a seed tied to real funds.
- Lock and unlock once to demonstrate the password gate.
