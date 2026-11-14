import { Block } from 'payload'

export const createDefaultBlock = (slug: string, variants: string[]): Block => ({
  slug: slug,
  labels: { singular: slug, plural: `${slug}s` },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: variants[0] || 'default',
      options: variants.map((v) => ({ label: v, value: v })),
      label: 'Pilih Varian Tampilan',
    },
    {
      name: 'contentTitle',
      type: 'text',
      label: 'Judul Konten',
    },
    {
      name: 'contentDescription',
      type: 'textarea',
      label: 'Deskripsi / Catatan',
    },
  ],
})
