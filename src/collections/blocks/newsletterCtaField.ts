import { Block } from 'payload'

export const newsletterCtaField: Block = {
  slug: 'NewsletterCta',
  labels: { singular: 'Newsletter CTA', plural: 'Newsletter CTAs' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'newsletter-centered-box',
      label: 'Varian Tampilan',
      options: [
        { label: 'Centered Box', value: 'newsletter-centered-box' },
        { label: 'Split Banner', value: 'newsletter-split-banner' },
        { label: 'Floating Bar', value: 'newsletter-floating-bar' },
        { label: 'Minimal Card', value: 'newsletter-minimal-card' },
        { label: 'Terminal Glow', value: 'newsletter-terminal-glow' },
      ],
    },
    { name: 'sectionBadge', type: 'text', label: 'Badge Seksi' },
    { name: 'sectionTitle', type: 'text', required: true, label: 'Judul Seksi' },
    { name: 'sectionSubtitle', type: 'textarea', required: true, label: 'Subjudul Seksi' },
    { name: 'placeholderText', type: 'text', label: 'Placeholder Input' },
    { name: 'buttonText', type: 'text', label: 'Teks Tombol' },
    { name: 'successMessage', type: 'text', label: 'Pesan Sukses' },
  ],
}
