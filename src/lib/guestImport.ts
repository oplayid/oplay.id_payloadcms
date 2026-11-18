/**
 * Utilitas impor tamu undangan.
 *
 * Modul ini dipakai bersama oleh wizard admin (browser) dan endpoint server,
 * jadi sengaja bebas dari impor Payload/Node. Semua validasi di sini diulang
 * di server: data dari browser tidak pernah dipercaya begitu saja.
 */

export const GUEST_IMPORT_MAX_ROWS = 5000
export const GUEST_IMPORT_MAX_FILE_BYTES = 2 * 1024 * 1024
/** Baris per permintaan saat menyimpan. */
export const GUEST_IMPORT_IMPORT_BATCH = 50
/** Baris per permintaan saat pratinjau duplikat (read-only). */
export const GUEST_IMPORT_PREVIEW_BATCH = 200

export const GUEST_IMPORT_PAX_MIN = 1
export const GUEST_IMPORT_PAX_MAX = 50

const MAX_NAME = 120
const MAX_SALUTATION = 40
const MAX_CATEGORY = 80
const MAX_NOTE = 1000
const MAX_EMAIL = 160

export type GuestImportField =
  | 'name'
  | 'salutation'
  | 'category'
  | 'phone'
  | 'email'
  | 'pax'
  | 'personalNote'

export type GuestImportIssueLevel = 'warning' | 'error'

export type GuestImportIssue = {
  level: GuestImportIssueLevel
  field?: GuestImportField | 'row'
  message: string
}

export type GuestImportRecord = {
  name: string
  salutation: string
  category: string
  phone: string
  email: string
  pax: number
  personalNote: string
}

export type GuestImportRawValues = Partial<Record<GuestImportField, unknown>>

export type GuestImportRow = {
  /** Nomor baris pada spreadsheet (header = baris 1). */
  line: number
  raw: GuestImportRawValues
  data: GuestImportRecord
  issues: GuestImportIssue[]
  valid: boolean
}

export type GuestImportParseResult = {
  ok: boolean
  error?: string
  rows: GuestImportRow[]
  headers: string[]
  unknownHeaders: string[]
  delimiter: string
  totalRows: number
}

/** Kolom yang dikenali + label untuk template dan tabel pratinjau. */
export const GUEST_IMPORT_COLUMNS: Array<{
  field: GuestImportField
  label: string
  required?: boolean
  aliases: string[]
}> = [
  { field: 'name', label: 'Nama', required: true, aliases: ['nama', 'nama tamu', 'name', 'tamu', 'guest'] },
  { field: 'salutation', label: 'Sapaan', aliases: ['sapaan', 'salutation', 'gelar', 'title'] },
  { field: 'category', label: 'Kategori', aliases: ['kategori', 'category', 'grup', 'golongan'] },
  {
    field: 'phone',
    label: 'WhatsApp',
    aliases: ['whatsapp', 'wa', 'telepon', 'telpon', 'phone', 'hp', 'nohp', 'nomor hp', 'nomor whatsapp'],
  },
  { field: 'email', label: 'Email', aliases: ['email', 'e-mail', 'surel'] },
  {
    field: 'pax',
    label: 'Kursi',
    aliases: ['kursi', 'pax', 'jumlah kursi', 'jumlah orang', 'jumlah tamu', 'orang', 'seats'],
  },
  { field: 'personalNote', label: 'Pesan', aliases: ['pesan', 'catatan', 'pesan pribadi', 'keterangan', 'note'] },
]

// ---------------------------------------------------------------------------
// Normalisasi teks
// ---------------------------------------------------------------------------

export function stripBom(value: string): string {
  return value.charCodeAt(0) === 0xfeff ? value.slice(1) : value
}

/** Huruf kecil, tanpa aksen, hanya alfanumerik: "No. HP" -> "nohp". */
export function normalizeHeaderKey(value: string): string {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '')
}

