import { Block } from 'payload'

/**
 * Form konfirmasi kehadiran. Status, jumlah kursi, dan deadline diambil dari
 * data tamu + acara. Pengiriman divalidasi ulang di server.
 */
export const rsvpFormField: Block = {
  slug: 'RsvpForm',
  labels: { singular: 'Form RSVP', plural: 'Form RSVP' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'rsvp-card',
      label: 'Varian Tampilan',
      options: [
        { label: 'Kartu', value: 'rsvp-card' },
        { label: 'Polos', value: 'rsvp-plain' },
      ],
    },
    { name: 'sectionBadge', type: 'text', label: 'Badge Seksi' },
    {
      name: 'sectionTitle',
      type: 'text',
      defaultValue: 'Konfirmasi Kehadiran',
      label: 'Judul Seksi',
    },
    {
      name: 'sectionSubtitle',
      type: 'textarea',
      label: 'Subjudul Seksi',
      admin: {
        description: 'Contoh: "Mohon konfirmasi sebelum 1 Desember 2026 agar kami siapkan kursi terbaik."',
      },
    },
    {
      name: 'submitLabel',
      type: 'text',
      defaultValue: 'Kirim Konfirmasi',
      label: 'Label Tombol Kirim',
    },
    {
      name: 'successMessage',
      type: 'text',
      defaultValue: 'Terima kasih! Konfirmasi Anda sudah kami terima.',
      label: 'Pesan Berhasil',
    },
    {
      name: 'closedMessage',
      type: 'text',
      defaultValue: 'Konfirmasi kehadiran sudah ditutup.',
      label: 'Pesan saat RSVP Ditutup',
    },
    {
      name: 'showPax',
      type: 'checkbox',
      defaultValue: true,
      label: 'Tampilkan pilihan jumlah orang',
    },
    {
      name: 'showMessage',
      type: 'checkbox',
      defaultValue: true,
      label: 'Tampilkan kolom ucapan / pesan',
    },
    {
      name: 'messageLabel',
      type: 'text',
      defaultValue: 'Ucapan & doa',
      label: 'Label Kolom Ucapan',
    },
    {
      name: 'note',
      type: 'textarea',
      label: 'Catatan Tambahan (opsional)',
    },
  ],
}
