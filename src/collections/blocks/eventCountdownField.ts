import { Block } from 'payload'

/**
 * Hitung mundur generik untuk halaman Pages.
 *
 * Berbeda dengan `countdownField` (khusus undangan yang membaca Events), blok
 * ini menyimpan target waktu di dalam dirinya sendiri sehingga bisa dipakai
 * untuk acara, promo, deadline pendaftaran, peluncuran produk, dll.
 */
export const eventCountdownField: Block = {
  slug: 'EventCountdown',
  labels: {
    singular: 'Hitung Mundur (Umum)',
    plural: 'Hitung Mundur (Umum)',
  },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'countdown-cards',
      label: 'Varian Tampilan',
      options: [
        { label: 'Kartu-kartu', value: 'countdown-cards' },
        { label: 'Satu baris', value: 'countdown-inline' },
        { label: 'Minimal', value: 'countdown-minimal' },
      ],
    },
    { name: 'sectionBadge', type: 'text', label: 'Badge Seksi' },
    {
      name: 'sectionTitle',
      type: 'text',
      defaultValue: 'Menuju Waktu Tertentu',
      label: 'Judul Seksi',
    },
    { name: 'sectionSubtitle', type: 'textarea', label: 'Subjudul Seksi' },
    {
      name: 'targetDate',
      type: 'date',
      required: true,
      label: 'Waktu Target',
      admin: {
        description:
          'Tanggal DAN jam target. Countdown dihitung absolut dari nilai ini, bukan dari dokumen Events.',
      },
    },
    {
      name: 'timezone',
      type: 'text',
      defaultValue: 'Asia/Jakarta',
      label: 'Zona Waktu Tampilan (IANA)',
      admin: {
        description:
          'Hanya untuk format tanggal yang ditampilkan, mis. Asia/Jakarta, Asia/Makassar, UTC.',
      },
    },
    {
      name: 'showDate',
      type: 'checkbox',
      defaultValue: true,
      label: 'Tampilkan tanggal target di bawah hitung mundur',
    },
    {
      name: 'showLabels',
      type: 'checkbox',
      defaultValue: true,
      label: 'Tampilkan label Hari/Jam/Menit/Detik',
    },
    {
      name: 'finishedLabel',
      type: 'text',
      defaultValue: 'Waktu telah tiba',
      label: 'Teks Saat Waktu Terlampaui',
    },
    { name: 'note', type: 'textarea', label: 'Catatan Tambahan' },
  ],
}
