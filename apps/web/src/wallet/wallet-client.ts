/**
 * Main-thread client for the wallet worklet.
 *
 * Spawns the Web Worker (once) and wraps it with Comlink so the app can call
 * the `WalletWorker` API as ordinary async methods. The worker is the trust
 * boundary; this module is the only place that talks to it.
 */
import * as Comlink from 'comlink'
import type { WalletWorker } from '@wdk-starter/wdk-web-core/worker'

export type WalletApi = Comlink.Remote<WalletWorker>

let api: WalletApi | null = null
let worker: Worker | null = null

/**
 * Returns the Comlink-wrapped wallet worker, spawning it on first use.
 * Client-only — throws if called during server rendering.
 */
export function getWalletApi (): WalletApi {
  if (typeof window === 'undefined') {
    throw new Error('The wallet worker is only available in the browser.')
  }
  if (!api) {
    worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
    api = Comlink.wrap<WalletWorker>(worker)
  }
  return api
}

/** Tears down the worker (used on full wallet reset / sign-out). */
export function disposeWalletApi (): void {
  worker?.terminate()
  worker = null
  api = null
}
