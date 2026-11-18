import { APIError, type PayloadRequest, type Where } from 'payload'
import type { User } from '@/payload-types'
import { userHasTenantAccess } from '@/access'
import { CACHE_TAGS, invalidateContent } from '@/lib/contentCache'
import {
  GUEST_IMPORT_IMPORT_BATCH,
  GUEST_IMPORT_PREVIEW_BATCH,
  guestImportDedupeKey,
  guestImportRowHasError,
  normalizeGuestImportValues,
  normalizeGuestName,
  normalizeGuestPhone,
  type GuestImportIssue,
  type GuestImportRawValues,
  type GuestImportRecord,
} from '@/lib/guestImport'
import {
  buildInvitationLinkSlug,
  generateInvitationCode,
  INVITATION_CODE_LENGTH,
} from '@/lib/invitationLink'

/**
 * Impor tamu undangan dari spreadsheet (CSV / tempel tabel).
 *
 * Endpoint ini menerima baris yang sudah dinormalisasi di browser, tetapi
 * memvalidasi ulang semuanya di server. Tenant selalu diambil dari acara yang
 * dipilih, tidak pernah dari file, agar admin satu tenant tidak bisa menulis
 * ke tenant lain.
 *
 * Dipanggil per batch kecil (50 baris) agar form tetap responsif dan tidak
 * terkena timeout saat mengimpor ribuan tamu.
 */

type ImportMode = 'skip' | 'update'

type ImportRowInput = Record<string, unknown> & { line?: unknown }

type ImportRequestBody = {
  eventID?: unknown
  mode?: unknown
  dryRun?: unknown
  rows?: unknown
}

type ExistingGuest = {
  id: string
  name?: string | null
  phone?: string | null
  linkSlug?: string | null
  invitationCode?: string | null
}

type RowResult = {
  line: number
  status: 'created' | 'updated' | 'skipped' | 'failed' | 'new' | 'duplicate'
  id?: string
  name?: string
  linkSlug?: string
  invitationCode?: string
  error?: string
}

type ImportItem = {
  line: number
  data: GuestImportRecord
  issues: GuestImportIssue[]
  valid: boolean
  key: string
  existing?: ExistingGuest
  duplicateInFile?: boolean
  status?: RowResult['status']
  error?: string
  code?: string
  slug?: string
}

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_WRITES = 30
const writeBuckets = new Map<string, number[]>()

function allowImportWrite(user: User): boolean {
  const key = `${user.collection || 'users'}:${user.id}`
  const now = Date.now()
  const recent = (writeBuckets.get(key) || []).filter((time) => now - time < RATE_LIMIT_WINDOW_MS)

  if (recent.length >= RATE_LIMIT_MAX_WRITES) {
    writeBuckets.set(key, recent)
    return false
  }

  recent.push(now)
  writeBuckets.set(key, recent)

  if (writeBuckets.size > 500) {
    for (const [bucketKey, times] of writeBuckets) {
      if (!times.some((time) => now - time < RATE_LIMIT_WINDOW_MS)) {
        writeBuckets.delete(bucketKey)
      }
    }
  }

  return true
}

function relationID(value: unknown): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object' && 'id' in (value as Record<string, unknown>)) {
    const id = (value as { id?: unknown }).id
    return typeof id === 'string' ? id : ''
  }
  return ''
}

function rowLine(row: ImportRowInput, index: number): number {
  const value = Number(row.line)
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : index + 2
}

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message
  return 'Gagal menyimpan tamu.'
}

