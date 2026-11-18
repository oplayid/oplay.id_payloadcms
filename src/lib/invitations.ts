import { cache } from 'react'
import { getPayload, type Where } from 'payload'
import config from '@payload-config'
import type { Tenant } from '@/payload-types'
import { buildCanonicalURLs, faviconFromTenant, type LayoutMode } from './pageBuilder'
import { getThemeData } from './getTheme'
import { resolveSiteContext, type SiteContext } from './site'
import { getTenantChrome, type SiteChrome } from './siteChrome'
import { INVITATION_PREFIX, normalizeInvitationKey } from './invitationLink'
import type {
  InvitationBlockContext,
  InvitationEventInfo,
  InvitationGuestInfo,
  InvitationRsvpStatus,
} from './invitationContext'
import { isInvitationRsvpStatus } from './invitationContext'
import type { Locale } from './urls'

/**
 * Resolusi undangan tamu: `/undangan/<slug-nama>-<kode>`.
 *
 * Tamu tidak memakai `lib/routableCollections` karena:
 * - URL-nya berbasis kode acak, bukan slug konten publik,
 * - datanya mengandung PII (nama, nomor telepon) sehingga tidak boleh
 *   masuk sitemap atau listing,
 * - halaman yang dirender berasal dari `Pages` pilihan event, bukan dari
 *   dokumen tamu itu sendiri.
 */

export type InvitationMatch = {
  /** Kunci URL yang diminta (linkSlug atau kode pendek). */
  key: string
}

export function matchInvitationSegments(pageSegments: string[]): InvitationMatch | null {
  const segments = pageSegments.filter(Boolean)
  if (segments.length !== 2) return null
  if (segments[0].toLowerCase() !== INVITATION_PREFIX) return null

  const key = normalizeInvitationKey(segments[1])
  if (!key) return null

  return { key }
}

type InvitationPageDoc = {
  id: string
  title?: string | null
  canvasBlocks?: unknown[] | null
  layoutMode?: LayoutMode | null
  themePreset?: unknown
  meta?: Record<string, unknown> | null
}

export type InvitationEventDoc = {
  id: string
  title?: string | null
  dateStart?: string | null
  dateEnd?: string | null
  timezone?: string | null
  venueName?: string | null
  address?: string | null
  mapsURL?: string | null
  hostName?: string | null
  hostContact?: string | null
  dressCode?: string | null
  openingMessage?: string | null
  cover?: unknown
  allowRsvp?: boolean | null
  rsvpDeadline?: string | null
  rundown?: InvitationEventInfo['rundown']
  gifts?: InvitationEventInfo['gifts']
  giftAddress?: string | null
  gallery?: InvitationEventInfo['gallery']
  invitationPage?: InvitationPageDoc | string | null
  _status?: string | null
}

export type InvitationGuestDoc = {
  id: string
  name?: string | null
  salutation?: string | null
  category?: string | null
  pax?: number | null
  personalNote?: string | null
  linkSlug?: string | null
  invitationCode?: string | null
  disabled?: boolean | null
  rsvpStatus?: string | null
  rsvpPax?: number | null
  rsvpMessage?: string | null
  rsvpAt?: string | null
  viewCount?: number | null
  event?: InvitationEventDoc | string | null
}

export type InvitationRecord = {
  guestDoc: InvitationGuestDoc
  eventDoc: InvitationEventDoc
  pageDoc: InvitationPageDoc | null
  tenant: Tenant
  tenantID: string
  site: SiteContext
}

function toRsvpStatus(value: unknown): InvitationRsvpStatus {
  return isInvitationRsvpStatus(value) ? value : 'pending'
}

export function toGuestInfo(doc: InvitationGuestDoc): InvitationGuestInfo {
  return {
    name: String(doc.name || ''),
    salutation: doc.salutation || null,
    category: doc.category || null,
    pax: Math.max(1, Number(doc.pax || 1)),
    personalNote: doc.personalNote || null,
    rsvpStatus: toRsvpStatus(doc.rsvpStatus),
    rsvpPax: typeof doc.rsvpPax === 'number' ? doc.rsvpPax : null,
    rsvpMessage: doc.rsvpMessage || null,
  }
}

