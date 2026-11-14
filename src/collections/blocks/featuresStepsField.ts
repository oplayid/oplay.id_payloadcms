import { Block } from 'payload'

export const featuresStepsField: Block = {
  slug: 'FeatureSteps',
  labels: { singular: 'Features Steps', plural: 'Features Steps' },
  fields: [
    { name: 'sectionBadge', type: 'text', label: 'Badge Seksi' },
    { name: 'sectionTitle', type: 'text', required: true, label: 'Judul Seksi' },
    {
      name: 'steps',
      type: 'array',
      label: 'Daftar Langkah',
      fields: [
        { name: 'number', type: 'text', required: true, label: 'Nomor' },
        { name: 'title', type: 'text', required: true, label: 'Judul' },
        { name: 'description', type: 'textarea', required: true, label: 'Deskripsi' },
      ],
    },
  ],
}
