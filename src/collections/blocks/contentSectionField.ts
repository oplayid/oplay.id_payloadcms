import { Block } from 'payload'

export const contentSectionField: Block = {
  slug: 'ContentSection',
  labels: { singular: 'Content Section', plural: 'Content Sections' },
  fields: [
    { name: 'badge', type: 'text', label: 'Badge' },
    { name: 'title', type: 'text', required: true, label: 'Judul' },
    { name: 'description', type: 'textarea', required: true, label: 'Deskripsi' },
    { name: 'layout', type: 'select', options: ['split-left', 'split-right', 'stacked'], label: 'Layout' },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Gambar',
    },
    {
      name: 'cta',
      type: 'group',
      label: 'CTA',
      fields: [
        { name: 'label', type: 'text', required: true, label: 'Label' },
        { name: 'href', type: 'text', required: true, label: 'Link' },
      ],
    },
  ],
}
