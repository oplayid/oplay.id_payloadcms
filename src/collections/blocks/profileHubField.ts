import { Block } from 'payload'

export const profileHubField: Block = {
  slug: 'ProfileHub',
  labels: { singular: 'Profile Hub', plural: 'Profile Hubs' },
  fields: [
    { name: 'sectionBadge', type: 'text', label: 'Badge Seksi' },
    { name: 'sectionTitle', type: 'text', required: true, label: 'Judul Seksi' },
    { name: 'sectionSubtitle', type: 'textarea', label: 'Subjudul Seksi' },
    {
      name: 'enableCategoryFilter',
      type: 'checkbox',
      defaultValue: false,
      label: 'Aktifkan Filter Kategori',
    },
    {
      name: 'profiles',
      type: 'array',
      label: 'Daftar Profil',
      fields: [
        { name: 'id', type: 'text', required: true, label: 'ID Unik' },
        { name: 'name', type: 'text', required: true, label: 'Nama' },
        { name: 'role', type: 'text', required: true, label: 'Peran / Jabatan' },
        { name: 'category', type: 'text', label: 'Kategori' },
        {
          name: 'avatarUrl',
          type: 'upload',
          relationTo: 'media',
          label: 'Foto Profil',
        },
        { name: 'bio', type: 'textarea', label: 'Biografi' },
        { name: 'badge', type: 'text', label: 'Badge' },
        {
          name: 'metrics',
          type: 'array',
          label: 'Metrik',
          fields: [
            { name: 'label', type: 'text', label: 'Label' },
            { name: 'value', type: 'text', label: 'Nilai' },
          ],
        },
        {
          name: 'skills',
          type: 'text',
          hasMany: true,
          label: 'Keahlian',
        },
        {
          name: 'socialLinks',
          type: 'array',
          label: 'Tautan Sosial',
          fields: [
            { name: 'platform', type: 'text', required: true, label: 'Platform' },
            { name: 'href', type: 'text', required: true, label: 'URL' },
          ],
        },
      ],
    },
  ],
}
