import NodePolyfillPlugin from 'node-polyfill-webpack-plugin'

/**
 * The WDK engine (@tetherto/wdk + sodium-javascript + bip39) runs inside a Web
 * Worker (the "worklet" — our secure execution layer). It expects Node-style
 * globals (Buffer, process) and compiles WebAssembly for its crypto stack.
 *
 * Browser builds (client + worker) therefore need:
 *   - Buffer / process polyfills (NodePolyfillPlugin + ProvidePlugin)
 *   - async WebAssembly enabled (sodium's blake2b/sha512 wasm)
 *
 * The server build is left untouched — the wallet only ever runs client-side.
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@wdk-starter/wdk-ui', '@wdk-starter/wdk-web-core'],
  webpack (config, { isServer, webpack }) {
    config.experiments = { ...config.experiments, asyncWebAssembly: true }

    if (!isServer) {
      config.plugins.push(new NodePolyfillPlugin({ additionalAliases: ['process'] }))
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser'
        })
      )
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false
      }
      // Force the pure-JS sodium backend in the browser/worker bundle.
      // sodium-universal would otherwise statically pull sodium-native (a
      // Node/Bare native addon) which cannot run in a browser worker. The two
      // are API-compatible backends of sodium-universal, so this is safe and
      // matches what the WDK browser extension uses.
      config.resolve.alias = {
        ...config.resolve.alias,
        'sodium-native': 'sodium-javascript'
      }
    }

    // WDK's wasm modules emit a known, harmless "Critical dependency" warning
    // from dynamic requires; silence it so CI logs stay clean.
    config.module.exprContextCritical = false

    return config
  }
}

export default nextConfig
