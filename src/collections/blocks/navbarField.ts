// src/blocks/Navbar/config.ts
import { Block } from 'payload'

export const navbarField: Block = {
  slug: 'Navbar',
  labels: { singular: 'Navbar (Navigasi)', plural: 'Navbar (Navigasi)' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'navbar-standard',
      label: 'Varian Navigasi',
      options: [
        { label: 'Standard (Header Klasik & Mega Menu)', value: 'navbar-standard' },
        { label: 'Cyber Terminal (Futuristik & Mono)', value: 'navbar-cyber-terminal' },
        { label: 'Floating Island (Kapsul Mengapung)', value: 'navbar-floating-island' },
        { label: 'Command Palette (Gaya ⌘K Search bar)', value: 'navbar-command-palette' },
        { label: 'Dual Tier (Dengan Top Status Bar)', value: 'navbar-dual-tier' },
        { label: 'Dynamic Island (Interaktif Kapsul Dinamis)', value: 'navbar-dynamic-island' },
        { label: 'Editorial Masthead (Brand di Tengah)', value: 'navbar-editorial' },
      ],
    },
    {
      name: 'brandName',
      type: 'text',
      defaultValue: 'oplay.id',
      label: 'Nama Brand / Logo Teks',
    },
    {
      name: 'categories',
      type: 'array',
      label: 'Kategori Menu / Navigasi',
      fields: [
        { name: 'label', type: 'text', required: true, label: 'Nama Menu' },
        { name: 'href', type: 'text', label: 'Link URL Utama (Opsional jika punya Submenu)' },
        {
          name: 'items',
          type: 'array',
          label: 'Submenu / Mega Menu Items',
          fields: [
            { name: 'label', type: 'text', required: true, label: 'Judul Item' },
            { name: 'description', type: 'textarea', label: 'Deskripsi Singkat' },
            { name: 'href', type: 'text', required: true, label: 'Tautan / Link' },
            {
              name: 'isFeatured',
              type: 'checkbox',
              label: 'Jadikan Kartu Unggulan (Featured Card)',
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              label: 'Gambar (Khusus Featured Card)',
            },
          ],
        },
      ],
    },
    {
      name: 'languages',
      type: 'array',
      label: 'Pilihan Bahasa (Opsional)',
      fields: [
        { name: 'code', type: 'text', required: true, label: 'Kode Bahasa (mis: id, en)' },
        { name: 'label', type: 'text', required: true, label: 'Label Ringkas (mis: ID, EN)' },
        { name: 'name', type: 'text', label: 'Nama Bahasa (mis: Indonesia)' },
        { name: 'flag', type: 'text', label: 'Emoji Bendera (mis: 🇮🇩)' },
      ],
    },
    {
      name: 'loginCta',
      type: 'group',
      label: 'Tombol Masuk / Login CTA',
      fields: [
        { name: 'label', type: 'text', defaultValue: 'Login', label: 'Teks Tombol' },
        { name: 'href', type: 'text', defaultValue: '/login', label: 'Link / URL Tombol' },
      ],
    },
  ],
}
