import type { Payload } from 'payload'
import type { Page, Tenant } from '@/payload-types'
import { getPayload } from 'payload'
import config from '@payload-config'
import { extractPagePath } from './pagePaths'
import { findTenantByID } from './site'
import { CACHE_TAGS, cacheQuery } from './contentCache'

export type NavbarChrome = {
  variant?: string
  brandName?: string
  categories: Array<{
    label: string
    href?: string
    items?: Array<{
      label: string
      description?: string
      href?: string
      isFeatured?: boolean
      image?: unknown
    }>
  }>
  languages?: Array<{ code: string; label: string; name?: string | null; flag?: string | null }>
  loginCta?: { label: string; href: string }
}

export type FooterChrome = {
  variant?: string
  year?: number
  companyName?: string
  tagline?: string
  navigationColumns: Array<{
    title: string
    links: Array<{ label: string; href: string }>
  }>
}

export type SiteCodeInjection = {
  css?: string
  js?: string
}

export type SiteChrome = {
  navigation: NavbarChrome | null
  footer: FooterChrome | null
  codeInjection: SiteCodeInjection
}

type PageRef = string | { id: string } | null | undefined

type NavLinkRaw = {
  label?: string | null
  href?: string | null
  description?: string | null
  isFeatured?: boolean | null
  image?: unknown
  page?: PageRef
}

type NavigationRaw = {
  enabled?: boolean | null
  style?: string | null
  brandName?: string | null
  categories?: Array<{
    label?: string | null
    href?: string | null
    page?: PageRef
    items?: NavLinkRaw[] | null
  }> | null
  languages?: Array<{
    code?: string | null
    label?: string | null
    name?: string | null
    flag?: string | null
  }> | null
  loginCta?: { label?: string | null; href?: string | null } | null
}

type FooterRaw = {
  enabled?: boolean | null
  style?: string | null
  companyName?: string | null
  tagline?: string | null
  year?: number | null
  columns?: Array<{
    title?: string | null
    links?: Array<{ label?: string | null; href?: string | null; page?: PageRef }> | null
  }> | null
}

type CodeInjectionRaw = {
  customCss?: string | null
  customJs?: string | null
}

function refID(ref: PageRef): string | null {
  if (!ref) return null
  return typeof ref === 'string' ? ref : ref.id
}

function resolveHref(pagePath: string | undefined, fallback?: string | null): string | undefined {
  if (pagePath) return pagePath
  const trimmed = fallback?.trim()
  return trimmed || undefined
}

/**
 * Mengubah konfigurasi navbar/footer pada dokumen tenant menjadi data siap
 * pakai untuk NavbarBlock/FooterBlock.
 *
 * Relasi `page` diutamakan (otomatis ikut saat slug halaman berubah), lalu
 * fallback ke `href` manual.
 */
export async function buildSiteChrome({
  tenant,
  payload,
}: {
  tenant: Tenant
  payload: Payload
}): Promise<SiteChrome> {
  const raw = tenant as Tenant & {
    navigation?: NavigationRaw | null
    footer?: FooterRaw | null
    codeInjection?: CodeInjectionRaw | null
  }

  const navigationRaw = raw.navigation
  const footerRaw = raw.footer
  const codeRaw = raw.codeInjection

  const pageIDs = new Set<string>()

  for (const category of navigationRaw?.categories || []) {
    const categoryID = refID(category.page)
    if (categoryID) pageIDs.add(categoryID)
    for (const item of category.items || []) {
      const itemID = refID(item.page)
      if (itemID) pageIDs.add(itemID)
    }
  }

  for (const column of footerRaw?.columns || []) {
    for (const link of column.links || []) {
      const linkID = refID(link.page)
      if (linkID) pageIDs.add(linkID)
    }
  }

  const pathByID = new Map<string, string>()

  if (pageIDs.size > 0) {
    const { docs } = await payload.find({
      collection: 'pages',
      where: { id: { in: [...pageIDs] } },
      depth: 0,
      pagination: false,
      overrideAccess: true,
    })

    for (const doc of docs as Array<Partial<Page> & { id: string }>) {
      pathByID.set(String(doc.id), extractPagePath(doc))
    }
  }

  const navigation: NavbarChrome | null =
    navigationRaw && navigationRaw.enabled !== false
      ? {
          variant: navigationRaw.style || 'navbar-standard',
          brandName: navigationRaw.brandName?.trim() || tenant.name,
          categories: (navigationRaw.categories || []).map((category) => ({
            label: category.label || '',
            href: resolveHref(
              pathByID.get(refID(category.page) || ''),
              category.href,
            ),
            items: (category.items || []).map((item) => ({
              label: item.label || '',
              description: item.description || undefined,
              href: resolveHref(pathByID.get(refID(item.page) || ''), item.href),
              isFeatured: Boolean(item.isFeatured),
              image: item.image || undefined,
            })),
          })),
          languages: navigationRaw.languages?.length
            ? navigationRaw.languages.map((language) => ({
                code: language.code || 'id',
                label: language.label || String(language.code || 'id').toUpperCase(),
                name: language.name,
                flag: language.flag,
              }))
            : undefined,
          loginCta:
            navigationRaw.loginCta?.href
              ? {
                  label: navigationRaw.loginCta.label || 'Login',
                  href: navigationRaw.loginCta.href,
                }
              : undefined,
        }
      : null

  const columns = (footerRaw?.columns || [])
    .map((column) => ({
      title: column.title || '',
      links: (column.links || [])
        .map((link) => ({
          label: link.label || '',
          href: resolveHref(pathByID.get(refID(link.page) || ''), link.href),
        }))
        .filter((link): link is { label: string; href: string } => Boolean(link.href)),
    }))
    .filter((column) => column.links.length > 0)

  const footer: FooterChrome | null =
    footerRaw && footerRaw.enabled !== false
      ? {
          variant: footerRaw.style || 'footer-standard',
          year: footerRaw.year || undefined,
          companyName: footerRaw.companyName?.trim() || tenant.name,
          tagline: footerRaw.tagline?.trim() || undefined,
          // Selalu kirim array (meskipun kosong) agar FooterBlock tidak memakai
          // kolom default bawaan OPLAY untuk situs tenant.
          navigationColumns: columns,
        }
      : null

  return {
    navigation,
    footer,
    codeInjection: {
      css: codeRaw?.customCss?.trim() || undefined,
      js: codeRaw?.customJs?.trim() || undefined,
    },
  }
}

const EMPTY_CHROME: SiteChrome = {
  navigation: null,
  footer: null,
  codeInjection: {},
}

async function queryTenantChrome(tenantID: string): Promise<SiteChrome> {
  const payload = await getPayload({ config })
  const tenant = await findTenantByID(tenantID)
  if (!tenant) return EMPTY_CHROME

  return buildSiteChrome({ tenant: tenant as Tenant, payload })
}

const cachedTenantChrome = cacheQuery(
  // Chrome bergantung pada dokumen tenant (nav/footer) sekaligus halaman
  // tujuan (href hasil relasi), jadi kedua tag ikut diinvalidasi.
  { key: 'tenant-chrome', tags: [CACHE_TAGS.tenants, CACHE_TAGS.pages] },
  queryTenantChrome,
)

/** Navbar/footer/code injection tenant, di-cache lintas request. */
export async function getTenantChrome(tenantID: string): Promise<SiteChrome> {
  if (!tenantID) return EMPTY_CHROME
  return cachedTenantChrome(tenantID)
}
