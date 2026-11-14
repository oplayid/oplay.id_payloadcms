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

export type PageLayoutData = {
  page: Page
  tenant: Tenant
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

function faviconFromTenant(tenant: Tenant): string {
  const raw = (tenant as Tenant & { favicon?: unknown }).favicon

  if (typeof raw === 'string' && raw.trim()) return raw.trim()
  if (raw && typeof raw === 'object') {
    const value = raw as { url?: string; filename?: string }
    if (value.url) return value.url
  }

  return '/favicon.ico'
}

async function findPageForSite({
  site,
  isPreview,
}: {
  site: SiteContext
  isPreview: boolean
}): Promise<PageWithMeta | null> {
  const payload = await getPayload({ config })
  const tenantID = site.tenant.id
  const candidates = pathCandidates(site.pagePath)
  const tenantFilter: Where =
    site.tenant.type === 'platform'
      ? {
          or: [{ tenant: { equals: tenantID } }, { tenant: { exists: false } }],
        }
      : { tenant: { equals: tenantID } }

  const statusFilter: Where = isPreview ? {} : { _status: { equals: 'published' } }

  const byBreadcrumb = await payload.find({
    collection: 'pages',
    locale: site.locale,
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
    // Preview sudah melewati pengecekan user di route /preview.
    overrideAccess: isPreview,
  })

  const expectedPath = normalizePagePath(site.pagePath)
  const byBreadcrumbExact = (byBreadcrumb.docs as PageWithMeta[]).find(
    (doc) => extractPagePath(doc) === expectedPath,
  )
  if (byBreadcrumbExact) return byBreadcrumbExact

  // Fallback untuk data yang breadcrumbs-nya belum terisi / belum di-resave.
  const lastSegment = site.pageSegments[site.pageSegments.length - 1]
  const slugCandidates =
    site.pagePath === '/'
      ? ['home', 'beranda', 'index']
      : [lastSegment].filter((slug): slug is string => Boolean(slug))

  const bySlug = await payload.find({
    collection: 'pages',
    locale: site.locale,
    where: {
      and: [tenantFilter, { slug: { in: slugCandidates } }, statusFilter],
    },
    limit: 10,
    depth: 2,
    draft: isPreview,
    overrideAccess: isPreview,
  })

  const exact = (bySlug.docs as PageWithMeta[]).find(
    (doc) => extractPagePath(doc) === normalizePagePath(site.pagePath),
  )

  return exact || null
}

function buildCanonicalURLs({
  site,
  page,
  requestHost,
}: {
  site: SiteContext
  page: PageWithMeta
  requestHost: string
}): { canonicalURL: string; alternateURLs: Record<string, string> } {
  const pagePath = extractPagePath(page)
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
    const site = await resolveSiteContext({ host, segments })
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
      page,
      requestHost: host,
    })

    const rawCanvas = (page as Page & { canvasBlocks?: any }).canvasBlocks
    const canvasBlocks = Array.isArray(rawCanvas) ? rawCanvas : []

    return {
      page,
      tenant,
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
      canvasBlocks,
    }
  },
)
