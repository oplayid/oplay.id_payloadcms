import { Block } from 'payload'

export const animatedPhotoBannerField: Block = {
  slug: 'AnimatedPhotoBanner',
  labels: { singular: 'Animated Photo Banner', plural: 'Animated Photo Banners' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'apple-coverflow',
      label: 'Varian Tampilan',
      options: [
        { label: 'Apple Coverflow', value: 'apple-coverflow' },
        { label: 'Apple Stack', value: 'apple-stack' },
        { label: 'Apple Smooth Scroll', value: 'apple-smooth-scroll' },
      ],
    },
    { name: 'title', type: 'text', label: 'Judul' },
    {
      name: 'photos',
      type: 'array',
      label: 'Daftar Foto',
      required: true,
      fields: [
        {
          name: 'url',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Foto',
        },
        { name: 'alt', type: 'text', required: true, label: 'Teks Alt' },
        { name: 'caption', type: 'text', label: 'Caption' },
      ],
    },
  ],
}
