import { Block } from 'payload'

export const appleInteractiveShowcaseField: Block = {
  slug: 'AppleInteractiveShowcase',
  labels: { singular: 'Interactive Showcase', plural: 'Interactive Showcases' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'bento-spotlight',
      label: 'Varian Tampilan',
      options: [
        { label: 'Hardware Video', value: 'hardware-video' },
        { label: 'Bento Spotlight', value: 'bento-spotlight' },
        { label: 'Sticky Stack', value: 'sticky-stack' },
        { label: 'Text Reveal', value: 'text-reveal' },
      ],
    },
    { name: 'title', type: 'text', label: 'Judul' },
    { name: 'subtitle', type: 'text', label: 'Subjudul' },
    {
      name: 'items',
      type: 'array',
      label: 'Item Showcase',
      fields: [
        { name: 'title', type: 'text', required: true, label: 'Judul' },
        { name: 'description', type: 'textarea', required: true, label: 'Deskripsi' },
        { name: 'tag', type: 'text', label: 'Tag' },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Gambar',
        },
        {
          name: 'videoUrl',
          type: 'upload',
          relationTo: 'media',
          label: 'Video',
        },
        { name: 'link', type: 'text', label: 'Link' },
      ],
    },
  ],
}
