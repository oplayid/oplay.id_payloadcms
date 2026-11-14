import { Block } from 'payload'

export const interactiveTabsField: Block = {
  slug: 'InteractiveTabs',
  labels: { singular: 'Interactive Tabs', plural: 'Interactive Tabs' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'tabs-pill-top',
      label: 'Varian Tampilan',
      options: [
        { label: 'Pill Top', value: 'tabs-pill-top' },
        { label: 'Sidebar Layout', value: 'tabs-sidebar-layout' },
        { label: 'Grid Cards', value: 'tabs-grid-cards' },
        { label: 'Terminal Console', value: 'tabs-terminal-console' },
        { label: 'Minimal Underline', value: 'tabs-minimal-underline' },
      ],
    },
    { name: 'sectionBadge', type: 'text', label: 'Badge Seksi' },
    { name: 'sectionTitle', type: 'text', required: true, label: 'Judul Seksi' },
    { name: 'sectionSubtitle', type: 'textarea', label: 'Subjudul Seksi' },
    {
      name: 'tabs',
      type: 'array',
      label: 'Daftar Tab',
      fields: [
        { name: 'id', type: 'text', required: true, label: 'ID Unik' },
        { name: 'label', type: 'text', required: true, label: 'Label Tab' },
        { name: 'title', type: 'text', required: true, label: 'Judul Konten' },
        { name: 'subtitle', type: 'text', required: true, label: 'Subjudul Konten' },
        { name: 'content', type: 'textarea', required: true, label: 'Isi Konten' },
      ],
    },
  ],
}
