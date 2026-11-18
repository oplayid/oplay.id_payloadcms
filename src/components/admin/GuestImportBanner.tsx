'use client'

import React from 'react'
import { useConfig } from '@payloadcms/ui'

/**
 * Banner di atas tabel tamu.
 *
 * Impor massal adalah jalur utama untuk acara besar, jadi pintunya diletakkan
 * di tempat yang langsung terlihat, bukan hanya di menu tindakan.
 */
export default function GuestImportBanner() {
  const { config } = useConfig()
  const adminRoute = config.routes?.admin || '/admin'
  const href = `${adminRoute === '/' ? '' : adminRoute}/collections/guests/import`

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 20,
        padding: '16px 18px',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 'var(--style-radius-m, 6px)',
        background: 'var(--theme-elevation-50)',
      }}
    >
      <div style={{ minWidth: 240, flex: '1 1 320px' }}>
        <strong style={{ display: 'block', fontSize: 14 }}>Punya daftar tamu di spreadsheet?</strong>
        <p style={{ margin: '4px 0 0', fontSize: 13, lineHeight: 1.5, opacity: 0.75 }}>
          Impor ratusan tamu sekaligus dari CSV atau tempel langsung dari Excel/Google Sheets.
          Link undangan pribadi dibuat otomatis untuk setiap tamu.
        </p>
      </div>

      <a
        href={href}
        className="btn btn--style-primary btn--size-medium"
        style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
      >
        Impor Tamu
      </a>
    </div>
  )
}
