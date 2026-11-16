import type { Access, FieldAccess } from 'payload'
import type { User } from '@/payload-types'

/**
 * Email superadmin tetap didukung agar instalasi lama tidak kehilangan akses
 * saat field `role` baru ditambahkan. Utamakan field `role`.
 */
function getSuperAdminEmails(): string[] {
  return (process.env.SUPERADMIN_EMAILS || 'management@oplay.id')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function isSuperAdmin(user: User | null | undefined | Record<string, unknown>): boolean {
  if (!user) return false

  const typed = user as Partial<User>
  if (typed.role === 'superadmin') return true
  if (!typed.email) return false

  return getSuperAdminEmails().includes(typed.email.toLowerCase())
}

export function getUserTenantIDs(user: User | null | undefined): string[] {
  if (!user?.tenants?.length) return []

  return user.tenants
    .map((entry) => {
      const tenant = entry?.tenant
      if (!tenant) return null
      return typeof tenant === 'object' ? tenant.id : tenant
    })
    .filter((id): id is string => Boolean(id))
}

export function userHasTenantAccess(
  user: User | null | undefined,
  tenantID: string | undefined | null,
): boolean {
  if (!user) return false
  if (isSuperAdmin(user)) return true
  if (!tenantID) return false
  return getUserTenantIDs(user).includes(tenantID)
}

export const superAdminOnly: Access = ({ req }) => isSuperAdmin(req.user as User | null)

/**
 * Query pembatas dokumen tenant: superadmin melihat semua, user biasa hanya
 * tenant tempat ia terdaftar sebagai anggota.
 */
export function tenantScopeForUser(
  user: User | null | undefined,
): true | false | { id: { in: string[] } } {
  if (!user) return false
  if (isSuperAdmin(user)) return true

  const ids = getUserTenantIDs(user)
  if (ids.length === 0) return false

  return { id: { in: ids } }
}

export const tenantScope: Access = ({ req }) =>
  tenantScopeForUser(req.user as User | null)

export const authenticated: Access = ({ req }) => Boolean(req.user)

export const superAdminFieldOnly: FieldAccess = ({ req }) =>
  isSuperAdmin(req.user as User | null)

export const authenticatedFieldOnly: FieldAccess = ({ req }) => Boolean(req.user)
