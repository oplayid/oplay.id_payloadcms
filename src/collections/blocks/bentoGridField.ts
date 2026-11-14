import { Block } from 'payload'

export const bentoGridField: Block = {
  slug: 'BentoGrid',
  labels: { singular: 'Bento Grid', plural: 'Bento Grids' },
  fields: [
    { name: 'sectionTitle', type: 'text', label: 'Judul Seksi' },
    { name: 'sectionSubtitle', type: 'textarea', label: 'Subjudul Seksi' },
    {
      name: 'items',
      type: 'array',
      label: 'Item Grid',
      fields: [
        { name: 'title', type: 'text', required: true, label: 'Judul' },
        { name: 'description', type: 'textarea', required: true, label: 'Deskripsi' },
        { name: 'span', type: 'select', options: ['col-span-1', 'col-span-2', 'md:col-span-2'], label: 'Span' },
        { name: 'badge', type: 'text', label: 'Badge' },
        { name: 'icon', type: 'text', label: 'Ikon' },
        { name: 'href', type: 'text', label: 'Link' },
      ],
    },
  ],
}