export function toEventInfo(doc: InvitationEventDoc): InvitationEventInfo {
  return {
    id: doc.id,
    title: String(doc.title || ''),
    dateStart: doc.dateStart || null,
    dateEnd: doc.dateEnd || null,
    timezone: doc.timezone || 'Asia/Jakarta',
    venueName: doc.venueName || null,
    address: doc.address || null,
    mapsURL: doc.mapsURL || null,
    hostName: doc.hostName || null,
    hostContact: doc.hostContact || null,
    dressCode: doc.dressCode || null,
    openingMessage: doc.openingMessage || null,
    cover: doc.cover || null,
    allowRsvp: doc.allowRsvp !== false,
    rsvpDeadline: doc.rsvpDeadline || null,
    rundown: Array.isArray(doc.rundown) ? doc.rundown : [],
    gifts: Array.isArray(doc.gifts) ? doc.gifts : [],
    giftAddress: doc.giftAddress || null,
    gallery: Array.isArray(doc.gallery) ? doc.gallery : [],
  }
}

function pickTenantThemePreset(tenant: Tenant): string {
  const raw = (tenant as Tenant & { themePreset?: unknown }).themePreset
  if (typeof raw === 'string' && raw.trim()) return raw
  if (raw && typeof raw === 'object') {
    const record = raw as { id?: string; slug?: string }
    if (typeof record.id === 'string' && record.id) return record.id
    if (typeof record.slug === 'string' && record.slug) return record.slug
  }
  return 'default-theme'
}

function pickPageThemePreset(page: InvitationPageDoc | null): string | null {
  if (!page) return null
  const raw = page.themePreset
  if (typeof raw === 'string' && raw.trim()) return raw
  if (raw && typeof raw === 'object' && typeof (raw as { id?: string }).id === 'string') {
    return (raw as { id: string }).id
  }
  return null
}

async function queryGuest(
  tenantID: string,
  key: string,
): Promise<InvitationGuestDoc | null> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'guests',
    where: {
      and: [
        { tenant: { equals: tenantID } },
        { or: [{ linkSlug: { equals: key } }, { invitationCode: { equals: key } }] },
      ],
    } as Where,
    limit: 1,
    depth: 1,
    overrideAccess: true,
  })

  return (docs[0] as InvitationGuestDoc | undefined) || null
}

async function queryEvent(
  eventRef: InvitationEventDoc | string | null | undefined,
): Promise<InvitationEventDoc | null> {
  const id = typeof eventRef === 'object' ? eventRef?.id : eventRef
  if (!id) return null

  const payload = await getPayload({ config })
  try {
    // Selambatnya ambil ulang agar `cover` ikut ter-populate (guest di-query
    // depth 1 membuat relasi event hanya berisi id).
    return (await payload.findByID({
      collection: 'events',
      id,
      depth: 1,
      overrideAccess: true,
    })) as InvitationEventDoc
  } catch {
    return null
  }
}

async function queryInvitationPage(
  pageRef: InvitationPageDoc | string | null | undefined,
  locale: Locale,
  isPreview: boolean,
): Promise<InvitationPageDoc | null> {
  const id = typeof pageRef === 'object' ? pageRef?.id : pageRef
  if (!id) return null

  const payload = await getPayload({ config })
  try {
    return (await payload.findByID({
      collection: 'pages',
      id,
      locale,
      depth: 2,
      draft: isPreview,
      overrideAccess: true,
    })) as InvitationPageDoc
  } catch {
    return null
  }
}

/**
 * Cari tamu dari host + kunci URL tanpa memuat acara/halaman.
 * Dipakai endpoint statistik kunjungan dan RSVP agar tidak query berlebihan.
 */
export async function findInvitationGuest({
  host,
  segments = [],
  key,
}: {
  host: string | null | undefined
  segments?: string[]
  key: string | null | undefined
}): Promise<{ site: SiteContext; guestDoc: InvitationGuestDoc } | null> {
  const site = await resolveSiteContext({ host, segments })
  if (!site) return null

  const lookupKey = normalizeInvitationKey(key)
  if (!lookupKey) return null

  const guestDoc = await queryGuest(site.tenant.id, lookupKey)
  if (!guestDoc) return null

  return { site, guestDoc }
}

/**
 * Ambil tamu + acara + halaman desain untuk satu kunci URL.
 *
 * Sengaja tidak di-cache lintas request: status RSVP harus selalu segar.
 * Query-nya satu dokumen terindeks, jadi tetap murah.
 */
export async function loadInvitation({
  host,
  segments,
  key,
  isPreview = false,
}: {
  host: string | null | undefined
  segments: string[]
  key?: string | null
  isPreview?: boolean
}): Promise<InvitationRecord | null> {
  const site = await resolveSiteContext({ host, segments, allowHiddenSubpath: isPreview })
  if (!site) return null

  const match = matchInvitationSegments(site.pageSegments)
  const lookupKey = normalizeInvitationKey(key || match?.key)
  if (!lookupKey) return null

  const guestDoc = await queryGuest(site.tenant.id, lookupKey)
  if (!guestDoc) return null
  if (guestDoc.disabled && !isPreview) return null

  const eventDoc = await queryEvent(guestDoc.event)
  if (!eventDoc) return null
  if (!isPreview && eventDoc._status && eventDoc._status !== 'published') return null

  const pageDoc = await queryInvitationPage(eventDoc.invitationPage, site.locale, isPreview)

  return {
    guestDoc,
    eventDoc,
    pageDoc,
    tenant: site.tenant as Tenant,
    tenantID: site.tenant.id,
    site,
  }
}

