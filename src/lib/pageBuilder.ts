// src/lib/pageBuilder.ts
import { cache } from 'react'
import { getPayload, type Where } from 'payload'
import config from '@payload-config'
import type { Page, Tenant } from '@/payload-types'
import { getThemeData } from './getTheme'
import {
  DEFAULT_LOCALE,
  buildPublicPath,
  getServerURL,
  getTenantBasePath,
  getTenantPrimaryHost,
  normalizePagePath,
  resolveSiteContext,
  type SiteContext,
} from './site'
import { getProtocolForHost, localizePath, type Locale } from './urls'
import { extractPagePath } from './pagePaths'
import { getTenantChrome, type SiteChrome } from './siteChrome'
import { CACHE_TAGS, cacheQuery } from './contentCache'

export type LayoutMode = 'inherit' | 'canvas' | 'bare'

export type PageLayoutData = {
  page: Page
  tenant: Tenant
  /** ID tenant, dipakai blok yang perlu query konten tenant ini. */
  tenantID: string
  site: SiteContext
  theme: Record<string, any>
  favicon: string
  title: string
  meta: {
    title?: string | null
    description?: string | null
    image?: any
    keywords?: string | null
  }
  canonicalURL: string
  alternateURLs: Record<string, string>
  isPreview: boolean
  basePath: string
  locale: Locale
  /** Layout efektif: inherit (chrome situs), canvas, atau bare. */
  layoutMode: LayoutMode
  /** Navbar/footer/code injection milik tenant. */
  chrome: SiteChrome
  /** Data yang dikonsumsi CanvasRenderer. */
  canvasBlocks: any[]
}

type PageWithMeta = Page & {
  meta?: {
    title?: string | null
    description?: string | null
    image?: any
    keywords?: string | null
    noIndex?: boolean | null
  } | null
  seoMetadata?: {
    title?: string | null
    description?: string | null
    image?: any
    keywords?: string | null
  } | null
}

function pathCandidates(path: string): string[] {
  const normalized = normalizePagePath(path)
  if (normalized === '/') return ['/', '/home', '/beranda', '/index']
  return [normalized, `/home${normalized}`]
}

export function faviconFromTenant(tenant: Tenant): string {
  const raw = (tenant as Tenant & { favicon?: unknown }).favicon

  if (typeof raw === 'string' && raw.trim()) return raw.trim()
  if (raw && typeof raw === 'object') {
    const value = raw as { url?: string; filename?: string }
    if (value.url) return value.url
  }

  return '/favicon.ico'
}

type PageLookupArgs = {
  tenantID: string
  isPlatformTenant: boolean
  pagePath: string
  locale: Locale
  isPreview: boolean
}

async function queryPageForSite({
  tenantID,
  isPlatformTenant,
  pagePath,
  locale,
  isPreview,
}: PageLookupArgs): Promise<PageWithMeta | null> {
  const payload = await getPayload({ config })
  const candidates = pathCandidates(pagePath)
  const tenantFilter: Where = isPlatformTenant
    ? {
        or: [{ tenant: { equals: tenantID } }, { tenant: { exists: false } }],
      }
    : { tenant: { equals: tenantID } }

  const statusFilter: Where = isPreview ? {} : { _status: { equals: 'published' } }

  const byBreadcrumb = await payload.find({
    collection: 'pages',
    locale,
    where: {
      and: [
        tenantFilter,
        { 'breadcrumbs.url': { in: candidates } },
        statusFilter,
      ],
    },
    // `breadcrumbs.url` cocok dengan elemen mana pun, termasuk leluhur.
    // Ambil beberapa lalu pilih yang breadcrumb terakhirnya sama dengan path.
    limit: 50,
    depth: 2,
    draft: isPreview,
    // Preview sudah melewati pengecekan user di route /preview. Untuk public,
    // overrideAccess dipakai karena access.read koleksi sengaja menolak anonim;
    // tenant + status sudah difilter eksplisit di `where` di atas.
    overrideAccess: true,
  })

  const expectedPath = normalizePagePath(pagePath)
  const byBreadcrumbExact = (byBreadcrumb.docs as PageWithMeta[]).find(
    (doc) => extractPagePath(doc) === expectedPath,
  )
  if (byBreadcrumbExact) return byBreadcrumbExact

  // Fallback untuk data yang breadcrumbs-nya belum terisi / belum di-resave.
  const normalizedPath = normalizePagePath(pagePath)
  const lastSegment = normalizedPath === '/' ? null : normalizedPath.split('/').filter(Boolean).pop()
  const slugCandidates =
    pagePath === '/'
      ? ['home', 'beranda', 'index']
      : [lastSegment].filter((slug): slug is string => Boolean(slug))

  const bySlug = await payload.find({
    collection: 'pages',
    locale,
    where: {
      and: [tenantFilter, { slug: { in: slugCandidates } }, statusFilter],
    },
    limit: 10,
    depth: 2,
    draft: isPreview,
    overrideAccess: true,
  })

  const exact = (bySlug.docs as PageWithMeta[]).find(
    (doc) => extractPagePath(doc) === normalizePagePath(pagePath),
  )

  return exact || null
}

