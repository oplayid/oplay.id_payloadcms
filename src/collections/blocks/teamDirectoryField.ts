import { Block } from 'payload'

export const teamDirectoryField: Block = {
  slug: 'TeamDirectory',
  labels: { singular: 'Team Directory', plural: 'Team Directories' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'team-portrait-grid',
      label: 'Varian Tampilan',
      options: [
        { label: 'Portrait Grid', value: 'team-portrait-grid' },
        { label: 'Horizontal Card', value: 'team-horizontal-card' },
        { label: 'Minimal Avatar', value: 'team-minimal-avatar' },
        { label: 'Interactive Overlay', value: 'team-interactive-overlay' },
        { label: 'Executive Spotlight', value: 'team-executive-spotlight' },
      ],
    },
    { name: 'sectionBadge', type: 'text', label: 'Badge Seksi' },
    { name: 'sectionTitle', type: 'text', required: true, label: 'Judul Seksi' },
    { name: 'sectionSubtitle', type: 'textarea', label: 'Subjudul Seksi' },
    {
      name: 'members',
      type: 'array',
      label: 'Daftar Anggota',
      fields: [
        { name: 'name', type: 'text', required: true, label: 'Nama' },
        { name: 'role', type: 'text', required: true, label: 'Peran' },
        { name: 'bio', type: 'textarea', required: true, label: 'Biografi' },
        { name: 'badge', type: 'text', label: 'Badge' },
        {
          name: 'skills',
          type: 'text',
          hasMany: true,
          label: 'Keahlian',
        },
        {
          name: 'imageUrl',
          type: 'upload',
          relationTo: 'media',
          label: 'Foto Profil',
        },
      ],
    },
  ],
}
