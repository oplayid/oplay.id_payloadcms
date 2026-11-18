'use client'

import React from 'react'
import { useConfig } from '@payloadcms/ui'

/** Menu "..." pada daftar tamu: pintasan ke wizard impor. */
export default function GuestImportAction() {
  const { config } = useConfig()
  const adminRoute = config.routes?.admin || '/admin'
  const href = `${adminRoute === '/' ? '' : adminRoute}/collections/guests/import`

  return (
    <a
      href={href}
      style={{
        display: 'block',
        padding: '8px 12px',
        fontSize: 13,
        textDecoration: 'none',
        color: 'inherit',
        whiteSpace: 'nowrap',
      }}
    >
      Impor Tamu
    </a>
  )
}