/** Kunci nama untuk deteksi duplikat: tanpa aksen, spasi dirapikan. */
export function normalizeGuestName(value: string): string {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const HEADER_TO_FIELD = new Map<string, GuestImportField>()
for (const column of GUEST_IMPORT_COLUMNS) {
  for (const alias of [column.field, column.label, ...column.aliases]) {
    HEADER_TO_FIELD.set(normalizeHeaderKey(alias), column.field)
  }
}

// ---------------------------------------------------------------------------
// Telepon & email
// ---------------------------------------------------------------------------

/**
 * Normalisasi nomor WhatsApp Indonesia ke format `628xxxxxxxxxx`.
 *
 * Mengembalikan `valid: false` untuk input yang tidak masuk akal (mis. angka
 * ilmiah dari Excel) supaya baris tetap diimpor dengan peringatan.
 */
export function normalizeGuestPhone(value: unknown): { value: string; valid: boolean } {
  const raw = String(value ?? '').trim()
  if (!raw) return { value: '', valid: true }

  // Excel sering mengubah nomor panjang menjadi "8,12345E+11".
  if (/[eE][+-]?\d+$/.test(raw) || raw.includes(',')) {
    return { value: '', valid: false }
  }

  let digits = raw.replace(/[^\d]/g, '')
  if (!digits) return { value: '', valid: true }

  if (digits.startsWith('00')) digits = digits.slice(2)
  if (digits.startsWith('620')) digits = `62${digits.slice(3)}`
  else if (digits.startsWith('0')) digits = `62${digits.slice(1)}`
  else if (digits.startsWith('8')) digits = `62${digits}`

  if (digits.length < 9 || digits.length > 15 || !digits.startsWith('62') || digits[2] === '0') {
    return { value: '', valid: false }
  }

  return { value: digits, valid: true }
}

export function isValidGuestEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)
}

/**
 * Kunci deteksi duplikat tamu.
 *
 * Memakai nomor WhatsApp bila ada (lebih unik), jika tidak memakai nama.
 * Kunci yang sama dipakai di browser dan server agar hasil pratinjau identik
 * dengan hasil impor.
 */
export function guestImportDedupeKey(record: { name?: string | null; phone?: string | null }): string {
  const phone = normalizeGuestPhone(record.phone).value
  if (phone) return `p:${phone}`
  return `n:${normalizeGuestName(String(record.name || ''))}`
}

// ---------------------------------------------------------------------------
// Normalisasi nilai baris
// ---------------------------------------------------------------------------

function truncate(
  value: unknown,
  max: number,
): { value: string; truncated: boolean } {
  const text = String(value ?? '').trim()
  if (text.length <= max) return { value: text, truncated: false }
  return { value: text.slice(0, max), truncated: true }
}

function readRawField(raw: GuestImportRawValues, field: GuestImportField): unknown {
  if (raw[field] !== undefined) return raw[field]

  const column = GUEST_IMPORT_COLUMNS.find((entry) => entry.field === field)
  if (!column) return undefined

  const record = raw as Record<string, unknown>
  for (const alias of column.aliases) {
    if (record[alias] !== undefined) return record[alias]
  }

  return undefined
}

export type NormalizeGuestOptions = {
  /** Dipakai bila kolom kursi kosong / tidak valid. */
  defaultPax?: number | null
}

/**
 * Validasi + normalisasi satu baris.
 *
 * `error` membuat baris dilewati, `warning` tetap diimpor setelah nilai
 * diperbaiki (mis. nomor WhatsApp dibuang, kursi di-clamp).
 */
