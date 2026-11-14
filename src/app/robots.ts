// src/app/robots.ts
import { headers } from 'next/headers'
import type { MetadataRoute } from 'next'
import { getOriginFromHost, getServerURL } from '@/lib/urls'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers()
  const origin = getOriginFromHost(headersList.get('host')) || getServerURL()

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/preview', '/portal/', '/superadmin/'],
    },
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  }
}
