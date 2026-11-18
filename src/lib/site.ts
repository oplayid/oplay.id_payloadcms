import { getPayload, type Where } from 'payload'
import config from '@payload-config'
import type { Tenant } from '@/payload-types'
import { CACHE_TAGS, cacheQuery } from './contentCache'
import {
  DEFAULT_LOCALE,
  LOCALES,
  getPlatformHost,
  getPlatformHosts,
  getProtocolForHost,
  getServerURL,
  isLocale,
  isPlatformHost,
  joinPath,
  localizePath,
  normalizeHost,
  normalizePagePath,
  type Locale,
} from './urls'

/**
 * Slug yang tidak boleh dipakai sebagai handle tenant.
 *
 * Halaman platform memakai slug ini di root domain. Daftar ini juga mencegah
 * tenant mengambil alih route sistem (admin, api, preview, dll).
 */
export const RESERVED_SLUGS = new Set([
  '_next',
  'admin',
  'api',
  'app',
  'articles',
  'artikel',
  'assets',
  'auth',
  'beranda',
  'blog',
  'callback',
  'cdn',
  'company',
  'contact',
  'dashboard',
  'docs',
  'documentation',
  'en',
  'event',
  'favicon.ico',
  'files',
  'ftp',
  'help',
  'home',
  'harga',
  'id',
  'images',
  'karir',
  'legal',
  'llms.txt',
  'login',
  'mail',
  'manifest.webmanifest',
  'media',
  'my-route',
  'news',
  'oauth',
  'oplay',
  'payload',
  'portal',
  'preview',
  'pricing',
  'privacy',
  'profil',
  'profile',
  'register',
  'robots.txt',
  'signup',
  'sitemap.xml',
  'sso',
  'static',
  'status',
  'support',
  'tentang',
  'terms',
  'to',
  'undangan',
  'uploads',
  'www',
])

/**
 * Label subdomain pertama yang tidak boleh dipakai tenant di bawah domain
 * platform (mis. `admin.oplay.id`, `api.oplay.id`).
 *
 * Catatan: `portal` sengaja TIDAK dimasukkan agar `portal.umkm.oplay.id`
 * tetap boleh dipakai sebagai subdomain situs tenant.
 */
export const RESERVED_SUBDOMAINS = new Set([
  '_next',
  'admin',
  'api',
  'app',
  'assets',
  'auth',
  'cdn',
  'dashboard',
  'files',
  'ftp',
  'mail',
  'media',
  'oauth',
  'payload',
  'preview',
  'register',
  'signup',
  'sso',
  'static',
  'status',
  'uploads',
  'www',
])

export const TENANT_SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])$/

export function isValidTenantSlug(slug: string | undefined | null): slug is string {
  return Boolean(slug && TENANT_SLUG_REGEX.test(slug) && !RESERVED_SLUGS.has(slug))
}

/**
 * Host yang tidak boleh dipakai tenant non-platform: host platform itu sendiri
 * dan subdomain dengan label pertama yang reserved (`admin.oplay.id`, dst.).
 */
export function isReservedPlatformHost(host: string): boolean {
  const normalized = normalizeHost(host)
  if (!normalized) return true
  if (isPlatformHost(normalized)) return true

  for (const platform of getPlatformHosts()) {
    if (!normalized.endsWith(`.${platform}`)) continue
    const prefix = normalized.slice(0, -(platform.length + 1))
    const firstLabel = prefix.split('.')[0]
    if (firstLabel && RESERVED_SUBDOMAINS.has(firstLabel)) return true
  }

  return false
}

export function slugifyTenantName(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32)
    .replace(/-+$/g, '')
}

export type SiteAccessMode = 'platform' | 'subpath' | 'domain'

export type SiteContext = {
  tenant: Tenant
  /** platform = root domain, subpath = oplay.id/<handle>, domain = custom domain */
  access: SiteAccessMode
  locale: Locale
  /** Segmen path halaman relatif terhadap site (tanpa locale & tanpa handle). */
  pageSegments: string[]
  pagePath: string
  /** Prefix publik site. Kosong untuk platform & custom domain. */
  basePath: string
  /** Host yang dipakai request (sudah dinormalisasi). */
  host: string
  /** Semua segmen request setelah locale dilepas. */
  segments: string[]
}