export function normalizeGuestImportValues(
  raw: GuestImportRawValues,
  options: NormalizeGuestOptions = {},
): { data: GuestImportRecord; issues: GuestImportIssue[] } {
  const issues: GuestImportIssue[] = []

  const name = truncate(readRawField(raw, 'name'), MAX_NAME)
  if (!name.value) {
    issues.push({ level: 'error', field: 'name', message: 'Nama wajib diisi.' })
  } else if (name.truncated) {
    issues.push({ level: 'warning', field: 'name', message: `Nama dipotong menjadi ${MAX_NAME} karakter.` })
  }

  const salutation = truncate(readRawField(raw, 'salutation'), MAX_SALUTATION)
  if (salutation.truncated) {
    issues.push({ level: 'warning', field: 'salutation', message: 'Sapaan dipotong (maks. 40 karakter).' })
  }

  const category = truncate(readRawField(raw, 'category'), MAX_CATEGORY)
  if (category.truncated) {
    issues.push({ level: 'warning', field: 'category', message: 'Kategori dipotong (maks. 80 karakter).' })
  }

  const note = truncate(readRawField(raw, 'personalNote'), MAX_NOTE)
  if (note.truncated) {
    issues.push({ level: 'warning', field: 'personalNote', message: 'Pesan dipotong (maks. 1.000 karakter).' })
  }

  const rawPhone = readRawField(raw, 'phone')
  const phone = normalizeGuestPhone(rawPhone)
  if (!phone.valid) {
    issues.push({
      level: 'warning',
      field: 'phone',
      message: 'Nomor WhatsApp tidak valid, tamu diimpor tanpa nomor.',
    })
  }

  const email = truncate(readRawField(raw, 'email'), MAX_EMAIL)
  let safeEmail = ''
  if (email.value) {
    if (isValidGuestEmail(email.value)) safeEmail = email.value
    else issues.push({ level: 'warning', field: 'email', message: 'Email tidak valid, diabaikan.' })
  }

  const fallbackPax =
    typeof options.defaultPax === 'number' && Number.isFinite(options.defaultPax) && options.defaultPax >= 1
      ? Math.min(GUEST_IMPORT_PAX_MAX, Math.max(GUEST_IMPORT_PAX_MIN, Math.round(options.defaultPax)))
      : 2

  const rawPax = readRawField(raw, 'pax')
  let pax = fallbackPax
  if (rawPax !== undefined && rawPax !== null && String(rawPax).trim() !== '') {
    const parsed = Number(String(rawPax).replace(',', '.'))
    if (!Number.isFinite(parsed) || parsed <= 0) {
      issues.push({
        level: 'warning',
        field: 'pax',
        message: `Jumlah kursi tidak valid, memakai ${fallbackPax}.`,
      })
    } else {
      const rounded = Math.round(parsed)
      pax = Math.min(GUEST_IMPORT_PAX_MAX, Math.max(GUEST_IMPORT_PAX_MIN, rounded))
      if (pax !== rounded) {
        issues.push({
          level: 'warning',
          field: 'pax',
          message: `Jumlah kursi disesuaikan menjadi ${pax} (rentang 1–50).`,
        })
      }
    }
  }

  return {
    data: {
      name: name.value,
      salutation: salutation.value,
      category: category.value,
      phone: phone.value,
      email: safeEmail,
      pax,
      personalNote: note.value,
    },
    issues,
  }
}

export function guestImportRowHasError(issues: GuestImportIssue[]): boolean {
  return issues.some((issue) => issue.level === 'error')
}

// ---------------------------------------------------------------------------
// Parser CSV / tempel tabel
// ---------------------------------------------------------------------------

function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/).find((line) => line.trim()) || ''
  const candidates = [',', ';', '\t']
  let best = ','
  let bestCount = 0

  for (const candidate of candidates) {
    let count = 0
    let inQuotes = false
    for (const char of firstLine) {
      if (char === '"') inQuotes = !inQuotes
      else if (!inQuotes && char === candidate) count += 1
    }
    if (count > bestCount) {
      best = candidate
      bestCount = count
    }
  }

  return best
}

function splitDelimited(text: string, delimiter: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]

    if (inQuotes) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          cell += '"'
          index += 1
        } else {
          inQuotes = false
        }
      } else {
        cell += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === delimiter) {
      row.push(cell)
      cell = ''
    } else if (char === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else if (char !== '\r') {
      cell += char
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }

  return rows
}

