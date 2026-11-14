import { Block } from 'payload'

export const enterpriseCalloutField: Block = {
  slug: 'EnterpriseCallout',
  labels: { singular: 'Enterprise Callout', plural: 'Enterprise Callouts' },
  fields: [
    { name: 'badge', type: 'text', label: 'Badge' },
    { name: 'title', type: 'text', required: true, label: 'Judul' },
    { name: 'description', type: 'textarea', required: true, label: 'Deskripsi' },
    {
      name: 'primaryCta',
      type: 'group',
      label: 'CTA Utama',
      fields: [
        { name: 'label', type: 'text', required: true, label: 'Label' },
        { name: 'href', type: 'text', required: true, label: 'Link' },
      ],
    },
    {
      name: 'secondaryCta',
      type: 'group',
      label: 'CTA Sekunder',
      fields: [
        { name: 'label', type: 'text', label: 'Label' },
        { name: 'href', type: 'text', label: 'Link' },
      ],
    },
  ],
}
