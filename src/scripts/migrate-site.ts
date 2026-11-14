/**
 * Migrasi data lama -> model tenant/host baru.
 *
 * Jalankan sekali setelah deploy:
 *   pnpm migrate:site
 *
 * Aman dijalankan berulang (idempotent).
 */
import { getPayload } from 'payload'
import config from '../payload.config'
import { ensurePlatformTenant } from '../lib/ensurePlatformTenant'
import {
  RESERVED_SLUGS,
  TENANT_SLUG_REGEX,
  slugifyTenantName,
} from '../lib/site'
import { getPlatformHost, isPlatformSubdomain, normalizeHost } from '../lib/urls'

type LegacyTenant = {
  id: string
  name?: string | null
  slug?: string | null
  type?: string | null
  status?: string | null
  domain?: string | null
  hosts?: Array<{ host?: string | null }> | null
}

type LegacyPage = {
  id: string
  slug: string
  tenant?: string | { id: string } | null
  domainType?: 'main' | 'subdomain' | null
  targetDomain?: string | null
}

function tenantIDFrom(page: LegacyPage): string | null {
  if (!page.tenant) return null
  return typeof page.tenant === 'object' ? page.tenant.id : page.tenant
}

function uniqueTenantSlug(
  candidate: string | null | undefined,
  name: string | null | undefined,
  used: Set<string>,
): string {
  const base =
    slugifyTenantName(candidate || name || 'tenant') ||
    `tenant-${Math.random().toString(36).slice(2, 8)}`
  let slug = base

  if (!TENANT_SLUG_REGEX.test(slug) || RESERVED_SLUGS.has(slug)) {
    slug = `${base}-site`.slice(0, 32).replace(/-+$/g, '')
  }

  let counter = 2
  while (used.has(slug) || RESERVED_SLUGS.has(slug)) {
    slug = `${base}-${counter}`.slice(0, 32).replace(/-+$/g, '')
    counter += 1
  }

  used.add(slug)
  return slug
}

async function main() {
  const payload = await getPayload({ config })
  const platform = await ensurePlatformTenant(payload)

  if (!platform) {
    throw new Error('Tenant platform tidak tersedia dan auto-seed dimatikan.')
  }

  const tenants = await payload.find({
    collection: 'tenants',
    limit: 5000,
    depth: 0,
    overrideAccess: true,
    pagination: false,
  })

  const usedSlugs = new Set<string>()
  for (const tenant of tenants.docs as LegacyTenant[]) {
    if (tenant.slug) usedSlugs.add(tenant.slug)
  }

  const platformHost = getPlatformHost()
  const tenantByLegacyHost = new Map<string, string>()
  const tenantBySlug = new Map<string, string>()

  for (const tenant of tenants.docs as LegacyTenant[]) {
    const patch: Record<string, unknown> = {}
    const isPlatform = tenant.id === platform.id

    if (!tenant.type) patch.type = isPlatform ? 'platform' : 'individual'
    if (!tenant.status) patch.status = 'active'

    if (isPlatform) {
      if (!tenant.slug) patch.slug = platform.slug
    } else {
      const slug = uniqueTenantSlug(tenant.slug, tenant.name, usedSlugs)
      if (slug !== tenant.slug) patch.slug = slug
      tenantBySlug.set(slug, tenant.id)
    }

    const hosts = tenant.hosts || []
    if (hosts.length === 0) {
      const legacyHost = normalizeHost(tenant.domain)
      if (legacyHost && (isPlatform || legacyHost !== platformHost)) {
        patch.hosts = [
          {
            host: legacyHost,
            kind:
              isPlatform || !isPlatformSubdomain(legacyHost) ? 'custom' : 'subdomain',
            verified: true,
            isPrimary: true,
          },
        ]
      }
    }

    if (isPlatform) {
      tenantByLegacyHost.set(platformHost, tenant.id)
    }
    for (const entry of hosts) {
      const normalized = normalizeHost(entry.host)
      if (normalized) tenantByLegacyHost.set(normalized, tenant.id)
    }
    if (tenant.domain && !isPlatform) {
      const normalized = normalizeHost(tenant.domain)
      if (normalized) tenantByLegacyHost.set(normalized, tenant.id)
    }

    if (Object.keys(patch).length > 0) {
      await payload.update({
        collection: 'tenants',
        id: tenant.id,
        data: patch,
        depth: 0,
        overrideAccess: true,
        context: { skipTenantValidation: true },
      })
      payload.logger.info(`Tenant diperbarui: ${tenant.name || tenant.id}`)
    }
  }

  const pages = await payload.find({
    collection: 'pages',
    limit: 10000,
    depth: 0,
    overrideAccess: true,
    pagination: false,
  })

  for (const page of pages.docs as LegacyPage[]) {
    let tenantID = tenantIDFrom(page)

    if (!tenantID) {
      if (page.domainType === 'subdomain' && page.targetDomain) {
        const targeted = page.targetDomain.toLowerCase()
        tenantID =
          tenantBySlug.get(targeted) ||
          [...tenantByLegacyHost.entries()].find(([host]) =>
            host.startsWith(`${targeted}.`),
          )?.[1] ||
          platform.id
      } else {
        tenantID = platform.id
      }
    }

    if (tenantIDFrom(page) === tenantID) {
      payload.logger.info(`Page sudah memiliki tenant: /${page.slug}`)
      continue
    }

    await payload.update({
      collection: 'pages',
      id: page.id,
      data: {
        tenant: tenantID,
        slug: page.slug,
      },
      depth: 0,
      overrideAccess: true,
      context: {
        skipSlugValidation: true,
        skipTenantValidation: true,
      },
    })

    payload.logger.info(`Page dimigrasikan: /${page.slug}`)
  }

  payload.logger.info('Migrasi selesai.')
  process.exit(0)
}

try {
  await main()
  process.exit(0)
} catch (error) {
  console.error(error)
  process.exit(1)
}