type TenantWithSiteFields = Tenant & {
  slug?: string | null
  type?: 'platform' | 'individual' | 'corporate' | null
  status?: 'active' | 'suspended' | null
  hosts?: Array<{
    host?: string | null
    kind?: 'subdomain' | 'custom' | null
    verified?: boolean | null
    isPrimary?: boolean | null
  }> | null
  domain?: string | null
  exposeSubpath?: boolean | null
  defaultLayoutMode?: 'inherit' | 'canvas' | 'bare' | null
  favicon?: string | null
  themePreset?: string | null
}

export function splitLocale(segments: string[]): { locale: Locale; segments: string[] } {
  const first = segments[0]
  if (isLocale(first)) {
    return { locale: first, segments: segments.slice(1) }
  }

  return { locale: DEFAULT_LOCALE, segments }
}

export function getTenantBasePath(tenant: TenantWithSiteFields | null | undefined): string {
  if (!tenant || tenant.type === 'platform' || !tenant.slug) return ''
  return `/${tenant.slug}`
}

export function getTenantPrimaryHost(
  tenant: TenantWithSiteFields | null | undefined,
): string | null {
  if (!tenant) return null

  const hosts = (tenant.hosts || []).filter((entry) => entry.host)
  const primary =
    hosts.find((entry) => entry.isPrimary && entry.verified !== false) ||
    hosts.find((entry) => entry.verified !== false) ||
    hosts[0]

  if (primary?.host) return normalizeHost(primary.host)
  if (tenant.domain) return normalizeHost(tenant.domain)

  return null
}

/**
 * Base URL publik utama tenant. Custom domain diutamakan, lalu subpath platform.
 */
export function getTenantPublicBaseURL(
  tenant: TenantWithSiteFields | null | undefined,
  locale: Locale = DEFAULT_LOCALE,
): string {
  if (!tenant) return `${getServerURL()}/${locale === DEFAULT_LOCALE ? '' : locale}`.replace(/\/$/, '')

  const host = getTenantPrimaryHost(tenant)
  if (host) {
    return `${getProtocolForHost(host)}://${host}`
  }

  const basePath = getTenantBasePath(tenant)
  const platform = `${getServerURL()}${basePath}`
  if (locale === DEFAULT_LOCALE) return platform.replace(/\/$/, '')
  return `${platform}/${locale}`.replace(/\/$/, '')
}

export function buildPublicPath(
  tenant: TenantWithSiteFields | null | undefined,
  pagePath: string,
  locale: Locale = DEFAULT_LOCALE,
): string {
  return localizePath(pagePath, getTenantBasePath(tenant), locale)
}

