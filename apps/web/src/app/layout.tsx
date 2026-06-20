import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WDK Wallet Template',
  description: 'A self-custodial multi-chain wallet template built on Tether WDK and Next.js.',
  icons: { icon: '/favicon.ico' }
}

export const viewport: Viewport = {
  themeColor: '#161312',
  width: 'device-width',
  initialScale: 1
}

export default function RootLayout ({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
