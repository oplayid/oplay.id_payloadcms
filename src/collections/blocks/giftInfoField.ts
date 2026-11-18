import { Block } from 'payload'

/**
 * Informasi hadiah / angpao. Daftar rekening berasal dari dokumen `events`
 * (`gifts`), sedangkan alamat pengiriman bisa ditimpa per blok.
 */
export const giftInfoField: Block = {
  slug: 'GiftInfo',
  labels: { singular: 'Hadiah & Angpao', plural: 'Hadiah & Angpao' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'gift-cards',
      label: 'Varian Tampilan',
      options: [
        { label: 'Kartu-kartu', value: 'gift-cards' },
        { label: 'Daftar rapi', value: 'gift-list' },
      ],
    },
    { name: 'sectionBadge', type: 'text', label: 'Badge Seksi' },
    {
      name: 'sectionTitle',
      type: 'text',
      defaultValue: 'Hadiah & Angpao',
      label: 'Judul Seksi',
    },
    {
      name: 'sectionSubtitle',
      type: 'textarea',
      label: 'Subjudul Seksi',
      admin: {
        description:
          'Contoh: "Doa restu Anda adalah hadiah terbaik. Bila ingin memberi tanda kasih, berikut informasinya."',
      },
    },
    {
      name: 'showAccounts',
      type: 'checkbox',
      defaultValue: true,
      label: 'Tampilkan rekening dari acara',
    },
    {
      name: 'copyLabel',
      type: 'text',
      defaultValue: 'Salin nomor',
      label: 'Label Tombol Salin',
    },
    {
      name: 'showGiftAddress',
      type: 'checkbox',
      defaultValue: true,
      label: 'Tampilkan alamat pengiriman hadiah',
    },
    {
      name: 'giftAddressOverride',
      type: 'textarea',
      label: 'Alamat Khusus Blok Ini (opsional)',
      admin: {
        description: 'Kosongkan untuk memakai alamat dari dokumen acara.',
      },
    },
    {
      name: 'note',
      type: 'textarea',
      label: 'Catatan Tambahan (opsional)',
    },
  ],
}
