import { Block } from 'payload'

export const galleryLightboxField: Block = {
  slug: 'GalleryLightbox',
  labels: { singular: 'Gallery Lightbox', plural: 'Gallery Lightboxes' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'gallery-grid-standard',
      label: 'Varian Tampilan',
      options: [
        { label: 'Grid Standard', value: 'gallery-grid-standard' },
        { label: 'Masonry Style', value: 'gallery-masonry-style' },
        { label: 'Featured Hero', value: 'gallery-featured-hero' },
        { label: 'Horizontal Strip', value: 'gallery-horizontal-strip' },
        { label: 'Minimal Cards', value: 'gallery-minimal-cards' },
      ],
    },
    { name: 'sectionBadge', type: 'text', label: 'Badge Seksi' },
    { name: 'sectionTitle', type: 'text', required: true, label: 'Judul Seksi' },
    { name: 'sectionSubtitle', type: 'textarea', label: 'Subjudul Seksi' },
    {
      name: 'images',
      type: 'array',
      label: 'Daftar Gambar',
      fields: [
        {
          name: 'src',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Gambar',
        },
        { name: 'alt', type: 'text', required: true, label: 'Teks Alt' },
        { name: 'caption', type: 'text', label: 'Caption' },
        { name: 'category', type: 'text', label: 'Kategori' },
      ],
    },
  ],
}
