import { getPayload } from 'payload'
import config from '@payload-config'
import type { Tenant } from '@/payload-types'
import {
  DEFAULT_LOCALE,
  LOCALES,
  getPlatformHost,
  getProtocolForHost,
  getServerURL,
  isLocale,
  isPlatformHost,
  isPlatformSubdomain,
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
  'uploads',
  'www',
])

export const TENANT_SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])$/

export function isValidTenantSlug(slug: string | undefined | null): slug is string {
  return Boolean(slug && TENANT_SLUG_REGEX.test(slug) && !RESERVED_SLUGS.has(slug))
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

export async function findPlatformTenant(): Promise<TenantWithSiteFields | null> {
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

export async function findTenantBySlug(slug: string): Promise<TenantWithSiteFields | null> {
  if (!slug || RESERVED_SLUGS.has(slug)) return null

  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'tenants',
    where: {
      and: [
        { slug: { equals: slug } },
        { type: { not_equals: 'platform' } },
        { status: { not_equals: 'suspended' } },
      ],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  return (docs[0] as TenantWithSiteFields | undefined) || null
}

export async function findTenantByHost(host: string): Promise<TenantWithSiteFields | null> {
  const normalized = normalizeHost(host)
  if (!normalized) return null

  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'tenants',
    where: {
      and: [
        {
          or: [{ 'hosts.host': { equals: normalized } }, { domain: { equals: normalized } }],
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
}: {
  host: string | null | undefined
  segments: string[]
}): Promise<SiteContext | null> {
  const normalizedHost = normalizeHost(host) || getPlatformHost()
  const { locale, segments: cleanSegments } = splitLocale(segments.filter(Boolean))

  if (isPlatformHost(normalizedHost)) {
    const platform = await findPlatformTenant()
    if (!platform) return null

    const first = cleanSegments[0]
    if (first && !RESERVED_SLUGS.has(first)) {
      const tenantBySlug = await findTenantBySlug(first)
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
    access: isPlatformSubdomain(normalizedHost) ? 'domain' : 'domain',
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
