import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));
export default defineConfig({
  root: here('.'),
  // Serve the app's real public/ assets (spark.svg, icons) so harness captures
  // match the running app instead of showing broken-image glyphs.
  publicDir: here('../public'),
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@/wallet/wallet-client', replacement: here('./stubs/wallet-client.ts') },
      { find: '@/wallet/wallet-provider', replacement: here('./stubs/wallet-provider.tsx') },
      { find: '@', replacement: here('../src') },
    ],
  },
  build: { outDir: here('./dist'), emptyOutDir: true, rollupOptions: { input: { swap: here('./swap.html'), earn: here('./earn.html'), buy: here('./buy.html'), shell: here('./shell.html') } } },
});
