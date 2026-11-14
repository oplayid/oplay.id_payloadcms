import { Block } from 'payload'

export const accordionDirectoryField: Block = {
  slug: 'AccordionDirectory',
  labels: { singular: 'Accordion Directory', plural: 'Accordion Directories' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'accordion-vertical-list',
      label: 'Varian Tampilan',
      options: [
        { label: 'Vertical List', value: 'accordion-vertical-list' },
        { label: 'Boxed Cards', value: 'accordion-boxed-cards' },
        { label: 'Category Grouped', value: 'accordion-category-grouped' },
        { label: 'Minimal Lines', value: 'accordion-minimal-lines' },
        { label: 'Expanded First', value: 'accordion-expanded-first' },
      ],
    },
    { name: 'sectionBadge', type: 'text', label: 'Badge Seksi' },
    { name: 'sectionTitle', type: 'text', required: true, label: 'Judul Seksi' },
    { name: 'sectionSubtitle', type: 'textarea', label: 'Subjudul Seksi' },
    {
      name: 'items',
      type: 'array',
      label: 'Daftar Item',
      fields: [
        { name: 'question', type: 'text', required: true, label: 'Pertanyaan / Judul' },
        { name: 'answer', type: 'textarea', required: true, label: 'Jawaban / Isi' },
        { name: 'category', type: 'text', label: 'Kategori' },
      ],
    },
  ],
}
