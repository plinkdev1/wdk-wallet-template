'use client'

import { WdkThemeProvider, defaultTheme } from '@wdk-starter/wdk-ui'
import { WalletProvider } from '@/wallet/wallet-provider'

/** Client-side provider stack: WDK theme (CSS variables) + wallet worklet context. */
export function Providers ({ children }: { children: React.ReactNode }) {
  return (
    <WdkThemeProvider theme={defaultTheme}>
      <WalletProvider>{children}</WalletProvider>
    </WdkThemeProvider>
  )
}
