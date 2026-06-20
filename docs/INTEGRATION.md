# Integrating WDK into Next.js

A focused, framework-specific guide to the parts that are *not* obvious when putting WDK in a Next.js app. Copy these into your own project to bootstrap a WDK wallet.

## 1. Run the engine in a Web Worker (the worklet)

Create a worker module that boots WDK and exposes it via Comlink:

```ts
// src/wallet/worker.ts
import '@wdk-starter/wdk-web-core/polyfill-globals'   // MUST be first
import * as Comlink from 'comlink'
import { WalletWorker } from '@wdk-starter/wdk-web-core/worker'
import { createHttpRpcAdapter } from '@wdk-starter/wdk-web-core'

const instance = new WalletWorker({ rpcAdapter: createHttpRpcAdapter() })
if (typeof (globalThis as any).postMessage === 'function') Comlink.expose(instance)
```

Spawn and wrap it on the main thread (once):

```ts
// src/wallet/wallet-client.ts
import * as Comlink from 'comlink'
import type { WalletWorker } from '@wdk-starter/wdk-web-core/worker'

const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
export const api = Comlink.wrap<WalletWorker>(worker)
```

> `new URL('./worker.ts', import.meta.url)` is the bundler-friendly worker syntax webpack (and Next.js) understands — it emits the worker as its own chunk.

## 2. Configure the browser polyfills (`next.config.mjs`)

WDK expects Node globals (`Buffer`, `process`) and compiles WebAssembly. Enable both for the client/worker build only:

```js
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin'

const nextConfig = {
  transpilePackages: ['@wdk-starter/wdk-ui', '@wdk-starter/wdk-web-core'],
  webpack (config, { isServer, webpack }) {
    config.experiments = { ...config.experiments, asyncWebAssembly: true }
    if (!isServer) {
      config.plugins.push(new NodePolyfillPlugin())
      config.plugins.push(new webpack.ProvidePlugin({ Buffer: ['buffer', 'Buffer'], process: 'process/browser' }))
      config.resolve.fallback = { ...config.resolve.fallback, fs: false, net: false, tls: false }
      // Pin the browser-safe sodium backend (the native addon can't run in a worker)
      config.resolve.alias = { ...config.resolve.alias, 'sodium-native': 'sodium-javascript' }
    }
    return config
  }
}
export default nextConfig
```

Common pitfalls this avoids:
- **`Buffer is not defined`** → `ProvidePlugin` + `NodePolyfillPlugin`.
- **`WebAssembly module is included… experiments.asyncWebAssembly`** → enable the experiment.
- **A native `.node` binding error at runtime** → the `sodium-native → sodium-javascript` alias.

## 3. Keep the wallet client-side

Wallets are inherently client-side (worker, IndexedDB, WebCrypto). Mark your wallet provider/components `'use client'`, and guard worker creation with `typeof window !== 'undefined'`. During SSR the app renders a neutral "loading" state and hydrates into the live wallet.

## 4. Use the typed worker API

The Comlink proxy gives you the full `WalletWorker` surface as async methods:

```ts
await api.vault_hasStored()
await api.bip39_generateMnemonic()
await api.vault_store(password, new TextEncoder().encode(mnemonic))
await api.vault_load(password)              // also initializes WDK; throws on wrong password
await api.account_getEvmAddress(chainId, accountIndex)
await api.rpc_getBalance(chainId, address)
await api.account_sendTransaction(chainId, accountIndex, { to, value })
await api.lock()
await api.vault_clear()
```

## 5. Reuse the UI

`@wdk-starter/wdk-ui` ships the onboarding, unlock, primitives, theming, and chain-selector components used here. Wrap your app in `<WdkThemeProvider>` to get the CSS-variable design tokens the components consume.

## 6. Porting to another framework

Because the engine (`wdk-web-core`) is framework-agnostic and the worker bridge is just Comlink, a Vue/Svelte port reuses §1–§2 verbatim and only re-implements the view layer. That is the intended path to covering more of the bounty's framework list.
