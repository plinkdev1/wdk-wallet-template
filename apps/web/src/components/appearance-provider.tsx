'use client'

import { createContext, useContext, useMemo, useState } from 'react'
import {
  WdkThemeProvider, BrandProvider,
  useThemePicker, useBrandPicker, useCustomPrimary,
  composeTheme, defaultTheme,
  type WdkTheme, type BrandConfig
} from '@wdk-starter/wdk-ui'

/**
 * The template's out-of-the-box brand. A fork rebrands either by editing this
 * constant (build-time default) or live via the in-app Appearance panel
 * (runtime, persisted to localStorage). Assets live in apps/web/public/.
 */
export const TEMPLATE_BRAND: BrandConfig = {
  name: 'WDK Wallet',
  markSrc: '/wdk-mark.png',
  markAlt: 'WDK Wallet',
  wordmarkSrc: '/wdk-wordmark.svg',
  wordmarkAlt: 'WDK Wallet'
}

interface AppearanceValue {
  theme: WdkTheme
  setTheme: (t: WdkTheme) => void
  /** Arbitrary hex primary override (#RRGGBB) or null to use the swatch. */
  customPrimary: string | null
  setCustomPrimary: (hex: string | null) => void
  brand: BrandConfig
  setBrand: (b: BrandConfig) => void
  /** Whether the Appearance settings panel is open. */
  open: boolean
  setOpen: (o: boolean) => void
}

const AppearanceContext = createContext<AppearanceValue | null>(null)

/**
 * Runtime appearance layer for the template wallet. Wires wdk-ui's persisted
 * theme + brand picker hooks into live WdkThemeProvider / BrandProvider, and
 * exposes setters so the in-app Appearance panel can re-skin and re-brand the
 * wallet with no code change.
 *
 * - Theme (7 swatches x 4 edge styles x 2 modes) via useThemePicker.
 * - Any-hex primary override via useCustomPrimary (composed over the theme).
 * - Brand identity (name / wordmark / mark) via useBrandPicker.
 *
 * All three persist to localStorage, so a reload keeps the chosen look. Theme
 * CSS variables are injected by WdkThemeProvider in a client-only useEffect and
 * the whole wallet renders after mount, so there is no SSR theme flash.
 */
export function AppearanceProvider ({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useThemePicker(defaultTheme)
  const [customPrimary, setCustomPrimary] = useCustomPrimary()
  const [brand, setBrand] = useBrandPicker(TEMPLATE_BRAND)
  const [open, setOpen] = useState(false)

  // A custom hex primary, when set, overrides the swatch selection.
  const effectiveTheme = useMemo(
    () => (customPrimary ? composeTheme(theme, customPrimary, theme.radius, theme.mode) : theme),
    [theme, customPrimary]
  )

  const value = useMemo<AppearanceValue>(() => ({
    theme, setTheme, customPrimary, setCustomPrimary, brand, setBrand, open, setOpen
  }), [theme, setTheme, customPrimary, setCustomPrimary, brand, setBrand, open])

  return (
    <AppearanceContext.Provider value={value}>
      <WdkThemeProvider theme={effectiveTheme}>
        <BrandProvider brand={brand}>{children}</BrandProvider>
      </WdkThemeProvider>
    </AppearanceContext.Provider>
  )
}

export function useAppearance (): AppearanceValue {
  const ctx = useContext(AppearanceContext)
  if (!ctx) throw new Error('useAppearance must be used within <AppearanceProvider>')
  return ctx
}
