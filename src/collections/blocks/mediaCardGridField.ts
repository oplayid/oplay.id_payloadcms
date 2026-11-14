import { Block } from 'payload'

export const mediaCardGridField: Block = {
  slug: 'MediaCardGrid',
  labels: { singular: 'Media Card Grid', plural: 'Media Card Grids' },
  fields: [
    { name: 'sectionBadge', type: 'text', label: 'Badge Seksi' },
    { name: 'sectionTitle', type: 'text', required: true, label: 'Judul Seksi' },
    { name: 'sectionSubtitle', type: 'textarea', label: 'Subjudul Seksi' },
    {
      name: 'items',
      type: 'array',
      label: 'Item Media',
      fields: [
        {
          name: 'type',
          type: 'select',
          defaultValue: 'image',
          label: 'Tipe Media',
          options: [
            { label: 'Gambar', value: 'image' },
            { label: 'Video', value: 'video' },
          ],
        },
        {
          name: 'src',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'File Media (Gambar/Video)',
        },
        {
          name: 'poster',
          type: 'upload',
          relationTo: 'media',
          label: 'Poster Video (Opsional)',
        },
        { name: 'title', type: 'text', required: true, label: 'Judul' },
        { name: 'subtitle', type: 'text', label: 'Subjudul' },
        { name: 'category', type: 'text', label: 'Kategori' },
        { name: 'href', type: 'text', label: 'Link' },
      ],
    },
  ],
}
