import { Block } from 'payload'

/**
 * Cover undangan: nama tamu, judul acara, countdown, dan tombol "Buka Undangan".
 * Data tamu/acara diambil dari konteks undangan, bukan diisi manual di blok.
 */
export const invitationCoverField: Block = {
  slug: 'InvitationCover',
  labels: { singular: 'Cover Undangan', plural: 'Cover Undangan' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'cover-photo',
      label: 'Varian Tampilan',
      options: [
        { label: 'Foto penuh + overlay', value: 'cover-photo' },
        { label: 'Klasik (tanpa foto)', value: 'cover-classic' },
        { label: 'Minimal bersih', value: 'cover-minimal' },
      ],
    },
    {
      name: 'eyebrow',
      type: 'text',
      defaultValue: 'Undangan',
      label: 'Teks Kecil di Atas Judul',
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Gambar Latar (opsional)',
      admin: {
        description: 'Kosongkan untuk memakai gambar cover acara.',
      },
    },
    {
      name: 'overlayOpacity',
      type: 'number',
      defaultValue: 55,
      min: 0,
      max: 95,
      label: 'Intensitas Overlay (%)',
    },
    {
      name: 'showEventTitle',
      type: 'checkbox',
      defaultValue: true,
      label: 'Tampilkan nama acara',
    },
    {
      name: 'eventTitleOverride',
      type: 'text',
      label: 'Judul Acara Khusus Cover (opsional)',
    },
    {
      name: 'showDate',
      type: 'checkbox',
      defaultValue: true,
      label: 'Tampilkan tanggal acara',
    },
    {
      name: 'showGuestName',
      type: 'checkbox',
      defaultValue: true,
      label: 'Tampilkan nama tamu',
    },
    {
      name: 'guestLabel',
      type: 'text',
      defaultValue: 'Kepada Yth.',
      label: 'Label Nama Tamu',
    },
    {
      name: 'showPax',
      type: 'checkbox',
      defaultValue: true,
      label: 'Tampilkan jumlah kursi',
    },
    {
      name: 'showPersonalNote',
      type: 'checkbox',
      defaultValue: true,
      label: 'Tampilkan pesan pribadi untuk tamu',
    },
    {
      name: 'personalNoteLabel',
      type: 'text',
      defaultValue: 'Pesan untuk Anda',
      label: 'Label Pesan Pribadi',
    },
    {
      name: 'showCountdown',
      type: 'checkbox',
      defaultValue: false,
      label: 'Tampilkan hitung mundur',
    },
    {
      name: 'countdownLabel',
      type: 'text',
      defaultValue: 'Menuju hari bahagia',
      label: 'Label Hitung Mundur',
    },
    {
      name: 'openButtonLabel',
      type: 'text',
      defaultValue: 'Buka Undangan',
      label: 'Label Tombol',
    },
    {
      name: 'note',
      type: 'textarea',
      label: 'Catatan Tambahan (opsional)',
    },
  ],
}
