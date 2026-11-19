// src/collections/Users.ts
import { APIError, type CollectionConfig } from 'payload'
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
  hooks: {
    beforeChange: [
      ({ data, originalDoc, operation, req }) => {
        // Email adalah identity field. Member tidak boleh menggantinya sendiri,
        // karena beberapa proses lama dulu memakai email untuk menentukan role.
        if (operation === 'update' && req.user && !isSuperAdmin(req.user)) {
          const nextEmail =
            typeof data?.email === 'string' ? data.email.trim().toLowerCase() : null
          const previousEmail =
            typeof originalDoc?.email === 'string' ? originalDoc.email.toLowerCase() : null

          if (nextEmail && previousEmail && nextEmail !== previousEmail) {
            throw new APIError('Email tidak dapat diubah sendiri. Hubungi superadmin.', 403)
          }
        }
        return data
      },
    ],
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
    {
      /**
       * Penanda bahwa password akun ini dikelola oleh SSO, bukan oleh pemiliknya.
       * Callback SSO hanya boleh merotasi password akun bertanda ini — akun
       * dengan password lokal tidak pernah ditimpa.
       */
      name: 'ssoManaged',
      type: 'checkbox',
      defaultValue: false,
      label: 'Akun dikelola SSO',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Dikelola otomatis oleh alur SSO. Jangan diubah manual.',
      },
      access: {
        update: superAdminFieldOnly,
      },
    },
  ],
}
