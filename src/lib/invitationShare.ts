/**
 * Helper link undangan absolut.
 *
 * Dipakai panel "Bagikan Undangan" di admin dan hasil ekspor CSV impor tamu,
 * supaya keduanya memakai host/domain tenant yang sama.
 */

export type InvitationTenantInfo = {
  slug?: string | null
  type?: string | null
  hosts?: Array<{
    host?: string | null
    isPrimary?: boolean | null
  }> | null
}

export type InvitationLinkBase = {
  origin: string
  basePath: string
}

/**
 * Menentukan origin + base path dari data tenant.
 *
 * - Tenant dengan host (custom domain/subdomain) memakai host primer.
 * - Tanpa host: memakai origin browser dan subpath `/<slug>` bila perlu.
 */
export function resolveInvitationLinkBase(
  tenant: InvitationTenantInfo | null | undefined,
  fallbackOrigin = '',
): InvitationLinkBase {
  const hosts = Array.isArray(tenant?.hosts) ? tenant.hosts : []
  const primary =
    hosts.find((entry) => entry?.isPrimary && entry?.host)?.host || hosts[0]?.host || ''

  const protocol =
    primary && !primary.includes('localhost') && !/^127\./.test(primary) ? 'https' : 'http'

  const origin = primary ? `${protocol}://${primary}` : fallbackOrigin
  const basePath =
    primary || tenant?.type === 'platform' || !tenant?.slug ? '' : `/${tenant.slug}`

  return { origin, basePath }
}

export function buildAbsoluteInvitationLink(
  linkSlug: string | null | undefined,
  tenant: InvitationTenantInfo | null | undefined,
  fallbackOrigin = '',
): string {
  const slug = String(linkSlug || '').trim()
  if (!slug) return ''

  const { origin, basePath } = resolveInvitationLinkBase(tenant, fallbackOrigin)
  return `${origin}${basePath}/undangan/${slug}`
}

export function buildInvitationWhatsAppLink(link: string, phone: string | null | undefined): string {
  if (!link) return ''

  const digits = String(phone || '').replace(/[^\d]/g, '')
  const normalized = digits.startsWith('0') ? `62${digits.slice(1)}` : digits
  const text = `Berikut link undangan kami: ${link}`

  return `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`
}
