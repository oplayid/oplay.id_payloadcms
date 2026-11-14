import { Block } from 'payload'

export const comparisonSplitField: Block = {
  slug: 'ComparisonSplit',
  labels: { singular: 'Comparison Split', plural: 'Comparison Splits' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'comparison-two-columns',
      label: 'Varian Tampilan',
      options: [
        { label: 'Two Columns', value: 'comparison-two-columns' },
        { label: 'VS Badge', value: 'comparison-vs-badge' },
        { label: 'Table Format', value: 'comparison-table-format' },
        { label: 'Cards Stacked', value: 'comparison-cards-stacked' },
        { label: 'Highlight After', value: 'comparison-highlight-after' },
      ],
    },
    { name: 'sectionBadge', type: 'text', label: 'Badge Seksi' },
    { name: 'sectionTitle', type: 'text', required: true, label: 'Judul Seksi' },
    { name: 'sectionSubtitle', type: 'textarea', label: 'Subjudul Seksi' },
    { name: 'beforeTitle', type: 'text', required: true, label: 'Judul Sebelum' },
    {
      name: 'beforeItems',
      type: 'array',
      label: 'Item Sebelum',
      fields: [{ name: 'text', type: 'text', required: true, label: 'Teks' }],
    },
    { name: 'afterTitle', type: 'text', required: true, label: 'Judul Sesudah' },
    {
      name: 'afterItems',
      type: 'array',
      label: 'Item Sesudah',
      fields: [{ name: 'text', type: 'text', required: true, label: 'Teks' }],
    },
  ],
}
