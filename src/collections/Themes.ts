import { CollectionConfig } from 'payload'

export const Themes: CollectionConfig = {
  slug: 'themes',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'updatedAt'],
  },
  access: {
    read: () => true,
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