export type InvitationContentData = {
  guest: InvitationGuestInfo
  event: InvitationEventInfo
  /** Konteks yang diteruskan ke setiap blok undangan. */
  context: InvitationBlockContext
  guestID: string
  eventID: string
  tenant: Tenant
  tenantID: string
  site: SiteContext
  theme: Record<string, any>
  favicon: string
  title: string
  meta: {
    title?: string | null
    description?: string | null
    image?: unknown
    keywords?: string | null
  }
  canonicalURL: string
  alternateURLs: Record<string, string>
  isPreview: boolean
  basePath: string
  locale: Locale
  layoutMode: LayoutMode
  chrome: SiteChrome
  contentPath: string
  /** True bila request memakai kode pendek; arahkan ke linkSlug canonical. */
  needsCanonicalRedirect: boolean
  /** Blok dari halaman desain event (Pages). */
  canvasBlocks: any[]
}

async function buildInvitationData(
  record: InvitationRecord,
  { host, requestedKey, isPreview }: { host: string; requestedKey: string; isPreview: boolean },
): Promise<InvitationContentData> {
  const { guestDoc, eventDoc, pageDoc, tenant, site } = record

  const guest = toGuestInfo(guestDoc)
  const event = toEventInfo(eventDoc)

  const themePreset = pickPageThemePreset(pageDoc) || pickTenantThemePreset(tenant)
  const theme = await getThemeData(themePreset)
  const chrome = await getTenantChrome(tenant.id)

  const canonicalSlug = guestDoc.linkSlug || requestedKey
  const contentPath = `/${INVITATION_PREFIX}/${canonicalSlug}`
  const needsCanonicalRedirect = Boolean(guestDoc.linkSlug && requestedKey !== guestDoc.linkSlug)

  const { canonicalURL, alternateURLs } = buildCanonicalURLs({
    site,
    pagePath: contentPath,
    requestHost: host,
  })

  const eventTitle = event.title || 'Undangan'
  const meta = (pageDoc?.meta || {}) as {
    title?: string | null
    description?: string | null
    image?: unknown
    keywords?: string | null
  }

  const title = meta.title || `Undangan ${eventTitle}`
  const description =
    meta.description ||
    (event.venueName
      ? `${eventTitle} di ${event.venueName}. Undangan untuk ${guest.name}.`
      : `Undangan ${eventTitle} untuk ${guest.name}.`)

  const context: InvitationBlockContext = {
    key: canonicalSlug,
    guest,
    event,
    basePath: site.basePath,
    locale: site.locale,
  }

  return {
    guest,
    event,
    context,
    guestID: guestDoc.id,
    eventID: eventDoc.id,
    tenant,
    tenantID: tenant.id,
    site,
    theme,
    favicon: faviconFromTenant(tenant),
    title,
    meta: {
      title: `${title} — ${guest.name}`,
      description,
      image: meta.image || event.cover || null,
      keywords: meta.keywords || null,
    },
    canonicalURL,
    alternateURLs,
    isPreview,
    basePath: site.basePath,
    locale: site.locale,
    layoutMode: pageDoc?.layoutMode || 'canvas',
    chrome,
    contentPath,
    needsCanonicalRedirect,
    canvasBlocks: Array.isArray(pageDoc?.canvasBlocks) ? (pageDoc?.canvasBlocks as any[]) : [],
  }
}

/**
 * Resolusi untuk route halaman (`[[...segments]]`).
 *
 * Di-cache per request (React `cache`) agar `generateMetadata` dan render
 * tidak melakukan query dua kali.
 */
export const getInvitationForRequest = cache(
  async (
    host: string,
    segments: string[],
    isPreview: boolean,
  ): Promise<InvitationContentData | null> => {
    const site = await resolveSiteContext({ host, segments, allowHiddenSubpath: isPreview })
    if (!site) return null

    const match = matchInvitationSegments(site.pageSegments)
    if (!match) return null

    const record = await loadInvitation({
      host,
      segments,
      key: match.key,
      isPreview,
    })
    if (!record) return null

    return buildInvitationData(record, {
      host,
      requestedKey: match.key,
      isPreview,
    })
  },
)
