'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { toast, useConfig } from '@payloadcms/ui'
import {
  GUEST_IMPORT_COLUMNS,
  GUEST_IMPORT_IMPORT_BATCH,
  GUEST_IMPORT_MAX_FILE_BYTES,
  GUEST_IMPORT_MAX_ROWS,
  GUEST_IMPORT_PREVIEW_BATCH,
  guestImportResultCSV,
  guestImportTemplateCSV,
  parseGuestImport,
  type GuestImportExportRow,
  type GuestImportParseResult,
  type GuestImportRow,
} from '@/lib/guestImport'
import { buildAbsoluteInvitationLink, type InvitationTenantInfo } from '@/lib/invitationShare'

type AdminEvent = {
  id: string
  title?: string | null
  dateStart?: string | null
  defaultPax?: number | null
  _status?: string | null
  tenant?: string | { id?: string | null } | null
}

type RowStatus = 'created' | 'updated' | 'skipped' | 'failed' | 'new' | 'duplicate'

type RowResult = {
  line: number
  status: RowStatus
  id?: string
  name?: string
  linkSlug?: string
  invitationCode?: string
  error?: string
}

type DuplicateInfo = {
  id?: string
  name?: string
  reason: string
}

type Step = 'source' | 'preview' | 'importing' | 'done'

const STATUS_LABEL: Record<RowStatus, string> = {
  created: 'Dibuat',
  updated: 'Diperbarui',
  skipped: 'Dilewati',
  failed: 'Gagal',
  new: 'Baru',
  duplicate: 'Duplikat',
}

const STATUS_COLOR: Record<RowStatus, string> = {
  created: 'var(--theme-success-500)',
  updated: 'var(--theme-success-500)',
  skipped: 'var(--theme-warning-500)',
  failed: 'var(--theme-error-500)',
  new: 'var(--theme-success-500)',
  duplicate: 'var(--theme-warning-500)',
}

const primaryButton: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '9px 16px',
  border: '1px solid var(--theme-elevation-900, #111)',
  borderRadius: 'var(--style-radius-m, 6px)',
  background: 'var(--theme-elevation-900, #111)',
  color: 'var(--theme-elevation-0, #fff)',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
}

const secondaryButton: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '9px 14px',
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 'var(--style-radius-m, 6px)',
  background: 'transparent',
  color: 'inherit',
  fontSize: 13,
  cursor: 'pointer',
}

const cardStyle: React.CSSProperties = {
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 'var(--style-radius-m, 6px)',
  padding: '18px 20px',
  marginBottom: 20,
  background: 'var(--theme-elevation-0)',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 10px',
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 'var(--style-radius-s, 4px)',
  background: 'var(--theme-elevation-0)',
  color: 'inherit',
  fontSize: 13,
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 6,
  fontSize: 12,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  opacity: 0.65,
}

function toPayloadRow(row: GuestImportRow) {
  return {
    line: row.line,
    name: row.data.name,
    salutation: row.data.salutation,
    category: row.data.category,
    phone: row.data.phone,
    email: row.data.email,
    pax: row.data.pax,
    personalNote: row.data.personalNote,
  }
}

function summarize(results: RowResult[]) {
  return {
    total: results.length,
    created: results.filter((result) => result.status === 'created').length,
    updated: results.filter((result) => result.status === 'updated').length,
    skipped: results.filter((result) => result.status === 'skipped').length,
    failed: results.filter((result) => result.status === 'failed').length,
  }
}

async function readApiError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as {
      errors?: Array<{ message?: string }>
      message?: string
    }
    if (data?.errors?.[0]?.message) return data.errors[0].message
    if (data?.message) return data.message
  } catch {
    // Abaikan: pakai pesan status di bawah.
  }
  return `Permintaan gagal (${response.status}).`
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function statusOfRow(row: GuestImportRow, duplicates: Map<number, DuplicateInfo>) {
  if (!row.valid) return { label: 'Error', color: 'var(--theme-error-500)' }
  if (duplicates.has(row.line)) return { label: 'Duplikat', color: 'var(--theme-warning-500)' }
  if (row.issues.some((issue) => issue.level === 'warning')) {
    return { label: 'Peringatan', color: 'var(--theme-warning-500)' }
  }
  return { label: 'Siap', color: 'var(--theme-success-500)' }
}

