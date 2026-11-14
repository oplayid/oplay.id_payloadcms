import { Block } from 'payload'

export const metricsTickerField: Block = {
  slug: 'MetricsTicker',
  labels: {
    singular: 'Metrics Ticker',
    plural: 'Metrics Tickers',
  },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'ticker-card',
      label: 'Pilih Varian Tampilan',
      options: [
        { label: 'Ticker Minimal (Garis Pemisah)', value: 'ticker-minimal' },
        { label: 'Ticker Card (Kotak Grid Standar)', value: 'ticker-card' },
        { label: 'Ticker Glow (Efek Cahaya Futuristik)', value: 'ticker-glow' },
        { label: 'Ticker Vertical (Tumpuk Vertikal)', value: 'ticker-vertical' },
        { label: 'Ticker Compact (Bar Sebaris Kompak)', value: 'ticker-compact' },
      ],
    },
    {
      name: 'sectionBadge',
      type: 'text',
      label: 'Badge Seksi (Opsional)',
      admin: {
        description: 'Contoh: Performa Sistem Real-Time',
      },
    },
    {
      name: 'sectionTitle',
      type: 'text',
      label: 'Judul Seksi (Opsional)',
    },
    {
      name: 'sectionSubtitle',
      type: 'textarea',
      label: 'Subjudul Seksi (Opsional)',
    },
    {
      name: 'metrics',
      type: 'array',
      label: 'Daftar Kotak Metrik',
      minRows: 1,
      maxRows: 8,
      admin: {
        description: 'Tambahkan item statistik atau metrik yang ingin ditampilkan.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          label: 'Label Metrik (Contoh: Kasus Diproses)',
        },
        {
          name: 'value',
          type: 'text',
          required: true,
          label: 'Nilai Angka / Teks (Contoh: 1,420+)',
        },
        {
          name: 'trend',
          type: 'text',
          label: 'Tren / Keterangan Kecil (Contoh: +18.4% atau Aman)',
        },
      ],
    },
  ],
}
