import { Block } from 'payload'

/**
 * Detail acara: tanggal, waktu, lokasi + tombol Maps, dress code, rundown,
 * dan kontak penyelenggara. Semua data berasal dari dokumen `events`.
 */
export const eventDetailsField: Block = {
  slug: 'EventDetails',
  labels: { singular: 'Detail Acara', plural: 'Detail Acara' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'details-cards',
      label: 'Varian Tampilan',
      options: [
        { label: 'Kartu-kartu', value: 'details-cards' },
        { label: 'Daftar rapi', value: 'details-list' },
        { label: 'Minimal', value: 'details-minimal' },
      ],
    },
    { name: 'sectionBadge', type: 'text', label: 'Badge Seksi' },
    {
      name: 'sectionTitle',
      type: 'text',
      defaultValue: 'Detail Acara',
      label: 'Judul Seksi',
    },
    { name: 'sectionSubtitle', type: 'textarea', label: 'Subjudul Seksi' },
    {
      name: 'showDate',
      type: 'checkbox',
      defaultValue: true,
      label: 'Tampilkan tanggal',
    },
    {
      name: 'showTime',
      type: 'checkbox',
      defaultValue: true,
      label: 'Tampilkan waktu',
    },
    {
      name: 'showVenue',
      type: 'checkbox',
      defaultValue: true,
      label: 'Tampilkan lokasi',
    },
    {
      name: 'showMaps',
      type: 'checkbox',
      defaultValue: true,
      label: 'Tampilkan tombol Google Maps',
    },
    {
      name: 'mapsButtonLabel',
      type: 'text',
      defaultValue: 'Buka di Google Maps',
      label: 'Label Tombol Maps',
    },
    {
      name: 'showDressCode',
      type: 'checkbox',
      defaultValue: true,
      label: 'Tampilkan dress code',
    },
    {
      name: 'showHost',
      type: 'checkbox',
      defaultValue: true,
      label: 'Tampilkan kontak penyelenggara',
    },
    {
      name: 'showRundown',
      type: 'checkbox',
      defaultValue: true,
      label: 'Tampilkan susunan acara',
    },
    {
      name: 'rundownTitle',
      type: 'text',
      defaultValue: 'Susunan Acara',
      label: 'Judul Susunan Acara',
    },
    {
      name: 'note',
      type: 'textarea',
      label: 'Catatan Tambahan (opsional)',
    },
  ],
}
