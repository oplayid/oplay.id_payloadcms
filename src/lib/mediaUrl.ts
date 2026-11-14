/**
 * Helper untuk membaca nilai field media yang bisa berupa:
 * - string URL lama (data sebelum migrasi ke upload/relation)
 * - dokumen media Payload yang sudah di-populate (depth >= 1)
 * - undefined/null
 */
export type MediaSize = {
  url?: string | null
  width?: number | null
  height?: number | null
}

export type MediaLike =
  | string
  | {
      url?: string | null
      alt?: string | null
      filename?: string | null
      sizes?: Record<string, MediaSize | undefined> | null
    }
  | null
  | undefined

export function mediaUrl(value: MediaLike, size?: string): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (size && value.sizes?.[size]?.url) return value.sizes[size]!.url as string
  return value.url || ''
}

/**
 * Membuat atribut `srcSet` dari turunan gambar yang tersedia di dokumen Media.
 * Mengembalikan undefined jika nilai masih berupa string lama atau tidak punya sizes,
 * sehingga komponen akan jatuh kembali ke `src` biasa.
 */
export function mediaSrcSet(
  value: MediaLike,
  sizeNames: string[] = ['thumbnail', 'card', 'hero'],
): string | undefined {
  if (!value || typeof value === 'string') return undefined

  const entries: string[] = []
  for (const name of sizeNames) {
    const size = value.sizes?.[name]
    if (!size?.url || !size.width) continue
    entries.push(`${size.url} ${size.width}w`)
  }

  return entries.length > 0 ? entries.join(', ') : undefined
}

export function mediaAlt(value: MediaLike, fallback = ''): string {
  if (!value || typeof value === 'string') return fallback
  return value.alt || fallback
}
