import { normalizeHost, normalizePagePath } from './urls'

/**
 * Utilitas path redirect tanpa dependensi Payload/config.
 * Dipakai koleksi `redirects` (validasi) dan `lib/redirects` (resolusi).
 */

export function isInternalRedirectTarget(value: string): boolean {
  return value.startsWith('/')
}

/**
 * Redirect eksternal hanya diizinkan ke host yang tercantum di
 * `ALLOWED_REDIRECT_HOSTS` (comma-separated, tanpa protokol).
 * Tanpa konfigurasi, semua redirect eksternal ditolak — mencegah open redirect.
 */
export function isAllowedExternalRedirect(value: string): boolean {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return false
  }
  if (url.protocol !== 'https:') return false

  const allowedHosts = (process.env.ALLOWED_REDIRECT_HOSTS || '')
    .split(',')
    .map((host) => normalizeHost(host))
    .filter(Boolean)

  if (allowedHosts.length === 0) return false
  return allowedHosts.includes(normalizeHost(url.hostname))
}

/** Path internal dinormalisasi, URL eksternal dibiarkan bila diizinkan. */
export function normalizeRedirectTarget(value: string | null | undefined): string {
  const raw = value?.trim()
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw)) {
    return isAllowedExternalRedirect(raw) ? raw : ''
  }
  return normalizePagePath(raw)
}
