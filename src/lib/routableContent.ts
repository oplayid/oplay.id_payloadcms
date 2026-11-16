import { cache } from 'react'
import { getPayload, type Where } from 'payload'
import config from '@payload-config'
import type { Tenant } from '@/payload-types'
import { cacheQuery } from './contentCache'
import { getThemeData } from './getTheme'
import { buildCanonicalURLs, faviconFromTenant, type LayoutMode } from './pageBuilder'
import {
  ROUTABLE_COLLECTIONS,
  getRoutableConfig,
  matchRoutableSegments,
  type RoutableCollectionConfig,
} from './routableCollections'
import { resolveSiteContext, type SiteContext } from './site'
import { getTenantChrome, type SiteChrome } from './siteChrome'
import type { Locale } from './urls'

/**
 * Resolusi konten yang punya URL sendiri (artikel, dan koleksi lain yang
 * terdaftar di `lib/routableCollections`).
 *
 * Alur request: Page dicari lebih dulu (lihat `getPageForRequest`), lalu modul
 * ini menangani pola `/<prefix>/<slug>`. Halaman tetap menang agar editor bisa
 * membuat halaman statis di path yang sama bila diperlukan.
 */

type RoutableDoc = Record<string, any>

export type RoutableContentData = {
  collection: string
  config: RoutableCollectionConfig
  doc: RoutableDoc
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
  /** Path canonical konten, mis. `/artikel/judul`. */
  contentPath: string
  /** True bila request memakai prefix alias (blog/news). */
  needsCanonicalRedirect: boolean
}

async function queryPublishedEntry(
  collection: string,
  tenantID: string,
  slug: string,
  locale: Locale,
): Promise<RoutableDoc | null> {
  const cfg = getRoutableConfig(collection)
  if (!cfg) return null

  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: collection as never,
    locale,
    where: {
      and: [
        { tenant: { equals: tenantID } },
        { [cfg.slugField]: { equals: slug } },
        { _status: { equals: 'published' } },
      ],
    } as Where,
    limit: 1,
    depth: 2,
    overrideAccess: true,
  })

  return (docs[0] as RoutableDoc | undefined) || null
}

/** Versi preview: draft boleh terbaca, status diabaikan (akses dicek di route). */
async function queryDraftEntry(
  collection: string,
  tenantID: string,
  slug: string,
  locale: Locale,
): Promise<RoutableDoc | null> {
  const cfg = getRoutableConfig(collection)
  if (!cfg) return null

  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: collection as never,
    locale,
    where: {
      and: [
        { tenant: { equals: tenantID } },
        { [cfg.slugField]: { equals: slug } },
      ],
    } as Where,
    limit: 1,
    depth: 2,
    draft: true,
    overrideAccess: true,
  })

  return (docs[0] as RoutableDoc | undefined) || null
}

/** Satu cache instance per koleksi, mengikuti tag cache masing-masing. */
const cachedEntries = new Map<
  string,
  (tenantID: string, slug: string, locale: Locale) => Promise<RoutableDoc | null>
>()

for (const cfg of ROUTABLE_COLLECTIONS) {
  cachedEntries.set(
    cfg.collection,
    cacheQuery(
      { key: `routable-entry-${cfg.collection}`, tags: [cfg.cacheTag] },
      (tenantID: string, slug: string, locale: Locale) =>
        queryPublishedEntry(cfg.collection, tenantID, slug, locale),
    ),
  )
}

export type RoutableListingOptions = {
  limit?: number
  locale?: Locale
  /** Filter field `categories` (khusus koleksi yang punya field itu). */
  category?: string | null
  /** Ambil dokumen dengan ID tertentu (mode manual pada blok). */
  ids?: string[] | null
}

