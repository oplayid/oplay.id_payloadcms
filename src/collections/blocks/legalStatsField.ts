import { Block } from 'payload'

export const legalStatsField: Block = {
  slug: 'LegalStats',
  labels: { singular: 'Legal Stats', plural: 'Legal Stats' },
  fields: [
    {
      name: 'labels',
      type: 'group',
      label: 'Label Statistik',
      fields: [
        { name: 'cases', type: 'text', label: 'Label Kasus' },
        { name: 'clients', type: 'text', label: 'Label Klien' },
        { name: 'accuracy', type: 'text', label: 'Label Akurasi' },
        { name: 'uptime', type: 'text', label: 'Label Uptime' },
      ],
    },
    { name: 'casesProcessed', type: 'text', label: 'Nilai Kasus Diproses' },
    { name: 'activeClients', type: 'text', label: 'Nilai Klien Aktif' },
    { name: 'aiAccuracy', type: 'text', label: 'Nilai Akurasi AI' },
    { name: 'uptime', type: 'text', label: 'Nilai Uptime' },
  ],
}
