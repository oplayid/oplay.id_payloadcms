import type { CollectionConfig } from 'payload'
import { authenticated, superAdminOnly } from '@/access'
import { getDynamicBlocks } from './blocks'
import { templateFooterField, templateNavigationField } from './fields/siteChromeFields'
import { CACHE_TAGS, invalidateContent } from '@/lib/contentCache'

/**
 * Template situs: kumpulan halaman siap pakai + navbar/footer + tema.
 *
 * Dibuat oleh superadmin, lalu diterapkan ke tenant lewat endpoint
 * `POST /api/tenants/:id/apply-template`. Tidak ada komponen yang dilarang —
 * template hanya titik awal, tenant tetap bebas mengubah semuanya.
 */
export const Templates: CollectionConfig = {
  slug: 'templates',
  labels: {
    singular: 'Template Situs',
    plural: 'Template Situs',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'category', 'updatedAt'],
    group: 'Platform',
    description:
      'Halaman awal yang bisa disalin ke tenant baru. Setelah diterapkan, halaman menjadi milik tenant dan bebas diubah.',
  },
  access: {
    // Tenant perlu membaca daftar template untuk memilih starter.
    read: authenticated,
    create: superAdminOnly,
    update: superAdminOnly,
    delete: superAdminOnly,
  },
  hooks: {
    afterChange: [
      async () => {
        // Template tidak dipakai saat render, tapi daftar picker di admin
        // memakai cache yang sama dengan koleksi lain.
        await invalidateContent([CACHE_TAGS.pages])
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nama Template',
      admin: { description: 'Contoh: Company Profile, UMKM Toko Online, Undangan Pernikahan.' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'Slug Template',
      admin: { description: 'Huruf kecil dan tanda hubung, contoh: company-profile.' },
    },
    {
      name: 'category',
      type: 'select',
      label: 'Kategori',
      defaultValue: 'business',
      options: [
        { label: 'Bisnis & Company Profile', value: 'business' },
        { label: 'UMKM & Toko', value: 'umkm' },
        { label: 'Portofolio & Personal', value: 'portfolio' },
        { label: 'Legal & Profesional', value: 'legal' },
        { label: 'Acara & Undangan', value: 'event' },
        { label: 'Lainnya', value: 'other' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Deskripsi singkat',
      admin: { description: 'Ditampilkan di daftar pilihan template.' },
    },
    {
      name: 'previewImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Gambar pratinjau',
    },
    {
      name: 'themePreset',
      type: 'relationship',
      relationTo: 'themes',
      label: 'Tema default',
      admin: { description: 'Diterapkan ke tenant hanya jika tenant belum punya tema.' },
    },
    {
      name: 'defaultLayoutMode',
      type: 'select',
      defaultValue: 'inherit',
      label: 'Layout default halaman',
      options: [
        { label: 'Ikuti layout situs (navbar/footer otomatis)', value: 'inherit' },
        { label: 'Kanvas penuh (navbar/footer di dalam blok)', value: 'canvas' },
        { label: 'Polos (tanpa navbar/footer)', value: 'bare' },
      ],
      admin: {
        description:
          'Dipakai halaman template yang tidak menentukan layout sendiri. Halaman hasil salinan tetap bisa diubah per halaman.',
      },
    },
    templateNavigationField,
    templateFooterField,
    {
      name: 'pages',
      type: 'array',
      label: 'Halaman template',
      labels: { singular: 'Halaman', plural: 'Halaman' },
      admin: {
        description:
          'Halaman dibuat berurutan: induk lebih dulu, lalu anak (isi "Slug induk").',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
          label: 'Judul halaman',
        },
        {
          name: 'slug',
          type: 'text',
          required: true,
          label: 'Slug',
          admin: { description: 'Contoh: home, tentang-kami, layanan.' },
        },
        {
          name: 'parentSlug',
          type: 'text',
          label: 'Slug induk (opsional)',
          admin: {
            description:
              'Isi jika halaman ini adalah sub-halaman, contoh: isi "layanan" untuk layanan/konsultasi.',
          },
        },
        {
          name: 'layoutMode',
          type: 'select',
          label: 'Layout halaman',
          options: [
            { label: 'Ikuti template', value: 'inherit' },
            { label: 'Kanvas penuh', value: 'canvas' },
            { label: 'Polos (tanpa navbar/footer)', value: 'bare' },
          ],
          admin: { description: 'Kosongkan untuk memakai layout default template.' },
        },
        {
          name: 'blocks',
          type: 'blocks',
          label: 'Blok halaman',
          blocks: getDynamicBlocks(),
        },
      ],
    },
  ],
}
