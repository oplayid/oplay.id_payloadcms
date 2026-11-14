import { Block } from 'payload'

export const processRoadmapField: Block = {
  slug: 'ProcessRoadmap',
  labels: { singular: 'Process Roadmap', plural: 'Process Roadmaps' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'roadmap-horizontal-cards',
      label: 'Varian Tampilan',
      options: [
        { label: 'Horizontal Cards', value: 'roadmap-horizontal-cards' },
        { label: 'Vertical Timeline', value: 'roadmap-vertical-timeline' },
        { label: 'Numbered Steps', value: 'roadmap-numbered-steps' },
        { label: 'Interactive Steps', value: 'roadmap-interactive-steps' },
        { label: 'Compact Pills', value: 'roadmap-compact-pills' },
      ],
    },
    { name: 'sectionBadge', type: 'text', label: 'Badge Seksi' },
    { name: 'sectionTitle', type: 'text', required: true, label: 'Judul Seksi' },
    { name: 'sectionSubtitle', type: 'textarea', label: 'Subjudul Seksi' },
    {
      name: 'steps',
      type: 'array',
      label: 'Langkah Proses',
      fields: [
        { name: 'stepNumber', type: 'text', required: true, label: 'Nomor Langkah' },
        { name: 'title', type: 'text', required: true, label: 'Judul' },
        { name: 'description', type: 'textarea', required: true, label: 'Deskripsi' },
      ],
    },
  ],
}