async function queryListing(
  collection: string,
  tenantID: string,
  options: RoutableListingOptions,
): Promise<RoutableDoc[]> {
  const cfg = getRoutableConfig(collection)
  if (!cfg) return []

  const limit = Math.min(
    Math.max(options.limit ?? 6, 1),
    cfg.maxListing,
  )

  const and: Where[] = [
    { tenant: { equals: tenantID } },
    { _status: { equals: 'published' } },
  ]

  if (options.category) {
    and.push({ categories: { contains: options.category } } as Where)
  }
  if (options.ids && options.ids.length > 0) {
    and.push({ id: { in: options.ids } } as Where)
  }

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: collection as never,
    locale: options.locale || 'id',
    where: { and } as Where,
    limit,
    depth: 2,
    sort: cfg.defaultSort,
    overrideAccess: true,
  })

  const docs = (result.docs as RoutableDoc[]) || []

  // Mode manual: pertahankan urutan pilihan editor.
  if (options.ids && options.ids.length > 0) {
    const order = new Map(options.ids.map((id, index) => [id, index]))
    docs.sort(
      (a, b) => (order.get(String(a.id)) ?? 0) - (order.get(String(b.id)) ?? 0),
    )
  }

  return docs
}

const cachedListings = new Map<
  string,
  (tenantID: string, options: RoutableListingOptions) => Promise<RoutableDoc[]>
>()

for (const cfg of ROUTABLE_COLLECTIONS) {
  cachedListings.set(
    cfg.collection,
    cacheQuery(
      { key: `routable-listing-${cfg.collection}`, tags: [cfg.cacheTag] },
      (tenantID: string, options: RoutableListingOptions) =>
        queryListing(cfg.collection, tenantID, options),
    ),
  )
}

/**
 * Daftar konten published milik satu tenant.
 *
 * Dipakai blok listing (mis. `ArticleListBlock`). Semua koleksi routable bisa
 * memakainya selama field-nya mengikuti konvensi registry.
 */
export async function getRoutableListing(
  collection: string,
  tenantID: string,
  options: RoutableListingOptions = {},
): Promise<RoutableDoc[]> {
  if (!tenantID) return []
  const cached = cachedListings.get(collection)
  if (!cached) return []
  return cached(tenantID, options)
}

/**
 * Resolusi lengkap untuk request konten (`/<prefix>/<slug>`), termasuk tema,
 * chrome tenant, dan URL canonical. Mengembalikan null bila tidak cocok.
 */
export const getRoutableForRequest = cache(
  async (
    host: string,
    segments: string[],
    isPreview: boolean,
  ): Promise<RoutableContentData | null> => {
    const site = await resolveSiteContext({ host, segments })
    if (!site) return null

    const match = matchRoutableSegments(site.pageSegments)
    if (!match) return null

    const { config: contentType, slug } = match
    const tenantID = site.tenant.id

    const entry = isPreview
      ? await queryDraftEntry(contentType.collection, tenantID, slug, site.locale)
      : await (cachedEntries.get(contentType.collection)?.(tenantID, slug, site.locale) ??
          queryPublishedEntry(contentType.collection, tenantID, slug, site.locale))

    if (!entry) return null

    const tenant = site.tenant as Tenant & {
      favicon?: string | null
      themePreset?: string | null
    }

    const theme = await getThemeData((tenant.themePreset || 'default-theme') as string)
    const chrome = await getTenantChrome(tenant.id)

    const { canonicalURL, alternateURLs } = buildCanonicalURLs({
      site,
      pagePath: match.canonicalPath,
      requestHost: host,
    })

    const rawMeta = (entry.meta || {}) as RoutableContentData['meta']
    const title = String(rawMeta.title || entry[contentType.titleField] || '')
    const description =
      rawMeta.description || entry.excerpt || entry.summary || null

    return {
      collection: contentType.collection,
      config: contentType,
      doc: entry,
      tenant,
      tenantID: tenant.id,
      site,
      theme,
      favicon: faviconFromTenant(tenant),
      title,
      meta: {
        title,
        description,
        image: rawMeta.image || entry.cover || null,
        keywords: rawMeta.keywords || null,
      },
      canonicalURL,
      alternateURLs,
      isPreview,
      basePath: site.basePath,
      locale: site.locale,
      layoutMode: 'inherit',
      chrome,
      contentPath: match.canonicalPath,
      needsCanonicalRedirect: !match.isCanonicalPrefix,
    }
  },
)
