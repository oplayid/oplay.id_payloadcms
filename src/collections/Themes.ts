import { CollectionConfig } from 'payload'
import { superAdminOnly } from '@/access'
import { CACHE_TAGS, invalidateContent } from '@/lib/contentCache'

export const Themes: CollectionConfig = {
  slug: 'themes',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'updatedAt'],
  },
  access: {
    read: () => true,
    // Tema dipakai bersama semua tenant. Mutasi hanya superadmin supaya member
    // tenant mana pun tidak bisa merusak theme milik tenant lain.
    create: superAdminOnly,
    update: superAdminOnly,
    delete: superAdminOnly,
  },
  hooks: {
    afterChange: [
      async () => {
        await invalidateContent([CACHE_TAGS.themes])
      },
    ],
    afterDelete: [
      async () => {
        await invalidateContent([CACHE_TAGS.themes])
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nama Tema (Contoh: Default Main Theme)',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug Tema (Contoh: default-theme, cyber-neon)',
    },
    {
      name: 'themeData',
      type: 'json',
      required: true,
      label: 'Konfigurasi JSON Tema',
      admin: {
        description:
          'Tempelkan (paste) struktur JSON tema lengkap yang berisi colors, fonts, effects, dan layout di sini.',
      },
    },
  ],
}
