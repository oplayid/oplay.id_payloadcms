import { Block } from 'payload'

/**
 * Hero halaman detail undangan.
 *
 * Blok ini diletakkan tepat setelah cover. Isinya ringkasan acara yang paling
 * lengkap (judul, tanggal, waktu, lokasi, pesan pembuka) sehingga tamu langsung
 * tahu acara apa yang sedang dibuka.
 */
export const eventHeroField: Block = {
  slug: 'EventHero',
  labels: { singular: 'Hero Acara', plural: 'Hero Acara' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'hero-arch',
      label: 'Varian Tampilan',
      options: [
        { label: 'Lengkung dengan foto', value: 'hero-arch' },
        { label: 'Foto penuh', value: 'hero-photo' },
        { label: 'Tipografi bersih', value: 'hero-minimal' },
      ],
    },
    {
      name: 'eyebrow',
      type: 'text',
      defaultValue: 'Kami mengundang Anda',
      label: 'Teks Kecil di Atas Judul',
    },
    {
      name: 'titleOverride',
      type: 'text',
      label: 'Judul Khusus Hero (opsional)',
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Gambar Latar (opsional)',
      admin: { description: 'Kosongkan untuk memakai gambar cover acara.' },
    },
    {
      name: 'overlayOpacity',
      type: 'number',
      defaultValue: 58,
      min: 0,
      max: 95,
      label: 'Intensitas Overlay Foto (%)',
    },
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
      name: 'showOpeningMessage',
      type: 'checkbox',
      defaultValue: true,
      label: 'Tampilkan pesan pembuka acara',
    },
    {
      name: 'openingMessageOverride',
      type: 'textarea',
      label: 'Pesan Pembuka Khusus Hero (opsional)',
      admin: { description: 'Kosongkan untuk memakai pesan pembuka dari data acara.' },
    },
    {
      name: 'scrollHint',
      type: 'text',
      defaultValue: 'Detail acara',
      label: 'Teks Penunjuk Gulir',
    },
    {
      name: 'note',
      type: 'textarea',
      label: 'Catatan Tambahan (opsional)',
    },
  ],
}
