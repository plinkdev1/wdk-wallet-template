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
import { createHttpRpcAdapter } from '@wdk-starter/wdk-web-core'

const instance = new WalletWorker({ rpcAdapter: createHttpRpcAdapter() })

// Only expose in an actual worker context (guards SSR / test imports).
const g = globalThis as unknown as { postMessage?: unknown }
if (typeof g.postMessage === 'function') {
  Comlink.expose(instance)
}