/**
 * Wizard impor tamu.
 *
 * Tiga tahap: sumber data → pratinjau/validasi → hasil. Parsing dilakukan di
 * browser, lalu endpoint server memvalidasi ulang per batch saat menyimpan.
 */
export default function GuestImportView() {
  const { config } = useConfig()
  const adminRoute = config.routes?.admin || '/admin'
  const guestsHref = `${adminRoute === '/' ? '' : adminRoute}/collections/guests`

  const [events, setEvents] = useState<AdminEvent[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [eventsError, setEventsError] = useState('')
  const [eventID, setEventID] = useState('')
  const [tenant, setTenant] = useState<InvitationTenantInfo | null>(null)

  const [sourceText, setSourceText] = useState('')
  const [fileName, setFileName] = useState('')
  const [pasteText, setPasteText] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [parseResult, setParseResult] = useState<GuestImportParseResult | null>(null)
  const [parseError, setParseError] = useState('')

  const [step, setStep] = useState<Step>('source')
  const [duplicates, setDuplicates] = useState<Map<number, DuplicateInfo>>(new Map())
  const [checking, setChecking] = useState(false)
  const [checkProgress, setCheckProgress] = useState({ done: 0, total: 0 })
  const [mode, setMode] = useState<'skip' | 'update'>('skip')

  const [results, setResults] = useState<RowResult[]>([])
  const [importProgress, setImportProgress] = useState({ done: 0, total: 0 })
  const [importError, setImportError] = useState('')

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  useEffect(() => {
    let active = true

    fetch('/api/events?limit=200&depth=0&draft=true&sort=-dateStart', { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) throw new Error(await readApiError(response))
        return response.json()
      })
      .then((data) => {
        if (!active) return
        const docs: AdminEvent[] = Array.isArray(data?.docs) ? data.docs : []
        setEvents(docs)

        const params = new URLSearchParams(window.location.search)
        const requested = params.get('event')
        if (requested && docs.some((doc) => doc.id === requested)) {
          setEventID(requested)
        }
      })
      .catch((error) => {
        if (active) setEventsError(error instanceof Error ? error.message : 'Gagal memuat acara.')
      })
      .finally(() => {
        if (active) setEventsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === eventID) || null,
    [events, eventID],
  )

  useEffect(() => {
    if (!selectedEvent) {
      setTenant(null)
      return
    }

    const tenantID =
      typeof selectedEvent.tenant === 'object' && selectedEvent.tenant
        ? selectedEvent.tenant.id
        : selectedEvent.tenant

    if (!tenantID || typeof tenantID !== 'string') {
      setTenant(null)
      return
    }

    let active = true
    fetch(`/api/tenants/${tenantID}?depth=0`, { credentials: 'include' })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (active) setTenant((data as InvitationTenantInfo) || null)
      })
      .catch(() => {
        if (active) setTenant(null)
      })

    return () => {
      active = false
    }
  }, [selectedEvent])

  // Ganti acara = mulai dari bersih, agar data acara lama tidak ikut terimpor.
  useEffect(() => {
    setParseResult(null)
    setParseError('')
    setDuplicates(new Map())
    setResults([])
    setImportError('')
    setImportProgress({ done: 0, total: 0 })
    setStep('source')
  }, [eventID])

  const stats = useMemo(() => {
    const rows = parseResult?.rows || []
    const validRows = rows.filter((row) => row.valid)
    const duplicateRows = validRows.filter((row) => duplicates.has(row.line))

    return {
      total: rows.length,
      valid: validRows.length,
      invalid: rows.length - validRows.length,
      duplicate: duplicateRows.length,
      fresh: validRows.length - duplicateRows.length,
      warnings: rows.filter((row) => row.issues.some((issue) => issue.level === 'warning')).length,
    }
  }, [parseResult, duplicates])

  const summary = useMemo(() => summarize(results), [results])

  async function preflight(rows: GuestImportRow[]) {
    const validRows = rows.filter((row) => row.valid)
    if (!eventID || validRows.length === 0) {
      setDuplicates(new Map())
      return
    }

    setChecking(true)
    setDuplicates(new Map())
    setCheckProgress({ done: 0, total: validRows.length })

    const found = new Map<number, DuplicateInfo>()

    try {
      for (let index = 0; index < validRows.length; index += GUEST_IMPORT_PREVIEW_BATCH) {
        const chunk = validRows.slice(index, index + GUEST_IMPORT_PREVIEW_BATCH)
        const response = await fetch('/api/guests/import', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventID,
            dryRun: true,
            mode,
            rows: chunk.map(toPayloadRow),
          }),
        })

        if (!response.ok) throw new Error(await readApiError(response))

        const data = (await response.json()) as { results?: RowResult[] }
        for (const result of data.results || []) {
          if (result.status === 'duplicate') {
            found.set(result.line, {
              id: result.id,
              name: result.name,
              reason: result.error || 'Tamu sudah ada.',
            })
          }
        }

        setDuplicates(new Map(found))
        setCheckProgress({
          done: Math.min(validRows.length, index + chunk.length),
          total: validRows.length,
        })
      }
    } catch (error) {
      // Pratinjau duplikat bersifat opsional: server tetap memeriksa ulang.
      toast.error(error instanceof Error ? error.message : 'Gagal mengecek duplikat.')
    } finally {
      setChecking(false)
    }
  }

  async function runPreview(text: string) {
    if (!selectedEvent) {
      toast.error('Pilih acara terlebih dahulu.')
      return
    }

    const parsed = parseGuestImport(text, { defaultPax: selectedEvent.defaultPax })
    if (!parsed.ok) {
      setParseError(parsed.error || 'Data tidak bisa dibaca.')
      setParseResult(null)
      return
    }

    setParseError('')
    setParseResult(parsed)
    setResults([])
    setImportError('')
    setStep('preview')
    await preflight(parsed.rows)
  }

  async function handleFile(file: File | null) {
    if (!file) return

    if (file.size > GUEST_IMPORT_MAX_FILE_BYTES) {
      setParseError(
        `Ukuran file ${(file.size / 1024 / 1024).toFixed(1)} MB melebihi batas 2 MB. Pecah file menjadi beberapa bagian.`,
      )
      return
    }

    try {
      const text = await file.text()
      setSourceText(text)
      setFileName(file.name)
      setPasteText('')
      await runPreview(text)
    } catch {
      setParseError('File tidak bisa dibaca. Pastikan formatnya CSV/teks biasa (UTF-8).')
    }
  }

  async function startImport() {
    if (!parseResult || !eventID) return

    const rows = parseResult.rows.filter((row) => row.valid)
    if (rows.length === 0) return

    setImportError('')
    setResults([])
    setImportProgress({ done: 0, total: rows.length })
    setStep('importing')

    const collected: RowResult[] = []

    try {
      for (let index = 0; index < rows.length; index += GUEST_IMPORT_IMPORT_BATCH) {
        const chunk = rows.slice(index, index + GUEST_IMPORT_IMPORT_BATCH)
        const response = await fetch('/api/guests/import', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventID,
            mode,
            rows: chunk.map(toPayloadRow),
          }),
        })

        if (!response.ok) throw new Error(await readApiError(response))

        const data = (await response.json()) as { results?: RowResult[] }
        collected.push(...(data.results || []))
        setResults([...collected])
        setImportProgress({
          done: Math.min(rows.length, index + chunk.length),
          total: rows.length,
        })
      }

      setStep('done')
      const finalSummary = summarize(collected)
      toast.success(
        `Impor selesai: ${finalSummary.created} dibuat, ${finalSummary.updated} diperbarui, ${finalSummary.skipped} dilewati.`,
      )
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Impor gagal.')
      setStep('preview')
    }
  }

  function resetWizard() {
    setSourceText('')
    setFileName('')
    setPasteText('')
    setParseResult(null)
    setParseError('')
    setDuplicates(new Map())
    setResults([])
    setImportError('')
    setImportProgress({ done: 0, total: 0 })
    setStep('source')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function exportRows(): GuestImportExportRow[] {
    const byLine = new Map((parseResult?.rows || []).map((row) => [row.line, row]))

    return results.map((result) => {
      const source = byLine.get(result.line)?.data
      return {
        nama: source?.name || result.name || '',
        sapaan: source?.salutation || '',
        kategori: source?.category || '',
        whatsapp: source?.phone || '',
        email: source?.email || '',
        kursi: source?.pax ?? '',
        link: result.linkSlug
          ? buildAbsoluteInvitationLink(result.linkSlug, tenant, origin)
          : '',
        kode: result.invitationCode || '',
        status: STATUS_LABEL[result.status] || result.status,
        catatan: result.error || '',
      }
    })
  }

  const canImport = Boolean(eventID) && stats.valid > 0 && !checking

  return (
    <div className="gutter--left gutter--right" style={{ maxWidth: 1080, margin: '0 auto', paddingTop: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 26, lineHeight: 1.2 }}>Impor Tamu Undangan</h1>
        <p style={{ margin: '8px 0 0', maxWidth: 760, fontSize: 14, lineHeight: 1.6, opacity: 0.75 }}>
          Susun daftar tamu di Excel/Google Sheets, ekspor sebagai CSV atau salin tabelnya, lalu
          tempel di sini. Setiap tamu otomatis mendapat link undangan pribadi yang siap dibagikan.
        </p>
      </div>

      <StepTrail step={step} />

      {eventsError ? <Notice tone="error">{eventsError}</Notice> : null}
      {importError ? <Notice tone="error">{importError}</Notice> : null}

      {step === 'source' ? (
        <>
          <section style={cardStyle}>
            <label htmlFor="guest-import-event" style={labelStyle}>
              1. Pilih acara
            </label>
            <select
              id="guest-import-event"
              value={eventID}
              onChange={(event) => setEventID(event.target.value)}
              disabled={eventsLoading}
              style={{ ...inputStyle, maxWidth: 420 }}
            >
              <option value="">
                {eventsLoading ? 'Memuat acara…' : events.length === 0 ? 'Belum ada acara' : '— Pilih acara —'}
              </option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title || 'Tanpa nama'}
                  {event._status === 'draft' ? ' (draft)' : ''}
                </option>
              ))}
            </select>
            {selectedEvent ? (
              <p style={{ margin: '8px 0 0', fontSize: 12, opacity: 0.7 }}>
                Kursi bawaan acara: {selectedEvent.defaultPax || 2} orang. Nilai di spreadsheet
                selalu menang bila diisi.
              </p>
            ) : null}
          </section>

          <section style={cardStyle}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
                marginBottom: 12,
              }}
            >
              <span style={{ ...labelStyle, marginBottom: 0 }}>2. Sumber data</span>
              <button
                type="button"
                style={secondaryButton}
                onClick={() => downloadTextFile('template-impor-tamu.csv', guestImportTemplateCSV())}
              >
                Unduh template CSV
              </button>
            </div>

            <label
              onDragOver={(event) => {
                event.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(event) => {
                event.preventDefault()
                setDragOver(false)
                void handleFile(event.dataTransfer.files?.[0] || null)
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '28px 20px',
                border: `1px dashed ${dragOver ? 'var(--theme-elevation-800)' : 'var(--theme-elevation-200)'}`,
                borderRadius: 'var(--style-radius-m, 6px)',
                background: dragOver ? 'var(--theme-elevation-50)' : 'var(--theme-elevation-0)',
                cursor: eventID ? 'pointer' : 'not-allowed',
                opacity: eventID ? 1 : 0.6,
                textAlign: 'center',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.tsv,.txt,text/csv,text/plain"
                disabled={!eventID}
                onChange={(event) => void handleFile(event.target.files?.[0] || null)}
                style={{ display: 'none' }}
              />
              <strong style={{ fontSize: 14 }}>{fileName || 'Tarik file ke sini atau klik untuk memilih'}</strong>
              <span style={{ fontSize: 12, opacity: 0.7 }}>
                CSV / TSV, maksimal 2 MB dan {GUEST_IMPORT_MAX_ROWS.toLocaleString('id-ID')} baris
              </span>
            </label>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0 10px' }}>
              <span style={{ flex: 1, height: 1, background: 'var(--theme-elevation-150)' }} />
              <span style={{ fontSize: 11, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                atau tempel tabel
              </span>
              <span style={{ flex: 1, height: 1, background: 'var(--theme-elevation-150)' }} />
            </div>

            <textarea
              value={pasteText}
              onChange={(event) => setPasteText(event.target.value)}
              rows={5}
              placeholder={'nama\tsapaan\twhatsapp\tkursi\nBudi Santoso\tBapak\t08123456789\t2'}
              disabled={!eventID}
              style={{ ...inputStyle, fontFamily: 'monospace', lineHeight: 1.5, resize: 'vertical' }}
            />

            <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              <button
                type="button"
                disabled={!eventID || !pasteText.trim()}
                onClick={() => void runPreview(pasteText)}
                style={{ ...primaryButton, opacity: !eventID || !pasteText.trim() ? 0.5 : 1 }}
              >
                Pratinjau tempelan
              </button>
              {sourceText ? (
                <button type="button" style={secondaryButton} onClick={() => void runPreview(sourceText)}>
                  Pratinjau ulang file
                </button>
              ) : null}
            </div>

            <p style={{ margin: '14px 0 0', fontSize: 12, lineHeight: 1.6, opacity: 0.7 }}>
              Kolom yang dikenali: {GUEST_IMPORT_COLUMNS.map((column) => column.label).join(', ')}.
              Kolom lain diabaikan. Nama wajib diisi.
            </p>
          </section>
        </>
      ) : null}

      {parseError ? <Notice tone="error">{parseError}</Notice> : null}

      {step === 'preview' && parseResult ? (
        <>
          <section style={cardStyle}>
            <div style={{ ...labelStyle, marginBottom: 10 }}>3. Pratinjau & validasi</div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
              <Chip label="Total baris" value={stats.total} />
              <Chip label="Siap diimpor" value={stats.valid} tone="success" />
              <Chip label="Duplikat" value={stats.duplicate} tone="warning" />
              <Chip label="Error" value={stats.invalid} tone="error" />
              <Chip label="Peringatan" value={stats.warnings} tone="warning" />
            </div>

            {parseResult.unknownHeaders.length > 0 ? (
              <Notice tone="warning">
                Kolom tidak dikenal diabaikan: {parseResult.unknownHeaders.join(', ')}.
              </Notice>
            ) : null}

            {checking ? (
              <p style={{ margin: '0 0 12px', fontSize: 13, opacity: 0.75 }}>
                Mengecek duplikat… {checkProgress.done}/{checkProgress.total}
              </p>
            ) : null}

            <div
              style={{
                border: '1px solid var(--theme-elevation-150)',
                borderRadius: 'var(--style-radius-s, 4px)',
                overflow: 'auto',
                maxHeight: 360,
                marginBottom: 16,
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: 'var(--theme-elevation-50)', textAlign: 'left' }}>
                    <th style={thStyle}>Baris</th>
                    <th style={thStyle}>Nama</th>
                    <th style={thStyle}>Sapaan</th>
                    <th style={thStyle}>WhatsApp</th>
                    <th style={thStyle}>Kursi</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parseResult.rows.slice(0, 200).map((row) => {
                    const status = statusOfRow(row, duplicates)
                    return (
                      <tr key={row.line} style={{ borderTop: '1px solid var(--theme-elevation-100)' }}>
                        <td style={tdStyle}>{row.line}</td>
                        <td style={tdStyle}>{row.data.name || <em style={{ opacity: 0.6 }}>(kosong)</em>}</td>
                        <td style={tdStyle}>{row.data.salutation || '—'}</td>
                        <td style={tdStyle}>{row.data.phone || '—'}</td>
                        <td style={tdStyle}>{row.data.pax}</td>
                        <td style={tdStyle}>
                          <span style={{ color: status.color, fontWeight: 600 }}>{status.label}</span>
                          {row.issues.length > 0 ? (
                            <div style={{ marginTop: 2, opacity: 0.65, fontSize: 11 }}>
                              {row.issues.map((issue) => issue.message).join(' · ')}
                            </div>
                          ) : null}
                          {duplicates.get(row.line) ? (
                            <div style={{ marginTop: 2, opacity: 0.65, fontSize: 11 }}>
                              {duplicates.get(row.line)?.reason}
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {parseResult.rows.length > 200 ? (
              <p style={{ margin: '0 0 14px', fontSize: 12, opacity: 0.65 }}>
                Menampilkan 200 baris pertama dari {parseResult.rows.length} baris. Semua baris tetap
                diproses.
              </p>
            ) : null}

            <div style={{ marginBottom: 18 }}>
              <span style={{ ...labelStyle, marginBottom: 8 }}>Bila tamu sudah ada</span>
              <div style={{ display: 'grid', gap: 8 }}>
                <label style={radioRowStyle}>
                  <input
                    type="radio"
                    name="guest-import-mode"
                    checked={mode === 'skip'}
                    onChange={() => setMode('skip')}
                  />
                  <span>
                    <strong>Lewati</strong> — tamu lama tidak diubah, hanya tamu baru yang ditambahkan.
                  </span>
                </label>
                <label style={radioRowStyle}>
                  <input
                    type="radio"
                    name="guest-import-mode"
                    checked={mode === 'update'}
                    onChange={() => setMode('update')}
                  />
                  <span>
                    <strong>Perbarui</strong> — nama, kontak, kursi, dan pesan dari spreadsheet
                    menimpa data lama. Link undangan dan status RSVP tidak diubah.
                  </span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="button" style={primaryButton} disabled={!canImport} onClick={() => void startImport()}>
                {mode === 'update'
                  ? `Impor ${stats.valid} tamu`
                  : `Impor ${stats.fresh} tamu baru`}
              </button>
              <button
                type="button"
                style={secondaryButton}
                onClick={() => {
                  setStep('source')
                  setParseResult(null)
                  setDuplicates(new Map())
                }}
              >
                Kembali
              </button>
            </div>
          </section>
        </>
      ) : null}

      {step === 'importing' ? (
        <section style={cardStyle}>
          <div style={{ ...labelStyle, marginBottom: 10 }}>Menyimpan tamu…</div>
          <Progress done={importProgress.done} total={importProgress.total} />
          <p style={{ margin: '10px 0 0', fontSize: 13, opacity: 0.75 }}>
            {importProgress.done} dari {importProgress.total} baris diproses. Jangan tutup halaman ini.
          </p>
        </section>
      ) : null}

      {step === 'done' ? (
        <section style={cardStyle}>
          <div style={{ ...labelStyle, marginBottom: 10 }}>Impor selesai</div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
            <Chip label="Dibuat" value={summary.created} tone="success" />
            <Chip label="Diperbarui" value={summary.updated} tone="success" />
            <Chip label="Dilewati" value={summary.skipped} tone="warning" />
            <Chip label="Gagal" value={summary.failed} tone="error" />
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
            <button
              type="button"
              style={primaryButton}
              onClick={() => downloadTextFile('hasil-impor-tamu.csv', guestImportResultCSV(exportRows()))}
            >
              Unduh CSV link undangan
            </button>
            <a href={guestsHref} style={{ ...secondaryButton, textDecoration: 'none' }}>
              Buka daftar tamu
            </a>
            <button type="button" style={secondaryButton} onClick={resetWizard}>
              Impor lagi
            </button>
          </div>

          <div
            style={{
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: 'var(--style-radius-s, 4px)',
              overflow: 'auto',
              maxHeight: 320,
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'var(--theme-elevation-50)', textAlign: 'left' }}>
                  <th style={thStyle}>Baris</th>
                  <th style={thStyle}>Nama</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Link</th>
                </tr>
              </thead>
              <tbody>
                {results.slice(0, 200).map((result, index) => {
                  const link = result.linkSlug
                    ? buildAbsoluteInvitationLink(result.linkSlug, tenant, origin)
                    : ''
                  return (
                    <tr key={`${result.line}-${index}`} style={{ borderTop: '1px solid var(--theme-elevation-100)' }}>
                      <td style={tdStyle}>{result.line}</td>
                      <td style={tdStyle}>{result.name || '—'}</td>
                      <td style={{ ...tdStyle, color: STATUS_COLOR[result.status], fontWeight: 600 }}>
                        {STATUS_LABEL[result.status]}
                        {result.error ? (
                          <div style={{ marginTop: 2, opacity: 0.65, fontSize: 11, fontWeight: 400 }}>
                            {result.error}
                          </div>
                        ) : null}
                      </td>
                      <td style={tdStyle}>
                        {link ? (
                          <a href={link} target="_blank" rel="noreferrer noopener" style={{ wordBreak: 'break-all' }}>
                            {link}
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {results.length > 200 ? (
            <p style={{ margin: '10px 0 0', fontSize: 12, opacity: 0.65 }}>
              Menampilkan 200 baris pertama. Unduh CSV untuk daftar lengkap.
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '8px 10px',
  fontWeight: 600,
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  whiteSpace: 'nowrap',
}

const tdStyle: React.CSSProperties = {
  padding: '8px 10px',
  verticalAlign: 'top',
}

const radioRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 10,
  alignItems: 'flex-start',
  fontSize: 13,
  lineHeight: 1.5,
}

function Chip({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: number
  tone?: 'default' | 'success' | 'warning' | 'error'
}) {
  const color =
    tone === 'success'
      ? 'var(--theme-success-500)'
      : tone === 'warning'
        ? 'var(--theme-warning-500)'
        : tone === 'error'
          ? 'var(--theme-error-500)'
          : 'var(--theme-elevation-800)'

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 10px',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 999,
        fontSize: 12,
      }}
    >
      <span style={{ opacity: 0.7 }}>{label}</span>
      <strong style={{ color }}>{value}</strong>
    </span>
  )
}

function Notice({ tone, children }: { tone: 'error' | 'warning'; children: React.ReactNode }) {
  const color = tone === 'error' ? 'var(--theme-error-500)' : 'var(--theme-warning-500)'
  return (
    <div
      role="status"
      style={{
        marginBottom: 16,
        padding: '10px 12px',
        border: `1px solid ${color}`,
        borderRadius: 'var(--style-radius-s, 4px)',
        color,
        fontSize: 13,
        lineHeight: 1.5,
      }}
    >
      {children}
    </div>
  )
}

function Progress({ done, total }: { done: number; total: number }) {
  const percent = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0
  return (
    <div
      style={{
        height: 8,
        borderRadius: 999,
        background: 'var(--theme-elevation-100)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${percent}%`,
          background: 'var(--theme-success-500)',
          transition: 'width 200ms ease',
        }}
      />
    </div>
  )
}

function StepTrail({ step }: { step: Step }) {
  const steps: Array<{ key: Step; label: string }> = [
    { key: 'source', label: 'Sumber data' },
    { key: 'preview', label: 'Pratinjau' },
    { key: 'done', label: 'Hasil' },
  ]
  const activeIndex = step === 'importing' ? 1 : steps.findIndex((entry) => entry.key === step)

  return (
    <ol
      style={{
        display: 'flex',
        gap: 18,
        listStyle: 'none',
        padding: 0,
        margin: '0 0 22px',
        fontSize: 12,
        flexWrap: 'wrap',
      }}
    >
      {steps.map((entry, index) => {
        const active = index === activeIndex
        const complete = index < activeIndex
        return (
          <li key={entry.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 22,
                height: 22,
                borderRadius: 999,
                border: '1px solid var(--theme-elevation-200)',
                background: active
                  ? 'var(--theme-elevation-800)'
                  : complete
                    ? 'var(--theme-success-500)'
                    : 'transparent',
                color: active || complete ? 'var(--theme-elevation-0)' : 'inherit',
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {index + 1}
            </span>
            <span style={{ fontWeight: active ? 700 : 400, opacity: active || complete ? 1 : 0.55 }}>
              {entry.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
