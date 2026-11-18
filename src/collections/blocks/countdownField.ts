import { Block } from 'payload'

/**
 * Hitung mundur terpisah dari cover.
 *
 * Dipakai bila desainer ingin countdown tampil di tengah halaman detail,
 * misalnya setelah hero atau sebelum galeri.
 */
export const countdownField: Block = {
  slug: 'Countdown',
  labels: { singular: 'Hitung Mundur', plural: 'Hitung Mundur' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'countdown-cards',
      label: 'Varian Tampilan',
      options: [
        { label: 'Kartu-kartu', value: 'countdown-cards' },
        { label: 'Satu baris', value: 'countdown-inline' },
      ],
    },
    { name: 'sectionBadge', type: 'text', label: 'Badge Seksi' },
    {
      name: 'sectionTitle',
      type: 'text',
      defaultValue: 'Menuju Hari Bahagia',
      label: 'Judul Seksi',
    },
    { name: 'sectionSubtitle', type: 'textarea', label: 'Subjudul Seksi' },
    {
      name: 'showDate',
      type: 'checkbox',
      defaultValue: true,
      label: 'Tampilkan tanggal acara di bawah hitung mundur',
    },
    {
      name: 'finishedLabel',
      type: 'text',
      defaultValue: 'Hari bahagia telah tiba.',
      label: 'Teks Setelah Acara Lewat',
    },
    {
      name: 'note',
      type: 'textarea',
      label: 'Catatan Tambahan (opsional)',
    },
  ],
}
