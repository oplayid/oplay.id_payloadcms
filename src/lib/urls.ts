/**
 * URL helpers shared by server and client components.
 *
 * Aturan URL platform:
 * - Bahasa default (`id`) tidak memakai prefix: `/`, `/profil`
 * - Bahasa lain memakai prefix: `/en`, `/en/profil`
 * - Tenant individu/korporasi diakses lewat subpath: `/faishal`, `/faishal/profil`
 * - Custom domain milik tenant tidak memakai subpath: `https://ylbhsikap.or.id/profil`
 */

export const LOCALES = ['id', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'id'

export function isLocale(value: string | undefined | null): value is Locale {
  return value === 'id' || value === 'en'
}

export function normalizeHost(host: string | undefined | null): string {
  if (!host) return ''

  return host
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    .split(',')[0]
    .replace(/:\d+$/, '')
    .replace(/\.$/, '')
    .replace(/^www\./, '')
}

export function getServerURL(): string {
  /**
   * `SERVER_URL` adalah variabel SERVER-ONLY yang dibaca saat runtime dan
   * didahulukan. `NEXT_PUBLIC_SERVER_URL` di-inline saat build, sehingga bila
   * image di-build tanpa build-arg nilai baking-nya menjadi localhost. Dengan
   * adanya fallback runtime ini, image yang sama bisa dipakai di host mana pun
   * cukup dengan mengatur `.env` di Coolify.
   *
   * Di bundle client `SERVER_URL` tidak tersedia (undefined) dan fungsi ini
   * otomatis memakai `NEXT_PUBLIC_SERVER_URL` seperti sebelumnya.
   */
  const raw =
    process.env.SERVER_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  return raw.replace(/\/+$/, '')
}

export function getPlatformHost(): string {
  const explicit = process.env.PLATFORM_DOMAIN
  if (explicit) return normalizeHost(explicit)
  return normalizeHost(getServerURL()) || 'localhost'
}

/**
 * Semua host yang dianggap milik platform.
 *
 * `PLATFORM_DOMAIN` (mis. oplay.id) dipakai di produksi, sementara host dari
 * `NEXT_PUBLIC_SERVER_URL` (mis. localhost) tetap dianggap platform agar
 * pengembangan lokal tidak perlu mengubah DNS.
 */
export function getPlatformHosts(): string[] {
  const hosts = new Set<string>()
  const explicit = normalizeHost(process.env.PLATFORM_DOMAIN)
  const server = normalizeHost(getServerURL())

  if (explicit) hosts.add(explicit)
  if (server) hosts.add(server)

  if (hosts.has('localhost')) {
    hosts.add('127.0.0.1')
    hosts.add('::1')
  }

  if (hosts.size === 0) hosts.add('localhost')
  return [...hosts]
}

export function getProtocolForHost(host: string): 'http' | 'https' {
  const normalized = normalizeHost(host)
  if (normalized === 'localhost' || normalized === '127.0.0.1' || normalized === '::1') {
    return 'http'
  }
  return 'https'
}

/**
 * Origin untuk request aktif. Berbeda dengan `normalizeHost`, port dipertahankan
 * ketika berjalan di localhost agar link absolut tetap bisa dibuka saat dev.
 */
export function getOriginFromHost(hostHeader: string | undefined | null): string {
  const raw = (hostHeader || '').split(',')[0].trim()
  if (!raw) return getServerURL()

  const withoutProtocol = raw.replace(/^https?:\/\//, '').split('/')[0]
  const [hostPart, port] = withoutProtocol.split(':')
  const host = normalizeHost(hostPart)
  if (!host) return getServerURL()

  const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '::1'
  return `${getProtocolForHost(host)}://${host}${isLocal && port ? `:${port}` : ''}`
}

export function isPlatformHost(host: string): boolean {
  const normalized = normalizeHost(host)
  return Boolean(normalized) && getPlatformHosts().includes(normalized)
}

export function isPlatformSubdomain(host: string): boolean {
  const normalized = normalizeHost(host)
  return getPlatformHosts().some(
    (platformHost) =>
      normalized !== platformHost && normalized.endsWith(`.${platformHost}`),
  )
}

/** Menggabungkan path tanpa menghasilkan double slash. */
export function joinPath(...parts: Array<string | undefined | null>): string {
  const joined = parts
    .filter((part): part is string => Boolean(part && part.trim()))
    .map((part) => part.trim())
    .join('/')
    .replace(/\/{2,}/g, '/')

  return joined.startsWith('/') ? joined : `/${joined}`
}

/** Path halaman relatif terhadap root site. Home selalu `/`. */
export function normalizePagePath(path: string | undefined | null): string {
  if (!path) return '/'
  const clean = `/${path.split('?')[0].split('#')[0]}`.replace(/\/{2,}/g, '/').replace(/\/$/, '')
  return clean || '/'
}

/**
 * Membuat href final untuk sebuah site.
 *
 * Fungsi ini idempoten: input yang sudah memiliki prefix locale/basePath akan
 * dinormalisasi ulang, sehingga aman dipanggil berlapis (server + client).
 */
export function siteHref(
  href: string | undefined | null,
  basePath: string = '',
  locale: Locale = DEFAULT_LOCALE,
): string {
  if (!href) return localizePath('/', basePath, locale)
  if (href.startsWith('#')) return href
  if (
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('//')
  ) {
    return href
  }

  const [rawPath, hash] = href.split('#')
  const [pathWithoutQuery, query] = rawPath.split('?')
  let path = pathWithoutQuery || '/'
  if (!path.startsWith('/')) path = `/${path}`

  // Buang prefix locale lama agar bisa diganti dengan locale aktif.
  const localeMatch = path.match(/^\/(id|en)(?=\/|$)/)
  if (localeMatch) {
    path = path.slice(localeMatch[0].length) || '/'
  }

  // Buang basePath lama (mis. halaman yang sudah tersimpan sebagai /faishal/about).
  if (basePath && (path === basePath || path.startsWith(`${basePath}/`))) {
    path = path.slice(basePath.length) || '/'
  }

  const result = localizePath(path, basePath, locale)
  const suffix = `${query ? `?${query}` : ''}${hash ? `#${hash}` : ''}`
  return `${result}${suffix}`
}

export function localizePath(
  path: string,
  basePath: string = '',
  locale: Locale = DEFAULT_LOCALE,
): string {
  const cleanBase = basePath && basePath !== '/' ? `/${basePath.replace(/^\/|\/$/g, '')}` : ''
  const pagePath = normalizePagePath(path)
  const relative = pagePath === '/' ? '' : pagePath
  const withBase = `${cleanBase}${relative}` || '/'

  if (locale === DEFAULT_LOCALE) return withBase
  return withBase === '/' ? `/${locale}` : `/${locale}${withBase}`
}

export function absoluteURL(
  host: string,
  path: string,
  protocol: string = 'https',
): string {
  const cleanHost = normalizeHost(host)
  const cleanProtocol = protocol || 'https'
  return `${cleanProtocol}://${cleanHost}${normalizePagePath(path)}`.replace(/\/$/, '')
}