export async function guestImportEndpoint(req: PayloadRequest): Promise<Response> {
  if (!req.user) {
    throw new APIError('Anda harus login untuk mengimpor tamu.', 401)
  }

  const parsedBody = typeof req.json === 'function' ? await req.json().catch(() => null) : null
  const body = parsedBody as ImportRequestBody | null
  if (!body || typeof body !== 'object') {
    throw new APIError('Body permintaan tidak valid.', 400)
  }

  const eventID = typeof body.eventID === 'string' ? body.eventID.trim() : ''
  if (!eventID) {
    throw new APIError('Pilih acara terlebih dahulu.', 400)
  }

  const mode: ImportMode = body.mode === 'update' ? 'update' : 'skip'
  const dryRun = body.dryRun === true
  const rawRows = Array.isArray(body.rows) ? (body.rows as ImportRowInput[]) : []

  if (rawRows.length === 0) {
    throw new APIError('Tidak ada baris untuk diproses.', 400)
  }

  const maxRows = dryRun ? GUEST_IMPORT_PREVIEW_BATCH : GUEST_IMPORT_IMPORT_BATCH
  if (rawRows.length > maxRows) {
    throw new APIError(`Maksimal ${maxRows} baris per permintaan.`, 400)
  }

  const event = await req.payload
    .findByID({ collection: 'events', id: eventID, depth: 0, overrideAccess: true, req })
    .catch(() => null)

  if (!event) {
    throw new APIError('Acara tidak ditemukan.', 404)
  }

  const tenantID = relationID((event as { tenant?: unknown }).tenant)
  if (!tenantID) {
    throw new APIError('Acara belum memiliki tenant.', 400)
  }

  if (!userHasTenantAccess(req.user as unknown as User, tenantID)) {
    throw new APIError('Anda tidak punya akses ke acara ini.', 403)
  }

  if (!dryRun && !allowImportWrite(req.user as unknown as User)) {
    throw new APIError('Terlalu banyak permintaan impor. Tunggu satu menit lalu coba lagi.', 429)
  }

  const defaultPax = (event as { defaultPax?: number | null }).defaultPax

  const items: ImportItem[] = rawRows.map((row, index) => {
    const input = row && typeof row === 'object' ? row : {}
    const { data, issues } = normalizeGuestImportValues(input as GuestImportRawValues, {
      defaultPax,
    })
    const valid = !guestImportRowHasError(issues)

    return {
      line: rowLine(input, index),
      data,
      issues,
      valid,
      key: guestImportDedupeKey(data),
      error: issues.find((issue) => issue.level === 'error')?.message,
    }
  })

  const validItems = items.filter((item) => item.valid)
  const phones = [...new Set(validItems.map((item) => item.data.phone).filter(Boolean))]
  const names = [...new Set(validItems.map((item) => item.data.name).filter(Boolean))]

  const orClauses: Where[] = []
  if (phones.length > 0) orClauses.push({ phone: { in: phones } })
  if (names.length > 0) orClauses.push({ name: { in: names } })

  let existingDocs: ExistingGuest[] = []
  if (orClauses.length > 0) {
    const found = await req.payload.find({
      collection: 'guests',
      where: {
        and: [{ event: { equals: eventID } }, { or: orClauses }],
      },
      depth: 0,
      limit: 1000,
      pagination: false,
      overrideAccess: true,
      req,
    })
    existingDocs = found.docs as unknown as ExistingGuest[]
  }

  // Indeks ganda: nomor WhatsApp lebih kuat, nama dipakai sebagai cadangan
  // ketika spreadsheet tidak memuat nomor. Tanpa dua indeks ini, tamu lama
  // yang punya nomor tidak akan cocok dengan baris tanpa nomor.
  const existingByPhone = new Map<string, ExistingGuest>()
  const existingByName = new Map<string, ExistingGuest>()
  for (const doc of existingDocs) {
    const phone = normalizeGuestPhone(doc.phone).value
    if (phone && !existingByPhone.has(phone)) existingByPhone.set(phone, doc)
    const name = normalizeGuestName(doc.name || '')
    if (name && !existingByName.has(name)) existingByName.set(name, doc)
  }

  // Duplikat di dalam file: hanya baris pertama yang diproses.
  const seenPhones = new Set<string>()
  const seenNames = new Set<string>()
  for (const item of items) {
    if (!item.valid) continue

    const phone = item.data.phone
    const name = normalizeGuestName(item.data.name)
    const duplicateInFile = phone ? seenPhones.has(phone) : seenNames.has(name)

    if (duplicateInFile) {
      item.duplicateInFile = true
      continue
    }

    if (phone) seenPhones.add(phone)
    if (name) seenNames.add(name)

    item.existing = phone ? existingByPhone.get(phone) : existingByName.get(name)
  }

  if (dryRun) {
    const results: RowResult[] = items.map((item) => {
      if (!item.valid) {
        return { line: item.line, status: 'failed', error: item.error }
      }
      if (item.duplicateInFile) {
        return {
          line: item.line,
          status: 'duplicate',
          name: item.data.name,
          id: item.existing?.id,
          error: 'Nomor/nama sama dengan baris lain di file ini.',
        }
      }
      if (item.existing) {
        return {
          line: item.line,
          status: 'duplicate',
          id: item.existing.id,
          name: item.existing.name || item.data.name,
          linkSlug: item.existing.linkSlug || undefined,
          invitationCode: item.existing.invitationCode || undefined,
        }
      }
      return { line: item.line, status: 'new', name: item.data.name }
    })

    return Response.json({ ok: true, dryRun: true, results, summary: summarize(results) })
  }

  const createItems = items.filter((item) => item.valid && !item.duplicateInFile && !item.existing)
  await assignInvitationCodes(createItems, tenantID, req)

  const results: RowResult[] = []

  for (const item of items) {
    if (!item.valid) {
      results.push({ line: item.line, status: 'failed', error: item.error })
      continue
    }

    if (item.duplicateInFile) {
      results.push({
        line: item.line,
        status: 'skipped',
        name: item.data.name,
        linkSlug: item.existing?.linkSlug || undefined,
        invitationCode: item.existing?.invitationCode || undefined,
        error: 'Duplikat di dalam file, baris ini dilewati.',
      })
      continue
    }

    if (item.existing) {
      if (mode === 'skip') {
        results.push({
          line: item.line,
          status: 'skipped',
          id: item.existing.id,
          name: item.existing.name || item.data.name,
          linkSlug: item.existing.linkSlug || undefined,
          invitationCode: item.existing.invitationCode || undefined,
          error: 'Tamu sudah ada, dilewati.',
        })
        continue
      }

      try {
        const updated = await req.payload.update({
          collection: 'guests',
          id: item.existing.id,
          data: {
            name: item.data.name,
            salutation: item.data.salutation || null,
            category: item.data.category || null,
            phone: item.data.phone || null,
            email: item.data.email || null,
            pax: item.data.pax,
            personalNote: item.data.personalNote || null,
          },
          depth: 0,
          overrideAccess: false,
          context: { fromGuestImport: true },
          req,
        })

        results.push({
          line: item.line,
          status: 'updated',
          id: String(updated.id),
          name: item.data.name,
          linkSlug: item.existing.linkSlug || undefined,
          invitationCode: item.existing.invitationCode || undefined,
        })
      } catch (error) {
        results.push({ line: item.line, status: 'failed', name: item.data.name, error: errorMessage(error) })
      }
      continue
    }

    try {
      const created = await req.payload.create({
        collection: 'guests',
        data: {
          name: item.data.name,
          salutation: item.data.salutation || null,
          category: item.data.category || null,
          phone: item.data.phone || null,
          email: item.data.email || null,
          pax: item.data.pax,
          personalNote: item.data.personalNote || null,
          event: eventID,
          tenant: tenantID,
          linkSlug: item.slug,
          invitationCode: item.code,
        },
        depth: 0,
        overrideAccess: false,
        context: { fromGuestImport: true },
        req,
      })

      results.push({
        line: item.line,
        status: 'created',
        id: String(created.id),
        name: item.data.name,
        linkSlug: item.slug,
        invitationCode: item.code,
      })
    } catch (error) {
      results.push({ line: item.line, status: 'failed', name: item.data.name, error: errorMessage(error) })
    }
  }

  if (results.some((result) => result.status === 'created' || result.status === 'updated')) {
    await invalidateContent([CACHE_TAGS.invitations])
  }

  return Response.json({ ok: true, dryRun: false, results, summary: summarize(results) })
}

