'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useFormFields } from '@payloadcms/ui'
import {
  buildAbsoluteInvitationLink,
  buildInvitationWhatsAppLink,
  type InvitationTenantInfo,
} from '@/lib/invitationShare'

type TenantInfo = InvitationTenantInfo

type FieldState = { value?: unknown } | undefined

function fieldValue(fields: Record<string, FieldState>, name: string): unknown {
  return fields?.[name]?.value
}

function idFromRef(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value && 'id' in value) {
    const id = (value as { id?: unknown }).id
    return typeof id === 'string' && id ? id : null
  }
  return null
}

/**
 * Panel "Bagikan Undangan" di sidebar dokumen tamu.
 *
 * Menampilkan link absolut (mengikuti host/domain tenant bila ada), tombol
 * salin, dan tombol kirim WhatsApp. Link dibangun dari `linkSlug` yang dibuat
 * server, jadi tidak pernah berubah walau nama tamu diedit.
 */
export default function InvitationShareField() {
  const linkSlug = useFormFields(([fields]) =>
    fieldValue(fields as unknown as Record<string, FieldState>, 'linkSlug'),
  )
  const invitationCode = useFormFields(([fields]) =>
    fieldValue(fields as unknown as Record<string, FieldState>, 'invitationCode'),
  )
  const tenantRef = useFormFields(([fields]) =>
    fieldValue(fields as unknown as Record<string, FieldState>, 'tenant'),
  )
  const phone = useFormFields(([fields]) =>
    fieldValue(fields as unknown as Record<string, FieldState>, 'phone'),
  )

  const tenantID = idFromRef(tenantRef)
  const [tenant, setTenant] = useState<TenantInfo | null>(null)
  const [origin, setOrigin] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  useEffect(() => {
    if (!tenantID) {
      setTenant(null)
      return
    }

    let active = true
    fetch(`/api/tenants/${tenantID}?depth=0`, { credentials: 'include' })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (active) setTenant((data as TenantInfo) || null)
      })
      .catch(() => {
        if (active) setTenant(null)
      })

    return () => {
      active = false
    }
  }, [tenantID])

  const link = useMemo(
    () => buildAbsoluteInvitationLink(typeof linkSlug === 'string' ? linkSlug : '', tenant, origin),
    [linkSlug, origin, tenant],
  )

  const whatsapp = useMemo(() => buildInvitationWhatsAppLink(link, typeof phone === 'string' ? phone : ''), [link, phone])

  const copy = async () => {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  if (!link) {
    return (
      <div
        style={{
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: 6,
          padding: '12px 14px',
          fontSize: 13,
          lineHeight: 1.5,
        }}
      >
        <strong style={{ display: 'block', marginBottom: 4 }}>Bagikan Undangan</strong>
        <span style={{ opacity: 0.7 }}>
          Link undangan dibuat otomatis setelah tamu disimpan.
        </span>
      </div>
    )
  }

  return (
    <div
      style={{
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 6,
        padding: '12px 14px',
        fontSize: 13,
      }}
    >
      <strong style={{ display: 'block', marginBottom: 8 }}>Bagikan Undangan</strong>

      <input
        readOnly
        value={link}
        onFocus={(event) => event.currentTarget.select()}
        style={{
          width: '100%',
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: 4,
          padding: '6px 8px',
          fontSize: 12,
          background: 'var(--theme-elevation-50)',
          color: 'inherit',
        }}
      />

      {invitationCode ? (
        <p style={{ margin: '6px 0 0', fontSize: 11, opacity: 0.7 }}>
          Kode check-in: <code>{String(invitationCode)}</code>
        </p>
      ) : null}

      <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={copy}
          style={{
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: 4,
            padding: '5px 10px',
            fontSize: 12,
            cursor: 'pointer',
            background: 'transparent',
            color: 'inherit',
          }}
        >
          {copied ? 'Tersalin' : 'Salin link'}
        </button>

        <a
          href={whatsapp}
          target="_blank"
          rel="noreferrer noopener"
          style={{
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: 4,
            padding: '5px 10px',
            fontSize: 12,
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          Kirim WhatsApp
        </a>
      </div>
    </div>
  )
}
