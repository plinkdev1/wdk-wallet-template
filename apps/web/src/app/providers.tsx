'use client'

import { AppearanceProvider } from '@/components/appearance-provider'
import { WalletProvider } from '@/wallet/wallet-provider'

/**
 * Client-side provider stack: runtime Appearance (WDK theme + brand, both
 * user-configurable and persisted) wrapping the wallet worklet context.
 */
export function Providers ({ children }: { children: React.ReactNode }) {
  return (
    <AppearanceProvider>
      <WalletProvider>{children}</WalletProvider>
    </AppearanceProvider>
  )
}
