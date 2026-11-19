import type { Access, FieldAccess } from 'payload'
import type { User } from '@/payload-types'

/**
 * Superadmin ditentukan HANYA oleh field `role` (tersimpan di JWT).
 *
 * Dulu ada fallback berdasarkan `SUPERADMIN_EMAILS`. Itu dihapus karena user
 * biasa diizinkan mengubah email sendiri — sehingga email dapat dipakai untuk
 * eskalasi privilege. Untuk memulihkan akses, gunakan script
 * `pnpm promote:superadmin --email=<email>` (butuh akses DB/CLI).
 */
export function isSuperAdmin(user: User | null | undefined | Record<string, unknown>): boolean {
  if (!user) return false

  const typed = user as Partial<User>
  return typed.role === 'superadmin'
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

/**
 * Query pembatas dokumen yang punya field relasi `tenant` (events, guests, ...).
 * Berbeda dengan `tenantScopeForUser` yang membatasi dokumen koleksi `tenants`.
 */
export function tenantContentScopeForUser(
  user: User | null | undefined,
): true | false | { tenant: { in: string[] } } {
  if (!user) return false
  if (isSuperAdmin(user)) return true

  const ids = getUserTenantIDs(user)
  if (ids.length === 0) return false

  return { tenant: { in: ids } }
}

export const tenantContentScope: Access = ({ req }) =>
  tenantContentScopeForUser(req.user as User | null)

export const authenticated: Access = ({ req }) => Boolean(req.user)

export const superAdminFieldOnly: FieldAccess = ({ req }) =>
  isSuperAdmin(req.user as User | null)

export const authenticatedFieldOnly: FieldAccess = ({ req }) => Boolean(req.user)
