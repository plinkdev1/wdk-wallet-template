'use client'

import { useEffect, useState } from 'react'
import { ThemePicker, BrandPicker, isValidHexPrimary } from '@wdk-starter/wdk-ui'
import { Modal } from './modal'
import { useAppearance, TEMPLATE_BRAND } from './appearance-provider'

/**
 * In-app Appearance settings. Re-skin the wallet (theme swatches / edge style /
 * light-dark mode + an arbitrary hex primary) and re-brand it (display name,
 * wordmark, mark) at runtime — every change persists to localStorage. This is
 * the user-facing surface over wdk-ui's ThemePicker + BrandPicker, shipped so a
 * fork inherits a working customization panel instead of a code-only API.
 */
export function AppearanceDialog () {
  const { theme, setTheme, customPrimary, setCustomPrimary, brand, setBrand, setOpen } = useAppearance()

  // Local draft for the hex text field so partial input ("#F4") doesn't get
  // rejected mid-type; we only commit a valid #RRGGBB (or clear on empty).
  const [hexDraft, setHexDraft] = useState(customPrimary ?? '')
  useEffect(() => { setHexDraft(customPrimary ?? '') }, [customPrimary])

  function commitHex (raw: string) {
    setHexDraft(raw)
    const v = raw.trim()
    if (v === '') setCustomPrimary(null)
    else if (isValidHexPrimary(v)) setCustomPrimary(v)
  }

  return (
    <Modal title="Appearance" onClose={() => setOpen(false)}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <section>
          <ThemePicker value={theme} onChange={setTheme} />
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={labelStyle}>Custom primary color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="color"
              value={customPrimary ?? theme.colors.primary}
              onChange={(e) => commitHex(e.target.value)}
              aria-label="Custom primary color"
              style={{ width: 40, height: 32, padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
            />
            <input
              type="text"
              inputMode="text"
              placeholder="#RRGGBB"
              value={hexDraft}
              onChange={(e) => commitHex(e.target.value)}
              spellCheck={false}
              style={hexInput}
            />
            {customPrimary && (
              <button onClick={() => setCustomPrimary(null)} style={resetLink}>Reset</button>
            )}
          </div>
          <span style={hintStyle}>Overrides the swatch above with any 16M-color hex.</span>
        </section>

        <section>
          <BrandPicker value={brand} onChange={setBrand} defaults={TEMPLATE_BRAND} />
        </section>
      </div>
    </Modal>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: 'var(--text-secondary, #b3a79f)'
}
const hexInput: React.CSSProperties = {
  flex: 1, padding: '7px 10px', fontSize: 13,
  border: '1px solid var(--border-subtle, var(--border))', borderRadius: 'var(--radius-md, 8px)',
  background: 'var(--bg-elevated-1, transparent)', color: 'var(--text-primary)',
  fontFamily: 'ui-monospace, monospace', boxSizing: 'border-box'
}
const resetLink: React.CSSProperties = {
  background: 'none', border: 'none', color: 'var(--text-secondary, #b3a79f)',
  fontSize: 12, cursor: 'pointer', textDecoration: 'underline'
}
const hintStyle: React.CSSProperties = {
  fontSize: 11, color: 'var(--text-secondary, #b3a79f)'
}
