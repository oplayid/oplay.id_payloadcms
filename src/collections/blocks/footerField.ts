// src/blocks/Footer/config.ts
import { Block } from 'payload'

export const footerField: Block = {
  slug: 'Footer',
  labels: { singular: 'Footer (Kaki Halaman)', plural: 'Footer (Kaki Halaman)' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'footer-standard',
      label: 'Varian Footer',
      options: [
        { label: 'Standard (Legal Tech Rapi)', value: 'footer-standard' },
        { label: 'Terminal (Cyberpunk / Konsol)', value: 'footer-terminal' },
        { label: 'Massive Grid (Grid Kartu Holografik)', value: 'footer-massive-grid' },
        { label: 'Minimal Center (Elegan Terpusat)', value: 'footer-minimal-center' },
        { label: 'Status Bar (Bilah Status Node & Korporat)', value: 'footer-status-bar' },
      ],
    },
    {
      name: 'year',
      type: 'number',
      label: 'Tahun Hak Cipta (Opsional, default tahun berjalan)',
    },
    {
      name: 'companyName',
      type: 'text',
      defaultValue: 'oplay.id',
      label: 'Nama Perusahaan / Brand',
    },
    {
      name: 'tagline',
      type: 'textarea',
      defaultValue: 'Autonomous Legal Tech & AI Ecosystem.',
      label: 'Tagline Singkat',
    },
    {
      name: 'navigationColumns',
      type: 'array',
      label: 'Kolom Navigasi Footer',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          label: 'Judul Kolom',
        },
        {
          name: 'links',
          type: 'array',
          label: 'Daftar Tautan (Links)',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              label: 'Teks Tautan',
            },
            {
              name: 'href',
              type: 'text',
              required: true,
              label: 'URL / Tautan',
            },
          ],
        },
      ],
    },
  ],
}
