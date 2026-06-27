// Screenshot harness stub for the worklet client: any method resolves to
// undefined so a dialog renders its chrome without a live wallet.
const api = new Proxy({}, { get: () => async () => undefined });
export function getWalletApi() { return api as never; }
export function disposeWalletApi() {}