export function parseGuestImport(
  input: string,
  options: NormalizeGuestOptions = {},
): GuestImportParseResult {
  const empty: GuestImportParseResult = {
    ok: false,
    rows: [],
    headers: [],
    unknownHeaders: [],
    delimiter: ',',
    totalRows: 0,
  }

  const text = stripBom(String(input || '')).trim()
  if (!text) {
    return { ...empty, error: 'Data kosong. Unggah file CSV atau tempel tabel dari spreadsheet.' }
  }

  const delimiter = detectDelimiter(text)
  const table = splitDelimited(text, delimiter)
  const headerRowIndex = table.findIndex((cells) => cells.some((cell) => cell.trim()))
  if (headerRowIndex === -1) {
    return { ...empty, error: 'Header kolom tidak ditemukan.' }
  }

  const headerCells = table[headerRowIndex].map((cell) => cell.trim())
  const fieldIndex = new Map<GuestImportField, number>()
  const unknownHeaders: string[] = []

  headerCells.forEach((cell, index) => {
    const key = normalizeHeaderKey(cell)
    if (!key) return
    const field = HEADER_TO_FIELD.get(key)
    if (field) {
      if (!fieldIndex.has(field)) fieldIndex.set(field, index)
    } else {
      unknownHeaders.push(cell)
    }
  })

  if (!fieldIndex.has('name')) {
    return {
      ...empty,
      delimiter,
      headers: headerCells,
      unknownHeaders,
      error:
        'Kolom "nama" tidak ditemukan di header. Gunakan template agar urutan kolom benar.',
    }
  }

  const dataRows = table
    .slice(headerRowIndex + 1)
    .filter((cells) => cells.some((cell) => cell.trim()))

  if (dataRows.length === 0) {
    return {
      ...empty,
      delimiter,
      headers: headerCells,
      unknownHeaders,
      error: 'Header dikenali, tetapi belum ada baris data.',
    }
  }

  if (dataRows.length > GUEST_IMPORT_MAX_ROWS) {
    return {
      ...empty,
      delimiter,
      headers: headerCells,
      unknownHeaders,
      error: `Terlalu banyak baris (${dataRows.length}). Maksimal ${GUEST_IMPORT_MAX_ROWS} tamu per impor.`,
    }
  }

  const rows: GuestImportRow[] = dataRows.map((cells, index) => {
    const raw: GuestImportRawValues = {}
    fieldIndex.forEach((columnIndex, field) => {
      raw[field] = cells[columnIndex] ?? ''
    })

    const { data, issues } = normalizeGuestImportValues(raw, options)

    if (cells.length > headerCells.length && cells.slice(headerCells.length).some((cell) => cell.trim())) {
      issues.push({
        level: 'warning',
        field: 'row',
        message: 'Ada kolom tambahan tanpa header; nilainya diabaikan.',
      })
    }

    return {
      line: headerRowIndex + index + 2,
      raw,
      data,
      issues,
      valid: !guestImportRowHasError(issues),
    }
  })

  return {
    ok: true,
    rows,
    headers: headerCells,
    unknownHeaders: [...new Set(unknownHeaders)],
    delimiter,
    totalRows: rows.length,
  }
}

// ---------------------------------------------------------------------------
// CSV keluaran
// ---------------------------------------------------------------------------

export function csvEscape(value: unknown): string {
  let text = String(value ?? '')
  // Cegah formula injection saat file dibuka di Excel/Sheets.
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

export function buildCsv(rows: unknown[][], withBom = true): string {
  const body = rows.map((row) => row.map(csvEscape).join(',')).join('\r\n')
  return `${withBom ? '\uFEFF' : ''}${body}\r\n`
}

export function guestImportTemplateCSV(): string {
  const headers = GUEST_IMPORT_COLUMNS.map((column) => column.label)
  return buildCsv([
    headers,
    ['Budi Santoso', 'Bapak', 'Teman', '08123456789', 'budi@email.com', '2', 'Mohon doa restunya'],
    ['Keluarga Santoso', 'Keluarga', 'Keluarga', '08129876543', '', '4', ''],
  ])
}

export type GuestImportExportRow = {
  nama: string
  sapaan: string
  kategori: string
  whatsapp: string
  email: string
  kursi: number | string
  link: string
  kode: string
  status: string
  catatan: string
}

export function guestImportResultCSV(rows: GuestImportExportRow[]): string {
  return buildCsv([
    ['nama', 'sapaan', 'kategori', 'whatsapp', 'email', 'kursi', 'link', 'kode', 'status', 'catatan'],
    ...rows.map((row) => [
      row.nama,
      row.sapaan,
      row.kategori,
      row.whatsapp,
      row.email,
      row.kursi,
      row.link,
      row.kode,
      row.status,
      row.catatan,
    ]),
  ])
}
