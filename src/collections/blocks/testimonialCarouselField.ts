import { Block } from 'payload'

export const testimonialCarouselField: Block = {
  slug: 'TestimonialCarousel',
  labels: { singular: 'Testimonial Carousel', plural: 'Testimonial Carousels' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'testimonial-grid',
      label: 'Varian Tampilan',
      options: [
        { label: 'Grid', value: 'testimonial-grid' },
        { label: 'Featured Single', value: 'testimonial-featured-single' },
        { label: 'Masonry', value: 'testimonial-masonry' },
        { label: 'Quote Bubble', value: 'testimonial-quote-bubble' },
        { label: 'Minimal Slider', value: 'testimonial-minimal-slider' },
        { label: 'Cards', value: 'testimonial-cards' },
      ],
    },
    { name: 'sectionBadge', type: 'text', label: 'Badge Seksi' },
    { name: 'sectionTitle', type: 'text', required: true, label: 'Judul Seksi' },
    { name: 'sectionSubtitle', type: 'textarea', label: 'Subjudul Seksi' },
    {
      name: 'testimonials',
      type: 'array',
      label: 'Daftar Testimoni',
      fields: [
        { name: 'quote', type: 'textarea', required: true, label: 'Kutipan' },
        { name: 'authorName', type: 'text', required: true, label: 'Nama Penulis' },
        { name: 'authorRole', type: 'text', required: true, label: 'Jabatan' },
        { name: 'companyName', type: 'text', required: true, label: 'Perusahaan' },
        {
          name: 'avatarUrl',
          type: 'upload',
          relationTo: 'media',
          label: 'Foto Avatar',
        },
      ],
    },
  ],
}
