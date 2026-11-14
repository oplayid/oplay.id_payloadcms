import { Block } from 'payload'

export const pricingTiersField: Block = {
  slug: 'PricingTiers',
  labels: { singular: 'Pricing Tiers', plural: 'Pricing Tiers' },
  fields: [
    { name: 'sectionBadge', type: 'text', label: 'Badge Seksi' },
    { name: 'sectionTitle', type: 'text', required: true, label: 'Judul Seksi' },
    { name: 'sectionSubtitle', type: 'textarea', label: 'Subjudul Seksi' },
    {
      name: 'plans',
      type: 'array',
      label: 'Paket Harga',
      fields: [
        { name: 'name', type: 'text', required: true, label: 'Nama Paket' },
        { name: 'price', type: 'text', required: true, label: 'Harga' },
        { name: 'period', type: 'text', label: 'Periode' },
        { name: 'description', type: 'textarea', label: 'Deskripsi' },
        {
          name: 'features',
          type: 'text',
          hasMany: true,
          label: 'Fitur',
        },
        { name: 'isPopular', type: 'checkbox', label: 'Tandai Populer' },
        { name: 'ctaLabel', type: 'text', label: 'Label Tombol' },
        { name: 'ctaHref', type: 'text', label: 'Link Tombol' },
      ],
    },
  ],
}