async function queryPlatformTenant(): Promise<TenantWithSiteFields | null> {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'tenants',
    where: { type: { equals: 'platform' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  return (docs[0] as TenantWithSiteFields | undefined) || null
}

async function queryTenantBySlug(
  slug: string,
  opts?: { includeHiddenSubpath?: boolean },
): Promise<TenantWithSiteFields | null> {
  const payload = await getPayload({ config })
  const and: Where[] = [
    { slug: { equals: slug } },
    { type: { not_equals: 'platform' } },
    { status: { not_equals: 'suspended' } },
  ]

  // Tenant boleh menonaktifkan akses subpath (mis. klien custom domain)
  // agar kontennya tidak bocor ke oplay.id/<slug>. Preview terautentikasi
  // boleh tetap me-resolve slug ini agar live preview berfungsi di origin
  // platform (cookie draftMode tidak bisa lintas host).
  if (!opts?.includeHiddenSubpath) {
    and.push({ exposeSubpath: { not_equals: false } })
  }

  const { docs } = await payload.find({
    collection: 'tenants',
    where: { and },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  return (docs[0] as TenantWithSiteFields | undefined) || null
}

async function queryTenantByHost(host: string): Promise<TenantWithSiteFields | null> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'tenants',
    where: {
      and: [
        {
          or: [{ 'hosts.host': { equals: host } }, { domain: { equals: host } }],
        },
        { status: { not_equals: 'suspended' } },
      ],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  return (docs[0] as TenantWithSiteFields | undefined) || null
}

async function queryTenantByID(id: string): Promise<TenantWithSiteFields | null> {
  const payload = await getPayload({ config })

  try {
    const doc = (await payload.findByID({
      collection: 'tenants',
      id,
      depth: 0,
      overrideAccess: true,
    })) as TenantWithSiteFields | null

    return doc || null
  } catch {
    return null
  }
}

const cachedPlatformTenant = cacheQuery(
  { key: 'platform-tenant', tags: [CACHE_TAGS.tenants] },
  queryPlatformTenant,
)

const cachedTenantBySlug = cacheQuery(
  { key: 'tenant-by-slug', tags: [CACHE_TAGS.tenants] },
  queryTenantBySlug,
)

const cachedTenantByHost = cacheQuery(
  { key: 'tenant-by-host', tags: [CACHE_TAGS.tenants] },
  queryTenantByHost,
)

const cachedTenantByID = cacheQuery({ key: 'tenant-by-id', tags: [CACHE_TAGS.tenants] }, queryTenantByID)

export async function findPlatformTenant(): Promise<TenantWithSiteFields | null> {
  return cachedPlatformTenant()
}

export async function findTenantBySlug(
  slug: string,
  opts?: { includeHiddenSubpath?: boolean },
): Promise<TenantWithSiteFields | null> {
  if (!slug || RESERVED_SLUGS.has(slug)) return null
  if (opts?.includeHiddenSubpath) {
    // Jangan cache: hanya untuk preview terautentikasi, dan hasilnya tidak
    // boleh mencemari lookup publik (tenant dengan exposeSubpath=false).
    return queryTenantBySlug(slug, opts)
  }
  return cachedTenantBySlug(slug)
}

export async function findTenantByHost(host: string): Promise<TenantWithSiteFields | null> {
  const normalized = normalizeHost(host)
  if (!normalized) return null
  return cachedTenantByHost(normalized)
}

export async function findTenantByID(id: string): Promise<TenantWithSiteFields | null> {
  if (!id) return null
  return cachedTenantByID(id)
}

/**
 * Resolusi request -> tenant + path halaman.
 *
 * Aturan:
 * 1. `oplay.id/<reserved>`  -> halaman platform
 * 2. `oplay.id/<handle>`    -> site tenant (subpath), halaman = sisa path
 * 3. custom domain tenant   -> site tenant (domain), halaman = seluruh path
 * 4. host tidak dikenal     -> null (404), tidak pernah fallback ke platform
 */
export async function resolveSiteContext({
  host,
  segments,
  allowHiddenSubpath = false,
}: {
  host: string | null | undefined
  segments: string[]
  /**
   * Izinkan resolusi tenant subpath meski `exposeSubpath` dimatikan.
   * Dipakai preview terautentikasi agar live preview Pages tetap bisa
   * berjalan di origin platform (cookie draftMode tidak bisa lintas host),
   * tanpa membuka akses publik subpath.
   */
  allowHiddenSubpath?: boolean
}): Promise<SiteContext | null> {
  const normalizedHost = normalizeHost(host) || getPlatformHost()
  const { locale, segments: cleanSegments } = splitLocale(segments.filter(Boolean))

  if (isPlatformHost(normalizedHost)) {
    const platform = await findPlatformTenant()
    if (!platform) return null

    const first = cleanSegments[0]
    if (first && !RESERVED_SLUGS.has(first)) {
      let tenantBySlug = await findTenantBySlug(first)
      if (!tenantBySlug && allowHiddenSubpath) {
        tenantBySlug = await findTenantBySlug(first, { includeHiddenSubpath: true })
      }
      if (tenantBySlug) {
        const pageSegments = cleanSegments.slice(1)
        return {
          tenant: tenantBySlug,
          access: 'subpath',
          locale,
          pageSegments,
          pagePath: joinPath(...pageSegments),
          basePath: getTenantBasePath(tenantBySlug),
          host: normalizedHost,
          segments: cleanSegments,
        }
      }
    }

    return {
      tenant: platform,
      access: 'platform',
      locale,
      pageSegments: cleanSegments,
      pagePath: joinPath(...cleanSegments),
      basePath: '',
      host: normalizedHost,
      segments: cleanSegments,
    }
  }

  const tenant = await findTenantByHost(normalizedHost)
  if (!tenant) return null

  return {
    tenant,
    access: 'domain',
    locale,
    pageSegments: cleanSegments,
    pagePath: joinPath(...cleanSegments),
    basePath: '',
    host: normalizedHost,
    segments: cleanSegments,
  }
}

export function getSiteBasePathFromSegments(segments: string[]): string {
  const first = segments.filter(Boolean)[0]
  if (!first || isLocale(first) || RESERVED_SLUGS.has(first)) return ''
  return `/${first}`
}

export { LOCALES, DEFAULT_LOCALE, getPlatformHost, getServerURL, normalizeHost, normalizePagePath }
