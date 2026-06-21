# Customization — theming & branding

This template is built to be **re-skinned and re-branded without editing
component code**. The visual system lives in the shared `@wdk-starter/wdk-ui`
package — the *same* theme + brand system that powers the
[WDK Browser Extension](https://github.com/plinkdev1/wdk-wallet-extension) — so
anything you can do there, you can do here.

## Theme

`wdk-ui` ships three presets — **`wdkWarmTheme`** (default, WDK orange),
**`coolDarkTheme`** (purple), **`institutionalLightTheme`** (light) — and a
`WdkThemeProvider` that injects the palette as CSS variables (`--color-primary`,
`--bg-base`, `--bg-elevated-1/2/3`, `--text-primary/secondary`, …). Every
component and screen (onboarding, dashboard, send, and the DeFi/Buy dialogs)
styles itself only through those variables.

Customize in **`apps/web/src/app/providers.tsx`**:

```tsx
import { WdkThemeProvider, coolDarkTheme } from '@wdk-starter/wdk-ui';

// A preset…
<WdkThemeProvider theme={coolDarkTheme}>…</WdkThemeProvider>

// …or your own palette (override only what you need):
<WdkThemeProvider theme={{ ...wdkWarmTheme, colors: { ...wdkWarmTheme.colors, primary: '#0D9488' } }}>
  …
</WdkThemeProvider>
```

That single change re-skins the whole app.

## Brand

Wrap the tree in `BrandProvider` to swap the **name, wordmark, and mark**:

```tsx
import { BrandProvider } from '@wdk-starter/wdk-ui';

<BrandProvider brand={{ name: 'Acme Wallet', wordmarkSrc: '/acme-wordmark.svg', markSrc: '/acme-mark.png' }}>
  …
</BrandProvider>
```

Brand assets live in `brand/`.

## Runtime pickers (optional)

The template ships a **fixed** theme/brand by design (it's a reference for a
production wallet). If you want end-user runtime customization, the components
are already available in `wdk-ui` — mount them exactly as the extension does:

- `useThemePicker()` / `useBrandPicker()` hooks (localStorage-backed),
- the `ThemePicker` and `BrandPicker` components in a Settings view.

See the extension's `apps/extension/src/popup/views/settings/` for the wired
pattern to copy.

## Dark / light mode

All three presets are available; the template defaults to `wdkWarmTheme` (dark).
Set `theme.mode` to `'light'` (or pass `institutionalLightTheme`) for light mode.
