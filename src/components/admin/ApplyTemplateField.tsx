'use client'

import React, { useEffect, useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

type TemplateOption = {
  id: string
  name?: string | null
  slug?: string | null
  category?: string | null
}

type ApplyResponse = {
  createdPages?: string[]
  skippedPages?: string[]
  updatedTenant?: boolean
  warnings?: string[]
  error?: string
}

/**
 * Tombol "Terapkan template" di sidebar dokumen Tenant.
 *
 * Menyalin halaman + navbar/footer + tema dari sebuah template. Halaman yang
 * sudah ada tidak ditimpa, jadi aman diklik ulang.
 */
export default function ApplyTemplateField() {
  const { id } = useDocumentInfo()

  const [templates, setTemplates] = useState<TemplateOption[]>([])
  const [templateID, setTemplateID] = useState('')
  const [overwrite, setOverwrite] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const res = await fetch('/api/templates?limit=100&depth=0&sort=name', {
          credentials: 'include',
        })
        if (!res.ok) return
        const json = (await res.json()) as { docs?: TemplateOption[] }
        if (!cancelled) setTemplates(json.docs || [])
      } catch {
        // Diamkan: picker kosong lebih baik daripada mengganggu form.
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  const apply = async () => {
    if (!id || !templateID) return

    setIsLoading(true)
    setMessage(null)
    setError(null)

    try {
      const res = await fetch(`/api/tenants/${id}/apply-template`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: templateID, overwrite }),
      })

      const json = (await res.json()) as ApplyResponse

      if (!res.ok) {
        setError(json.error || 'Gagal menerapkan template.')
        return
      }

      const created = json.createdPages?.length || 0
      const skipped = json.skippedPages?.length || 0
      const parts = [`${created} halaman dibuat`]
      if (skipped > 0) parts.push(`${skipped} dilewati (sudah ada)`)
      if (json.updatedTenant) parts.push('navbar/footer/tema diperbarui')
      if (json.warnings?.length) parts.push(json.warnings.join(' '))

      setMessage(parts.join(' • '))

      // Muat ulang agar daftar halaman & navbar baru terlihat.
      setTimeout(() => window.location.reload(), 1200)
    } catch {
      setError('Gagal menghubungi server.')
    } finally {
      setIsLoading(false)
    }
  }

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    borderRadius: '4px',
    border: '1px solid var(--theme-elevation-150)',
    background: 'var(--theme-input-bg)',
    color: 'var(--theme-elevation-800)',
    fontSize: '13px',
  }

  return (
    <div style={{ marginBottom: '24px' }}>
      <h4 style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600 }}>
        Template Situs
      </h4>

      <p style={{ margin: '0 0 10px', fontSize: '12px', opacity: 0.7 }}>
        Salin halaman jadi, navbar, footer, dan tema ke tenant ini.
      </p>

      {!id ? (
        <p style={{ margin: 0, fontSize: '12px', opacity: 0.7 }}>
          Simpan tenant terlebih dahulu untuk menerapkan template.
        </p>
      ) : (
        <>
          <select
            value={templateID}
            onChange={(event) => setTemplateID(event.target.value)}
            style={selectStyle}
            disabled={isLoading || templates.length === 0}
          >
            <option value="">
              {templates.length === 0 ? 'Belum ada template' : 'Pilih template…'}
            </option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name || template.slug || template.id}
              </option>
            ))}
          </select>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              margin: '10px 0',
              fontSize: '12px',
            }}
          >
            <input
              type="checkbox"
              checked={overwrite}
              onChange={(event) => setOverwrite(event.target.checked)}
              disabled={isLoading}
            />
            Timpa navbar/footer/tema yang sudah ada
          </label>

          <button
            type="button"
            onClick={apply}
            disabled={isLoading || !templateID}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '4px',
              border: 'none',
              background: isLoading || !templateID ? 'var(--theme-elevation-300)' : '#0f172a',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '13px',
              cursor: isLoading || !templateID ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? 'Menerapkan…' : 'Terapkan template'}
          </button>

          {message ? (
            <p style={{ margin: '10px 0 0', fontSize: '12px', color: '#0f7b3d' }}>
              {message}
            </p>
          ) : null}

          {error ? (
            <p style={{ margin: '10px 0 0', fontSize: '12px', color: '#b42318' }}>
              {error}
            </p>
          ) : null}
        </>
      )}
    </div>
  )
}
