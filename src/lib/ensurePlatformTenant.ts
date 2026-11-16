import type { Payload } from 'payload'
import type { Tenant } from '@/payload-types'
import { getPlatformHost, getPlatformHosts } from './urls'

type TenantWithLegacyDomain = Tenant & { domain?: string | null }

/**
 * Memastikan tenant platform selalu ada. Tenant ini memiliki halaman root
 * (oplay.id, /profil, /about, dst) dan tidak memakai handle subpath.
 *
 * Untuk instalasi lama, tenant yang `domain`-nya sama dengan host platform
 * akan dipromosikan menjadi tenant platform, bukan diduplikasi.
 */
export async function ensurePlatformTenant(payload: Payload): Promise<Tenant | null> {
  if (process.env.PLATFORM_AUTO_SEED === 'false') return null

  const existing = await payload.find({
    collection: 'tenants',
    where: { type: { equals: 'platform' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (existing.docs[0]) return existing.docs[0] as Tenant

  const slug = (process.env.PLATFORM_TENANT_SLUG || 'oplay').toLowerCase()
  const platformHost = getPlatformHost()
  const platformHosts = getPlatformHosts()

  // Promosikan tenant lama yang domain/host-nya adalah host platform.
  if (platformHosts.length > 0) {
    const legacy = await payload.find({
      collection: 'tenants',
      where: {
        or: [
          { domain: { in: platformHosts } },
          { 'hosts.host': { in: platformHosts } },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const candidate = legacy.docs[0] as TenantWithLegacyDomain | undefined
    if (candidate) {
      const data: Record<string, unknown> = {
        type: 'platform',
        status: 'active',
        defaultLayoutMode: 'canvas',
      }
      if (!(candidate as { slug?: string | null }).slug) data.slug = slug

      const hosts = (candidate as { hosts?: Array<{ host?: string | null }> | null }).hosts || []
      if (hosts.length === 0) {
        data.hosts = [
          { host: platformHost, kind: 'custom', verified: true, isPrimary: true },
        ]
      }

      return (await payload.update({
        collection: 'tenants',
        id: candidate.id,
        data,
        depth: 0,
        overrideAccess: true,
        context: { skipTenantValidation: true },
      })) as Tenant
    }
  }

  const bySlug = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (bySlug.docs[0]) {
    return (await payload.update({
      collection: 'tenants',
      id: bySlug.docs[0].id,
      data: { type: 'platform', status: 'active', defaultLayoutMode: 'canvas' },
      depth: 0,
      overrideAccess: true,
      context: { skipTenantValidation: true },
    })) as Tenant
  }

  return (await payload.create({
    collection: 'tenants',
    data: {
      name: process.env.PLATFORM_NAME || 'OPLAY.ID',
      slug,
      type: 'platform',
      status: 'active',
      defaultLayoutMode: 'canvas',
      themePreset: 'default-theme',
      ...(platformHost
        ? {
            hosts: [
              { host: platformHost, kind: 'custom', verified: true, isPrimary: true },
            ],
          }
        : {}),
    },
    depth: 0,
    overrideAccess: true,
  })) as Tenant
}