function summarize(results: RowResult[]) {
  return {
    total: results.length,
    created: results.filter((result) => result.status === 'created').length,
    updated: results.filter((result) => result.status === 'updated').length,
    skipped: results.filter((result) => result.status === 'skipped').length,
    failed: results.filter((result) => result.status === 'failed').length,
    new: results.filter((result) => result.status === 'new').length,
    duplicate: results.filter((result) => result.status === 'duplicate').length,
  }
}

/**
 * Siapkan `linkSlug` + `invitationCode` sekaligus untuk satu batch.
 *
 * Pengecekan tabrakan dilakukan sekali per batch (bukan per baris) supaya
 * impor 1.000 tamu tidak menjadi 2.000 query. Hook `beforeValidate` koleksi
 * menerima nilai siap pakai ini hanya saat `context.fromGuestImport` aktif.
 */
async function assignInvitationCodes(
  items: ImportItem[],
  tenantID: string,
  req: PayloadRequest,
): Promise<void> {
  if (items.length === 0) return

  const usedCodes = new Set<string>()
  const usedSlugs = new Set<string>()

  const assign = (item: ImportItem) => {
    let code = ''
    let slug = ''

    for (let attempt = 0; attempt < 12; attempt += 1) {
      code = generateInvitationCode(INVITATION_CODE_LENGTH)
      slug = buildInvitationLinkSlug(item.data.name, code)
      if (!usedCodes.has(code) && !usedSlugs.has(slug)) break
    }

    usedCodes.add(code)
    usedSlugs.add(slug)
    item.code = code
    item.slug = slug
  }

  items.forEach(assign)

  for (let round = 0; round < 3; round += 1) {
    const codes = items.map((item) => item.code).filter(Boolean) as string[]
    const slugs = items.map((item) => item.slug).filter(Boolean) as string[]
    if (codes.length === 0) return

    const clash = await req.payload.find({
      collection: 'guests',
      where: {
        and: [
          { tenant: { equals: tenantID } },
          {
            or: [{ invitationCode: { in: codes } }, { linkSlug: { in: slugs } }],
          },
        ],
      },
      depth: 0,
      limit: 1000,
      pagination: false,
      overrideAccess: true,
      req,
    })

    if (clash.docs.length === 0) return

    const clashCodes = new Set(
      clash.docs.map((doc) => String((doc as { invitationCode?: string | null }).invitationCode || '')),
    )
    const clashSlugs = new Set(
      clash.docs.map((doc) => String((doc as { linkSlug?: string | null }).linkSlug || '')),
    )

    for (const item of items) {
      if ((item.code && clashCodes.has(item.code)) || (item.slug && clashSlugs.has(item.slug))) {
        usedCodes.delete(item.code || '')
        usedSlugs.delete(item.slug || '')
        assign(item)
      }
    }
  }
}

export default guestImportEndpoint
