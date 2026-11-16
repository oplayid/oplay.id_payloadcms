import { getPayload } from 'payload'
import config from '@payload-config'
import type { Redirect } from '@/payload-types'
import { CACHE_TAGS, cacheQuery } from './contentCache'
import { isInternalRedirectTarget, normalizeRedirectTarget } from './redirectPath'
import { localizePath, normalizePagePath } from './urls'
import { resolveSiteContext } from './site'

/**
 * Resolusi redirect lama -> baru.
 *
 * Data redirect ditulis oleh `lib/pageRedirectSync` (otomatis saat halaman
 * di-rename) atau manual lewat koleksi `redirects`.
 */

const MAX_HOPS = 5

export type RedirectTarget = {
  to: string
  statusCode: '301' | '302'
}

async function queryRedirectTarget(
  tenantID: string,
  from: string,
): Promise<RedirectTarget | null> {
  const payload = await getPayload({ config })
  let current = from
  let statusCode: RedirectTarget['statusCode'] = '301'
  const visited = new Set<string>()

  for (let hop = 0; hop < MAX_HOPS; hop += 1) {
    if (visited.has(current)) return null
    visited.add(current)

    const { docs } = await payload.find({
      collection: 'redirects',
      where: {
        and: [{ tenant: { equals: tenantID } }, { from: { equals: current } }],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const redirect = docs[0] as Redirect | undefined

    // Ujung rantai: kalau bukan redirect pertama, `current` adalah tujuannya.
    if (!redirect) {
      if (hop === 0) return null
      return { to: current, statusCode }
    }

    if (hop === 0) {
      statusCode = redirect.statusCode === '302' ? '302' : '301'
    }

    const target = normalizeRedirectTarget(redirect.to)
    if (!target) return null
    if (!isInternalRedirectTarget(target)) return { to: target, statusCode }
    if (target === current) return null

    current = target
  }

  // Rantai terlalu panjang / melingkar: jangan menebak.
  return null
}

const cachedRedirectTarget = cacheQuery(
  { key: 'redirect-target', tags: [CACHE_TAGS.redirects] },
  queryRedirectTarget,
)

/** Tujuan redirect untuk sebuah path lama, atau null bila tidak ada. */
export async function findRedirectTarget(
  tenantID: string,
  pagePath: string,
): Promise<RedirectTarget | null> {
  if (!tenantID) return null
  const from = normalizePagePath(pagePath)
  return cachedRedirectTarget(tenantID, from)
}

/**
 * URL tujuan redirect untuk request saat ini (sudah memperhitungkan
 * basePath subpath dan prefix locale).
 */
export async function getRedirectURL({
  host,
  segments,
}: {
  host: string | null | undefined
  segments: string[]
}): Promise<{ url: string; statusCode: RedirectTarget['statusCode'] } | null> {
  const site = await resolveSiteContext({ host, segments })
  if (!site) return null

  const target = await findRedirectTarget(site.tenant.id, site.pagePath)
  if (!target) return null

  const url = isInternalRedirectTarget(target.to)
    ? localizePath(target.to, site.basePath, site.locale)
    : target.to

  return { url, statusCode: target.statusCode }
}
