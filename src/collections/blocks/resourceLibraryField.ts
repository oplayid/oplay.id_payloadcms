import { Block } from 'payload'

export const resourceLibraryField: Block = {
  slug: 'ResourceLibrary',
  labels: { singular: 'Resource Library', plural: 'Resource Libraries' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'resource-card-grid',
      label: 'Varian Tampilan',
      options: [
        { label: 'Card Grid', value: 'resource-card-grid' },
        { label: 'Table List', value: 'resource-table-list' },
        { label: 'Featured Download', value: 'resource-featured-download' },
        { label: 'Category Tabs', value: 'resource-category-tabs' },
        { label: 'Minimal Card', value: 'resource-minimal-card' },
      ],
    },
    { name: 'sectionBadge', type: 'text', label: 'Badge Seksi' },
    { name: 'sectionTitle', type: 'text', required: true, label: 'Judul Seksi' },
    { name: 'sectionSubtitle', type: 'textarea', label: 'Subjudul Seksi' },
    {
      name: 'resources',
      type: 'array',
      label: 'Daftar Sumber Daya',
      fields: [
        { name: 'title', type: 'text', required: true, label: 'Judul' },
        { name: 'category', type: 'text', required: true, label: 'Kategori' },
        { name: 'description', type: 'textarea', required: true, label: 'Deskripsi' },
        { name: 'fileType', type: 'text', required: true, label: 'Tipe File (mis. PDF)' },
        { name: 'fileSize', type: 'text', required: true, label: 'Ukuran File' },
        { name: 'downloadHref', type: 'text', required: true, label: 'Link Unduhan' },
      ],
    },
  ],
}
