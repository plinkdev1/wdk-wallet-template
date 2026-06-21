'use client'

/* eslint-disable @next/next/no-img-element */

import { useBrand } from '@wdk-starter/wdk-ui'

/** Header brand lockup — reads the live brand identity from BrandProvider, so
 *  the in-app Appearance panel (or a fork's TEMPLATE_BRAND) re-skins it. */
export function BrandHeader () {
  const brand = useBrand()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {brand.markSrc && (
        <img src={brand.markSrc} alt={brand.markAlt ?? brand.name} width={36} height={36} style={{ borderRadius: 8 }} />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <strong style={{ fontSize: 16 }}>{brand.name}</strong>
        <span style={{ fontSize: 12, color: 'var(--text-secondary, #b3a79f)' }}>Next.js template</span>
      </div>
    </div>
  )
}