const cachedPageForSite = cacheQuery(
  { key: 'page-for-site', tags: [CACHE_TAGS.pages] },
  (tenantID: string, isPlatformTenant: boolean, pagePath: string, locale: Locale) =>
    queryPageForSite({
      tenantID,
      isPlatformTenant,
      pagePath,
      locale,
      isPreview: false,
    }),
)

async function findPageForSite({
  site,
  isPreview,
}: {
  site: SiteContext
  isPreview: boolean
}): Promise<PageWithMeta | null> {
  const isPlatformTenant = site.tenant.type === 'platform'

  // Draft/preview tidak boleh memakai cache agar editor selalu melihat
  // perubahan terakhir.
  if (isPreview) {
    return queryPageForSite({
      tenantID: site.tenant.id,
      isPlatformTenant,
      pagePath: site.pagePath,
      locale: site.locale,
      isPreview: true,
    })
  }

  return cachedPageForSite(site.tenant.id, isPlatformTenant, site.pagePath, site.locale)
}

export function buildCanonicalURLs({
  site,
  pagePath,
  requestHost,
}: {
  site: SiteContext
  /** Path konten relatif terhadap root site (mis. `/`, `/artikel/foo`). */
  pagePath: string
  requestHost: string
}): { canonicalURL: string; alternateURLs: Record<string, string> } {
  const tenant = site.tenant as Tenant & {
    slug?: string | null
    type?: string | null
    hosts?: Array<{ host?: string | null; isPrimary?: boolean | null; verified?: boolean | null }> | null
  }

  const primaryHost = getTenantPrimaryHost(tenant)
  const requestIsPlatform = site.access === 'platform' || site.access === 'subpath'

  let origin = getServerURL()
  if (primaryHost) {
    origin = `${getProtocolForHost(primaryHost)}://${primaryHost}`
  } else if (!requestIsPlatform) {
    origin = `${getProtocolForHost(requestHost)}://${requestHost}`
  }

  const useBasePath = !primaryHost && Boolean(getTenantBasePath(tenant))
  const pathForLocale = (locale: Locale) =>
    useBasePath
      ? buildPublicPath(tenant, pagePath, locale)
      : localizePath(pagePath, '', locale)

  const canonicalURL = `${origin}${pathForLocale(DEFAULT_LOCALE)}`.replace(/\/$/, '')
  const alternateURLs = {
    id: `${origin}${pathForLocale('id')}`.replace(/\/$/, ''),
    en: `${origin}${pathForLocale('en')}`.replace(/\/$/, ''),
    'x-default': `${origin}${pathForLocale('id')}`.replace(/\/$/, ''),
  }

  return { canonicalURL, alternateURLs }
}

export const getPageForRequest = cache(
  async (
    host: string,
    segments: string[],
    isPreview: boolean,
  ): Promise<PageLayoutData | null> => {
    const site = await resolveSiteContext({ host, segments, allowHiddenSubpath: isPreview })
    if (!site) return null

    const page = await findPageForSite({ site, isPreview })
    if (!page) return null

    const tenant = site.tenant as Tenant & {
      favicon?: string | null
      themePreset?: string | null
    }

    const rawThemePreset = (page as any).themePreset
    let themeValue = (tenant.themePreset || 'default-theme') as string

    if (typeof rawThemePreset === 'object' && rawThemePreset !== null) {
      themeValue = rawThemePreset.id
    } else if (typeof rawThemePreset === 'string') {
      themeValue = rawThemePreset
    }

    const theme = await getThemeData(themeValue)
    const meta = (page.meta || page.seoMetadata || {}) as PageLayoutData['meta']
    const { canonicalURL, alternateURLs } = buildCanonicalURLs({
      site,
      pagePath: extractPagePath(page),
      requestHost: host,
    })

    const rawCanvas = (page as Page & { canvasBlocks?: any }).canvasBlocks
    const canvasBlocks = Array.isArray(rawCanvas) ? rawCanvas : []

    const tenantWithLayout = tenant as Tenant & {
      defaultLayoutMode?: LayoutMode | null
    }
    const pageWithLayout = page as Page & { layoutMode?: LayoutMode | null }

    const layoutMode: LayoutMode =
      pageWithLayout.layoutMode ||
      tenantWithLayout.defaultLayoutMode ||
      (tenant.type === 'platform' ? 'canvas' : 'inherit')

    const chrome = await getTenantChrome(tenant.id)

    return {
      page,
      tenant,
      tenantID: tenant.id,
      site,
      theme,
      favicon: faviconFromTenant(tenant),
      title: page.title,
      meta: {
        title: meta.title || page.title,
        description: meta.description || 'Platform eksekusi bisnis dan legal teknologi.',
        image: meta.image,
        keywords: meta.keywords,
      },
      canonicalURL,
      alternateURLs,
      isPreview,
      basePath: site.basePath,
      locale: site.locale,
      layoutMode,
      chrome,
      canvasBlocks,
    }
  },
)
