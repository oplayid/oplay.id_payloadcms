import { Block } from 'payload'
import { getRoutableConfig } from '@/lib/routableCollections'

const postsConfig = getRoutableConfig('posts')
const maxListing = postsConfig?.maxListing ?? 24

export const articleListField: Block = {
  slug: 'ArticleList',
  labels: { singular: 'Daftar Artikel', plural: 'Daftar Artikel' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'article-grid',
      label: 'Varian Tampilan',
      options: [
        { label: 'Grid Kartu', value: 'article-grid' },
        { label: 'Daftar Baris', value: 'article-list' },
        { label: 'Sorotan + Grid', value: 'article-featured' },
        { label: 'Ringkas (tanpa gambar)', value: 'article-compact' },
      ],
    },
    { name: 'sectionBadge', type: 'text', label: 'Badge Seksi' },
    { name: 'sectionTitle', type: 'text', label: 'Judul Seksi' },
    { name: 'sectionSubtitle', type: 'textarea', label: 'Subjudul Seksi' },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'latest',
      label: 'Sumber Artikel',
      options: [
        { label: 'Terbaru', value: 'latest' },
        { label: 'Pilih manual', value: 'manual' },
        { label: 'Berdasarkan kategori', value: 'category' },
      ],
    },
    {
      name: 'posts',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
      label: 'Artikel Terpilih',
      admin: {
        condition: (_data, siblingData) =>
          (siblingData as { source?: string } | undefined)?.source === 'manual',
        description: 'Urutan tampil mengikuti urutan pilihan.',
      },
    },
    {
      name: 'category',
      type: 'text',
      label: 'Kategori',
      admin: {
        condition: (_data, siblingData) =>
          (siblingData as { source?: string } | undefined)?.source === 'category',
        description: 'Harus sama persis dengan salah satu kategori pada artikel.',
      },
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 6,
      min: 1,
      max: maxListing,
      label: 'Jumlah Artikel',
      admin: { description: `Maksimal ${maxListing} artikel per blok.` },
    },
    {
      name: 'showCover',
      type: 'checkbox',
      defaultValue: true,
      label: 'Tampilkan gambar utama',
    },
    {
      name: 'showExcerpt',
      type: 'checkbox',
      defaultValue: true,
      label: 'Tampilkan ringkasan',
    },
    {
      name: 'showDate',
      type: 'checkbox',
      defaultValue: true,
      label: 'Tampilkan tanggal',
    },
    {
      name: 'emptyMessage',
      type: 'text',
      defaultValue: 'Belum ada artikel.',
      label: 'Pesan saat kosong',
    },
  ],
}
