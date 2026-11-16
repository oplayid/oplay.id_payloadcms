import { normalizePagePath } from './urls'

/**
 * Utilitas path redirect tanpa dependensi Payload/config.
 * Dipakai koleksi `redirects` (validasi) dan `lib/redirects` (resolusi).
 */

export function isInternalRedirectTarget(value: string): boolean {
  return value.startsWith('/')
}

/** Path internal dinormalisasi, URL eksternal dibiarkan apa adanya. */
export function normalizeRedirectTarget(value: string | null | undefined): string {
  const raw = value?.trim()
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw)) return raw
  return normalizePagePath(raw)
}
