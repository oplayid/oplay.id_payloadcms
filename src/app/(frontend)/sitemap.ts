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
  }

  return entries
}
