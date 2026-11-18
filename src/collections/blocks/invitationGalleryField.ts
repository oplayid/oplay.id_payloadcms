import { Block } from 'payload'

/**
 * Galeri foto undangan.
 *
 * Sumber foto: galeri acara (`Events.gallery`) + foto tambahan khusus blok ini.
 * Klik foto membuka tampilan besar (lightbox) dengan navigasi keyboard.
 */
export const invitationGalleryField: Block = {
  slug: 'InvitationGallery',
  labels: { singular: 'Galeri Undangan', plural: 'Galeri Undangan' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'gallery-grid',
      label: 'Varian Tampilan',
      options: [
        { label: 'Grid rapi', value: 'gallery-grid' },
        { label: 'Masonry', value: 'gallery-masonry' },
        { label: 'Geser horizontal', value: 'gallery-carousel' },
      ],
    },
    { name: 'sectionBadge', type: 'text', label: 'Badge Seksi' },
    {
      name: 'sectionTitle',
      type: 'text',
      defaultValue: 'Galeri',
      label: 'Judul Seksi',
    },
    { name: 'sectionSubtitle', type: 'textarea', label: 'Subjudul Seksi' },
    {
      name: 'images',
      type: 'array',
      label: 'Foto Tambahan (opsional)',
      admin: {
        description: 'Foto di sini tampil lebih dulu, lalu diikuti galeri foto acara.',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Foto',
        },
        { name: 'caption', type: 'text', label: 'Keterangan (opsional)' },
      ],
    },
    {
      name: 'captionStyle',
      type: 'select',
      defaultValue: 'overlay',
      label: 'Gaya Keterangan Foto',
      options: [
        { label: 'Di atas foto', value: 'overlay' },
        { label: 'Di bawah foto', value: 'below' },
        { label: 'Sembunyikan', value: 'hidden' },
      ],
    },
    {
      name: 'note',
      type: 'textarea',
      label: 'Catatan Tambahan (opsional)',
    },
  ],
}
