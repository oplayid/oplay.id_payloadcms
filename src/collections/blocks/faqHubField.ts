import { Block } from 'payload'

export const faqHubField: Block = {
  slug: 'FAQHub',
  labels: { singular: 'FAQ Hub', plural: 'FAQ Hubs' },
  fields: [
    { name: 'sectionBadge', type: 'text', label: 'Badge Seksi' },
    { name: 'sectionTitle', type: 'text', required: true, label: 'Judul Seksi' },
    { name: 'sectionSubtitle', type: 'text', label: 'Subjudul Seksi' },
    { name: 'variant', type: 'select', options: ['list', 'bento'], label: 'Varian' },
    { name: 'enableAICopilot', type: 'checkbox', label: 'Aktifkan AI Copilot' },
    {
      name: 'faqs',
      type: 'array',
      label: 'Daftar FAQ',
      fields: [
        { name: 'question', type: 'text', required: true, label: 'Pertanyaan' },
        { name: 'answer', type: 'textarea', required: true, label: 'Jawaban' },
        { name: 'category', type: 'text', label: 'Kategori' },
      ],
    },
  ],
}
