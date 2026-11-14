// src/collections/Users.ts
import type { CollectionConfig } from 'payload'
import { isSuperAdmin, superAdminFieldOnly, superAdminOnly } from '@/access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'tenants', 'updatedAt'],
  },
  auth: true,
  access: {
    // Superadmin melihat semua. User biasa hanya melihat dirinya sendiri.
    // Plugin multi-tenant menambahkan constraint tenant untuk admin tenant.
    read: ({ req }) => {
      if (!req.user) return false
      if (isSuperAdmin(req.user)) return true
      return { id: { equals: req.user.id } }
    },
    create: superAdminOnly,
    delete: superAdminOnly,
    update: ({ req }) => {
      if (!req.user) return false
      if (isSuperAdmin(req.user)) return true
      return { id: { equals: req.user.id } }
    },
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'member',
      saveToJWT: true,
      options: [
        { label: 'Member', value: 'member' },
        { label: 'Superadmin', value: 'superadmin' },
      ],
      access: {
        create: superAdminFieldOnly,
        update: superAdminFieldOnly,
      },
      admin: {
        position: 'sidebar',
        description:
          'Superadmin dapat mengelola semua tenant, domain, dan pengguna. Member hanya mengelola tenant yang di-assign.',
      },
    },
  ],
}
