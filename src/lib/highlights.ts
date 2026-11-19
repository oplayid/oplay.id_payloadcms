import { getRoutablePath } from './routableCollections'
import { getRoutableListing } from './routableContent'
import type { Locale } from './urls'

export type HighlightCollection = 'members' | 'posts'
export type HighlightMode = 'latest' | 'category' | 'manual'

export type HighlightItem = {
  id: string
  kind: HighlightCollection
  /** Judul utama: nama anggota atau judul artikel. */
  title: string
  /** Subjudul: jabatan (anggota) atau penulis (artikel). */
  subtitle?: string | null
  /** Ringkasan singkat. */
  description?: string | null
  /** Gambar utama/foto (MediaLike). */
  image?: unknown
  /** Badge/status (anggota) atau label ringkas. */
  badge?: string | null
  /** Tanggal terbit (artikel) bila ada. */
  date?: string | null
  /** Kategori/tag. */
  categories?: string[]
  /** Slug dokumen. */
  slug?: string
  /** Path canonical, mis. `/anggota/slug` atau `/artikel/slug`. */
  path: string
  /** Dokumen asli (untuk kebutuhan render khusus blok). */
  raw: Record<string, any>
}

export type ResolveHighlightsArgs = {
  collection: HighlightCollection
  tenantID: string
  locale?: Locale
  mode?: HighlightMode
  category?: string | null
  ids?: string[] | null
  limit?: number
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}

export function normalizeMemberHighlight(doc: Record<string, any>): HighlightItem | null {
  const id = doc?.id != null ? String(doc.id) : ''
  const slug = asString(doc?.slug)
  const name = asString(doc?.name)
  if (!id || !slug || !name) return null

  return {
    id,
    kind: 'members',
    title: name,
    subtitle: asString(doc?.position) ?? null,
    description: asString(doc?.excerpt) ?? null,
    image: doc?.cover ?? null,
    badge: asString(doc?.status) ?? null,
    date: asString(doc?.publishedAt) ?? null,
    categories: asStringArray(doc?.categories),
    slug,
    path: getRoutablePath('members', slug),
    raw: doc,
  }
}

export function normalizePostHighlight(doc: Record<string, any>): HighlightItem | null {
  const id = doc?.id != null ? String(doc.id) : ''
  const slug = asString(doc?.slug)
  const title = asString(doc?.title)
  if (!id || !slug || !title) return null

  return {
    id,
    kind: 'posts',
    title,
    subtitle: asString(doc?.author) ?? null,
    description: asString(doc?.excerpt) ?? null,
    image: doc?.cover ?? null,
    badge: null,
    date: asString(doc?.publishedAt) ?? null,
    categories: asStringArray(doc?.categories),
    slug,
    path: getRoutablePath('posts', slug),
    raw: doc,
  }
}

export function normalizeHighlight(
  collection: HighlightCollection,
  doc: Record<string, any>,
): HighlightItem | null {
  return collection === 'members' ? normalizeMemberHighlight(doc) : normalizePostHighlight(doc)
}

/**
 * Ambil dan normalkan item sorotan dari koleksi routable (`posts`/`members`).
 * Menggunakan `getRoutableListing` (cache + tag + urutan manual terjaga).
 */
export async function getHighlights({
  collection,
  tenantID,
  locale = 'id',
  mode = 'latest',
  category,
  ids,
  limit,
}: ResolveHighlightsArgs): Promise<HighlightItem[]> {
  if (!tenantID) return []

  const effectiveLimit =
    mode === 'manual' && ids && ids.length > 0 ? ids.length : (limit ?? 6)

  const docs = await getRoutableListing(collection, tenantID, {
    limit: effectiveLimit,
    locale,
    category: mode === 'category' ? (category || null) : null,
    ids: mode === 'manual' ? (ids && ids.length > 0 ? ids : null) : null,
  })

  const items: HighlightItem[] = []
  for (const doc of docs as Record<string, any>[]) {
    const normalized = normalizeHighlight(collection, doc)
    if (normalized) items.push(normalized)
  }
  return items
}

/**
 * Baca konfigurasi highlight dari data blok yang memakai field bersama
 * (`dataSource`, `highlightCollection`, `highlightMode`, dst.).
 */
export function readHighlightConfig(
  data: Record<string, any> | undefined | null,
  options?: { defaultCollection?: HighlightCollection; defaultMode?: HighlightMode },
): {
  source: 'manual' | 'collection'
  collection: HighlightCollection
  mode: HighlightMode
  category?: string | null
  limit?: number
  ids?: string[] | null
} {
  const d = (data || {}) as Record<string, any>
  const source: 'manual' | 'collection' =
    d.dataSource === 'collection' ? 'collection' : 'manual'
  const collection: HighlightCollection =
    d.highlightCollection === 'posts' || d.highlightCollection === 'members'
      ? d.highlightCollection
      : (options?.defaultCollection ?? 'members')
  const mode: HighlightMode =
    d.highlightMode === 'category' || d.highlightMode === 'manual'
      ? d.highlightMode
      : (options?.defaultMode ?? 'latest')

  const relField = collection === 'posts' ? 'highlightPostItems' : 'highlightMemberItems'
  const rawIds = d[relField]
  const ids = Array.isArray(rawIds)
    ? rawIds
        .map((item: any) => (typeof item === 'string' ? item : item?.id))
        .filter((value: any): value is string => typeof value === 'string' && Boolean(value))
    : null

  return {
    source,
    collection,
    mode,
    category: typeof d.highlightCategory === 'string' ? d.highlightCategory : null,
    limit: typeof d.highlightLimit === 'number' ? d.highlightLimit : undefined,
    ids,
  }
}
