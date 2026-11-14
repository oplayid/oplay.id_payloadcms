// src/app/(frontend)/llms.txt/route.ts
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Page, Tenant } from '@/payload-types'
import { getOriginFromHost, isPlatformHost, localizePath, normalizeHost } from '@/lib/urls'
import { extractPagePath } from '@/lib/pagePaths'
import { findPlatformTenant, getTenantBasePath } from '@/lib/site'

export const dynamic = 'force-dynamic'

export async function GET() {
  const headersList = await headers()
  const host = normalizeHost(headersList.get('host'))
  const origin = getOriginFromHost(headersList.get('host'))
  const payload = await getPayload({ config })
  const platform = await findPlatformTenant()

  let markdown = `# OPLAY.ID — Platform Website Builder & Legal Tech Ecosystem

> Platform multi-tenant untuk individu, profesional, dan organisasi. Setiap tenant memiliki halaman, tema, dan domain sendiri.

## Navigasi Utama
- [Beranda](${origin})
- [Dokumentasi](${origin}/docs)
- [Perusahaan](${origin}/company)

`

  if (platform) {
    const pages = await payload.find({
      collection: 'pages',
      where: {
        and: [
          { tenant: { equals: platform.id } },
          { _status: { equals: 'published' } },
        ],
      },
      limit: 1000,
      depth: 0,
      overrideAccess: true,
    })

    markdown += `## Halaman Platform\n`
    for (const page of pages.docs as Page[]) {
      const path = localizePath(extractPagePath(page), '', 'id')
      markdown += `- [${page.title}](${origin}${path})\n`
    }
    markdown += '\n'
  }

  if (isPlatformHost(host)) {
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

    if (tenants.docs.length > 0) {
      markdown += `## Direktori Tenant\n`
      for (const tenant of tenants.docs as Array<Tenant & { name: string; slug?: string | null }>) {
        markdown += `- [${tenant.name}](${origin}${getTenantBasePath(tenant)})\n`
      }
    }
  }

  return new NextResponse(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
    },
  })
}
