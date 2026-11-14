import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    staticDir: 'media', // Dipakai saat R2 tidak aktif (local development)

    // Batasi dimensi file asli agar tidak ada gambar raksasa di bucket.
    resizeOptions: {
      width: 2560,
      height: 2560,
      fit: 'inside',
      withoutEnlargement: true,
    },

    // Konversi file asli ke WebP agar lebih kecil dari JPEG/PNG.
    formatOptions: {
      format: 'webp',
      options: { quality: 82 },
    },

    // Turunan responsif. Setiap size butuh formatOptions sendiri.
    imageSizes: [
      {
        name: 'thumbnail',
        width: 320,
        formatOptions: { format: 'webp', options: { quality: 80 } },
      },
      {
        name: 'card',
        width: 768,
        formatOptions: { format: 'webp', options: { quality: 80 } },
      },
      {
        name: 'hero',
        width: 1600,
        formatOptions: { format: 'webp', options: { quality: 82 } },
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        position: 'centre',
        formatOptions: { format: 'webp', options: { quality: 82 } },
      },
    ],

    adminThumbnail: 'thumbnail',
  },
}
