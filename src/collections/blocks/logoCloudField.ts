import { Block } from 'payload'

export const logoCloudField: Block = {
  slug: 'LogoCloud',
  labels: { singular: 'Logo Cloud', plural: 'Logo Clouds' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'logo-grid-monochrome',
      label: 'Varian Tampilan',
      options: [
        { label: 'Grid Monochrome', value: 'logo-grid-monochrome' },
        { label: 'Bordered Boxes', value: 'logo-bordered-boxes' },
        { label: 'Glow Cards', value: 'logo-glow-cards' },
        { label: 'Minimal Pills', value: 'logo-minimal-pills' },
        { label: 'Row Clean', value: 'logo-row-clean' },
      ],
    },
    { name: 'sectionBadge', type: 'text', label: 'Badge Seksi' },
    { name: 'sectionTitle', type: 'text', label: 'Judul Seksi' },
    { name: 'sectionSubtitle', type: 'textarea', label: 'Subjudul Seksi' },
    {
      name: 'logos',
      type: 'array',
      label: 'Daftar Logo',
      fields: [
        { name: 'name', type: 'text', required: true, label: 'Nama Brand' },
        {
          name: 'logoSrc',
          type: 'upload',
          relationTo: 'media',
          label: 'File Logo',
        },
      ],
    },
  ],
}
