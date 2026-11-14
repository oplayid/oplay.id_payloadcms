import { Block } from 'payload'

export const integrationGridField: Block = {
  slug: 'IntegrationGrid',
  labels: { singular: 'Integration Grid', plural: 'Integration Grids' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'integration-grid-standard',
      label: 'Varian Tampilan',
      options: [
        { label: 'Grid Standard', value: 'integration-grid-standard' },
        { label: 'Horizontal List', value: 'integration-horizontal-list' },
        { label: 'Minimal Pills', value: 'integration-minimal-pills' },
        { label: 'Glow Cards', value: 'integration-glow-cards' },
        { label: 'Category Grouped', value: 'integration-category-grouped' },
      ],
    },
    { name: 'sectionBadge', type: 'text', label: 'Badge Seksi' },
    { name: 'sectionTitle', type: 'text', required: true, label: 'Judul Seksi' },
    { name: 'sectionSubtitle', type: 'textarea', label: 'Subjudul Seksi' },
    {
      name: 'integrations',
      type: 'array',
      label: 'Daftar Integrasi',
      fields: [
        { name: 'name', type: 'text', required: true, label: 'Nama Integrasi' },
        { name: 'category', type: 'text', required: true, label: 'Kategori' },
        { name: 'description', type: 'textarea', required: true, label: 'Deskripsi' },
        { name: 'status', type: 'text', label: 'Status' },
      ],
    },
  ],
}
