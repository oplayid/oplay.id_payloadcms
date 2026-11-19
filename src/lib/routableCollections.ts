import type { CollectionSlug } from 'payload'
import { CACHE_TAGS } from './cacheTags'

/**
 * Registry koleksi yang punya URL publik sendiri ("routable content").
 *
 * Semua koleksi yang didaftarkan di sini otomatis mendapat:
 * - resolusi detail `/<prefix>/<slug>` (lihat `lib/routableContent`)
 * - entri sitemap
 * - redirect otomatis saat slug berubah (lihat `lib/pageRedirectSync`)
 *
 * Menambah koleksi baru (mis. `projects`, `events`) cukup menambah satu entri
 * di array ini + mendaftarkan koleksinya di `payload.config.ts`
 * (collections, seoPlugin, multiTenantPlugin), lalu membuat blok listing-nya.
 */

export type RoutableCollectionConfig = {
  /** Slug koleksi Payload. */
  collection: CollectionSlug
  /** Nama manusia untuk label admin/log. */
  label: string
  /**
   * Prefix URL yang dikenali. Prefix pertama adalah canonical: dipakai untuk
   * sitemap, canonical tag, dan redirect dari alias.
   */
  prefixes: string[]
  /** Nama field slug di koleksi. */
  slugField: string
  /** Nama field judul di koleksi. */
  titleField: string
  /** Tag cache yang diinvalidasi saat koleksi berubah. */
  cacheTag: string
  /** Batas maksimum item listing dalam satu blok. */
  maxListing: number
  /** Urutan default listing (format Payload, mis. `-publishedAt`). */
  defaultSort: string
}

export const ROUTABLE_COLLECTIONS: RoutableCollectionConfig[] = [
  {
    collection: 'posts',
    label: 'Artikel',
    prefixes: ['artikel', 'blog', 'news'],
    slugField: 'slug',
    titleField: 'title',
    cacheTag: CACHE_TAGS.posts,
    maxListing: 24,
    defaultSort: '-publishedAt',
  },
  {
    collection: 'members',
    label: 'Anggota',
    prefixes: ['anggota', 'tim'],
    slugField: 'slug',
    titleField: 'name',
    cacheTag: CACHE_TAGS.members,
    maxListing: 48,
    defaultSort: 'order',
  },
]

export function getRoutableConfig(
  collection: string | undefined | null,
): RoutableCollectionConfig | null {
  if (!collection) return null
  return ROUTABLE_COLLECTIONS.find((item) => item.collection === collection) || null
}

export function getRoutableConfigByPrefix(
  prefix: string | undefined | null,
): RoutableCollectionConfig | null {
  if (!prefix) return null
  const normalized = prefix.toLowerCase()
  return (
    ROUTABLE_COLLECTIONS.find((item) => item.prefixes.includes(normalized)) || null
  )
}

/** Path canonical detail, mis. `/artikel/judul-artikel`. */
export function getRoutablePath(collection: string, slug: string): string {
  const config = getRoutableConfig(collection)
  const prefix = config?.prefixes[0] || collection
  return `/${prefix}/${slug}`.replace(/\/{2,}/g, '/')
}

/** Path halaman daftar, mis. `/artikel`. */
export function getRoutableListingPath(collection: string): string {
  const config = getRoutableConfig(collection)
  return `/${config?.prefixes[0] || collection}`
}

/** Semua prefix yang dipakai (untuk validasi slug tenant, dsb). */
export function getRoutablePrefixes(): string[] {
  return ROUTABLE_COLLECTIONS.flatMap((item) => item.prefixes)
}

export type RoutableMatch = {
  config: RoutableCollectionConfig
  /** Slug dokumen yang diminta. */
  slug: string
  /** Prefix yang dipakai request. */
  prefix: string
  /** Path canonical (selalu memakai prefix pertama). */
  canonicalPath: string
  /** False bila request memakai prefix alias (butuh redirect canonical). */
  isCanonicalPrefix: boolean
}

/**
 * Mencocokkan segmen path (relatif terhadap site) ke pola detail konten.
 *
 * Hanya pola dua segmen `<prefix>/<slug>` yang dikenali, sehingga halaman
 * daftar seperti `/artikel` tetap ditangani sebagai Page biasa.
 */
export function matchRoutableSegments(
  pageSegments: string[],
): RoutableMatch | null {
  const segments = pageSegments.filter(Boolean)
  if (segments.length !== 2) return null

  const [prefix, slug] = segments
  const config = getRoutableConfigByPrefix(prefix)
  if (!config) return null
  if (!slug || slug.includes('/')) return null

  const canonicalPrefix = config.prefixes[0]
  return {
    config,
    slug,
    prefix: prefix.toLowerCase(),
    canonicalPath: `/${canonicalPrefix}/${slug}`,
    isCanonicalPrefix: prefix.toLowerCase() === canonicalPrefix,
  }
}
