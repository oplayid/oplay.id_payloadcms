// src/blocks/HeroBanner/config.ts (atau file block Anda)
import { Block } from 'payload'

export const heroBannerField: Block = {
  slug: 'HeroBanner',
  labels: { singular: 'Hero Banner', plural: 'Hero Banners' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'hero-standard',
      label: 'Varian Tampilan',
      options: [
        { label: 'Standard (Animatif & Mulus)', value: 'hero-standard' },
        { label: 'Casual Elegant (Smooth & Mengalir)', value: 'hero-casual-elegant' },
        { label: 'Cyber Terminal (Futuristik & Glow)', value: 'hero-cyber-terminal' },
        { label: 'Split Bento (Grid Melayang)', value: 'hero-split-bento' },
        { label: 'Holographic Glow (Hologram Bersinar)', value: 'hero-holographic-glow' },
        { label: 'Status Ticker (Live Monitoring)', value: 'hero-status-ticker' },
        { label: 'Minimal Bottom Left (Sinematik Kiri Bawah)', value: 'hero-minimal-bottom-left' },
        { label: 'SaaS Showcase (Modern dengan Floating Mockup)', value: 'hero-saas-showcase' },
      ],
    },
    { name: 'badge', type: 'text', label: 'Badge Teks' },
    { name: 'title', type: 'textarea', required: true, label: 'Judul Utama' },
    { name: 'subtitle', type: 'textarea', label: 'Subjudul' },
    {
      name: 'align',
      type: 'select',
      defaultValue: 'center',
      label: 'Perataan Teks (Alignment)',
      options: [
        { label: 'Tengah', value: 'center' },
        { label: 'Kiri', value: 'left' },
      ],
    },
    {
      name: 'cta',
      type: 'group',
      label: 'Tombol Utama (CTA)',
      fields: [
        { name: 'label', type: 'text', label: 'Teks Tombol' },
        { name: 'href', type: 'text', label: 'Link / URL' },
      ],
    },
    {
      name: 'secondaryCta',
      type: 'group',
      label: 'Tombol Kedua (Secondary CTA)',
      fields: [
        { name: 'label', type: 'text', label: 'Teks Tombol' },
        { name: 'href', type: 'text', label: 'Link / URL' },
      ],
    },
    {
      name: 'bgImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Gambar Latar',
    },
  ],
}
