import { Block } from 'payload'

export const companyHubField: Block = {
  slug: 'CompanyHub',
  labels: { singular: 'Company Hub', plural: 'Company Hubs' },
  fields: [
    { name: 'sectionBadge', type: 'text', label: 'Badge Seksi' },
    {
      name: 'tabs',
      type: 'array',
      label: 'Tab',
      fields: [
        { name: 'id', type: 'text', required: true, label: 'ID Tab' },
        { name: 'label', type: 'text', required: true, label: 'Label' },
        { name: 'title', type: 'text', required: true, label: 'Judul' },
        { name: 'subtitle', type: 'text', required: true, label: 'Subjudul' },
        { name: 'content', type: 'textarea', required: true, label: 'Konten' },
        {
          name: 'extraDetails',
          type: 'array',
          label: 'Detail Tambahan',
          fields: [
            { name: 'label', type: 'text', label: 'Label' },
            { name: 'value', type: 'text', label: 'Nilai' },
          ],
        },
      ],
    },
  ],
}
