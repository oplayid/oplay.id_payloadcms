import type { Page, Tenant } from '@/payload-types'
import { localizePath, normalizePagePath, type Locale } from './urls'

export type PageWithPath = Page & {
  meta?: Record<string, any> | null
  seoMetadata?: Record<string, any> | null
  breadcrumbs?: Array<{ url?: string | null }> | null
}

/** Path halaman relatif terhadap root site. Home selalu `/`. */
export function extractPagePath(page: Partial<Page> & { slug?: string | null }): string {
  const crumbs = Array.isArray(page.breadcrumbs) ? page.breadcrumbs : []
  const last = crumbs[crumbs.length - 1]
  const raw = last && typeof last === 'object' && 'url' in last ? last.url : null
  let path = normalizePagePath(raw || page.slug || 'home')

  // Data lama memakai /home sebagai root dan /home/anak untuk turunannya.
  path = path.replace(/^\/home(?=\/|$)/, '') || '/'
  if (path === '/beranda' || path === '/index') return '/'

  return normalizePagePath(path)
}

export function getPublicPagePath(page: Partial<Page> & { slug?: string | null }): string {
  return extractPagePath(page)
}

function tenantBasePath(
  tenant: Partial<Tenant> & { slug?: string | null; type?: string | null },
): string {
  if (tenant.type === 'platform' || !tenant.slug) return ''
  return `/${tenant.slug}`
}

/**
 * URL route preview yang selalu berada di origin admin (oplay.id).
 * Route /preview akan memvalidasi login, mengaktifkan draftMode, lalu redirect.
 */
export function buildPreviewURL({
  tenant,
  page,
  locale,
  origin,
}: {
  tenant: Partial<Tenant> & { slug?: string | null; type?: string | null }
  page: Partial<Page> & { slug?: string | null }
  locale: Locale
  origin: string
}): string {
  const pagePath = extractPagePath(page)
  const publicPath = localizePath(pagePath, tenantBasePath(tenant), locale)
  const preview = new URL('/preview', origin)
  preview.searchParams.set('path', publicPath)
  preview.searchParams.set('locale', locale)
  if (tenant.id) preview.searchParams.set('tenant', tenant.id)

  return preview.toString()
}
