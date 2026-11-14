import { Block } from 'payload'

export const liveStatusField: Block = {
  slug: 'LiveStatus',
  labels: { singular: 'Live Status', plural: 'Live Statuses' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'status-list-standard',
      label: 'Varian Tampilan',
      options: [
        { label: 'List Standard', value: 'status-list-standard' },
        { label: 'Card Grid', value: 'status-card-grid' },
        { label: 'Compact Badge', value: 'status-compact-badge' },
        { label: 'Minimal Line', value: 'status-minimal-line' },
        { label: 'Terminal Panel', value: 'status-terminal-panel' },
      ],
    },
    { name: 'sectionBadge', type: 'text', label: 'Badge Seksi' },
    { name: 'sectionTitle', type: 'text', required: true, label: 'Judul Seksi' },
    { name: 'sectionSubtitle', type: 'textarea', label: 'Subjudul Seksi' },
    { name: 'overallStatusText', type: 'text', label: 'Teks Status Keseluruhan' },
    {
      name: 'services',
      type: 'array',
      label: 'Daftar Layanan',
      fields: [
        { name: 'serviceName', type: 'text', required: true, label: 'Nama Layanan' },
        { name: 'uptimePercentage', type: 'text', required: true, label: 'Uptime (%)' },
        { name: 'statusText', type: 'text', required: true, label: 'Teks Status' },
        { name: 'latency', type: 'text', label: 'Latensi' },
      ],
    },
  ],
}
