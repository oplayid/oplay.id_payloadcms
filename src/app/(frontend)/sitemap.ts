import { headers } from 'next/headers'
import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Page, Tenant } from '@/payload-types'
import {
  isPlatformHost,
  localizePath,
  normalizeHost,
  getOriginFromHost,
} from '@/lib/urls'
import { extractPagePath } from '@/lib/pagePaths'
import { ROUTABLE_COLLECTIONS } from '@/lib/routableCollections'
import { findPlatformTenant, findTenantByHost, getTenantBasePath } from '@/lib/site'

type SiteForSitemap = {
  tenant: Tenant & { slug?: string | null; type?: string | null }
  basePath: string
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers()
  const host = normalizeHost(headersList.get('host'))
  if (!host) return []

  const origin = getOriginFromHost(headersList.get('host'))
  const sites: SiteForSitemap[] = []

  if (isPlatformHost(host)) {
    const platform = await findPlatformTenant()
    if (platform) sites.push({ tenant: platform, basePath: '' })

    const payload = await getPayload({ config })
    const tenants = await payload.find({
      collection: 'tenants',
      where: {
        and: [
          { type: { not_equals: 'platform' } },
          { status: { not_equals: 'suspended' } },
          { exposeSubpath: { not_equals: false } },
        ],
      },
      limit: 500,
      depth: 0,
      overrideAccess: true,
    })

    for (const tenant of tenants.docs as Array<Tenant & { slug?: string | null }>) {
      sites.push({ tenant, basePath: getTenantBasePath(tenant) })
    }
  } else {
    const tenant = await findTenantByHost(host)
    if (tenant) sites.push({ tenant, basePath: '' })
  }

  if (sites.length === 0) return []

  const payload = await getPayload({ config })
  const entries: MetadataRoute.Sitemap = []

  for (const site of sites) {
    // Selaraskan dengan metadata halaman: tenant yang noindex tidak boleh
    // tetap mempublikasikan URL-nya di sitemap.
    const tenantSEO = (site.tenant as Tenant & { seo?: { noIndex?: boolean | null } | null }).seo
    if (tenantSEO?.noIndex) continue

    const pages = await payload.find({
      collection: 'pages',
      where: {
        and: [
          { tenant: { equals: site.tenant.id } },
          { _status: { equals: 'published' } },
        ],
      },
      limit: 5000,
      depth: 0,
      overrideAccess: true,
    })

    for (const page of pages.docs as Page[]) {
      if ((page as Page & { seo?: { noIndex?: boolean | null } | null }).seo?.noIndex) continue

      const pagePath = extractPagePath(page)
      const idURL = `${origin}${localizePath(pagePath, site.basePath, 'id')}`.replace(/\/$/, '')
      const enURL = `${origin}${localizePath(pagePath, site.basePath, 'en')}`.replace(/\/$/, '')

      entries.push({
        url: idURL,
        lastModified: page.updatedAt ? new Date(page.updatedAt) : new Date(),
        changeFrequency: 'weekly',
        priority: pagePath === '/' ? 1 : 0.7,
        alternates: {
          languages: {
            id: idURL,
            en: enURL,
            'x-default': idURL,
          },
        },
      })
    }

    // Konten routable (artikel, dan koleksi lain yang terdaftar).
    for (const config of ROUTABLE_COLLECTIONS) {
      const prefix = config.prefixes[0]
      const docs = await payload.find({
        collection: config.collection as never,
        where: {
          and: [
            { tenant: { equals: site.tenant.id } },
            { _status: { equals: 'published' } },
          ],
        },
        limit: 5000,
        depth: 0,
        overrideAccess: true,
      })

      for (const doc of docs.docs as Array<Record<string, unknown>>) {
        const docSEO = doc.seo as { noIndex?: boolean | null } | null | undefined
        if (docSEO?.noIndex) continue

        const slug = doc[config.slugField]
        if (typeof slug !== 'string' || !slug) continue

        const contentPath = `/${prefix}/${slug}`
        const updatedAt = doc.updatedAt ? new Date(doc.updatedAt as string) : new Date()
        const idURL = `${origin}${localizePath(contentPath, site.basePath, 'id')}`.replace(
          /\/$/,
          '',
        )
        const enURL = `${origin}${localizePath(contentPath, site.basePath, 'en')}`.replace(
          /\/$/,
          '',
        )

        entries.push({
          url: idURL,
          lastModified: updatedAt,
          changeFrequency: 'monthly',
          priority: 0.6,
          alternates: {
            languages: {
              id: idURL,
              en: enURL,
              'x-default': idURL,
            },
          },
        })
      }
    }
  }

  return entries
}
