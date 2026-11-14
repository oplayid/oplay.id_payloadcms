import { Block } from 'payload'

export const trustComplianceField: Block = {
  slug: 'TrustCompliance',
  labels: { singular: 'Trust & Compliance', plural: 'Trust & Compliance' },
  fields: [
    { name: 'sectionBadge', type: 'text', label: 'Badge Seksi' },
    { name: 'sectionTitle', type: 'text', required: true, label: 'Judul Seksi' },
    { name: 'sectionSubtitle', type: 'textarea', label: 'Subjudul Seksi' },
    {
      name: 'items',
      type: 'array',
      label: 'Item Kepatuhan',
      fields: [
        { name: 'title', type: 'text', required: true, label: 'Judul' },
        { name: 'description', type: 'textarea', required: true, label: 'Deskripsi' },
        { name: 'code', type: 'text', label: 'Kode / Standar' },
      ],
    },
  ],
}
