import { Block } from 'payload'
import { getRoutableConfig } from '@/lib/routableCollections'

const membersConfig = getRoutableConfig('members')
const maxListing = membersConfig?.maxListing ?? 48

export const memberListField: Block = {
  slug: 'MemberList',
  labels: { singular: 'Daftar Anggota', plural: 'Daftar Anggota' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'member-grid',
      label: 'Varian Tampilan',
      options: [
        { label: 'Grid Kartu', value: 'member-grid' },
        { label: 'Daftar Baris', value: 'member-list' },
        { label: 'Ringkas', value: 'member-compact' },
      ],
    },
    { name: 'sectionBadge', type: 'text', label: 'Badge Seksi' },
    { name: 'sectionTitle', type: 'text', label: 'Judul Seksi' },
    { name: 'sectionSubtitle', type: 'textarea', label: 'Subjudul Seksi' },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'latest',
      label: 'Sumber Anggota',
      options: [
        { label: 'Semua (urut default)', value: 'latest' },
        { label: 'Pilih manual', value: 'manual' },
        { label: 'Berdasarkan kategori', value: 'category' },
      ],
    },
    {
      name: 'members',
      type: 'relationship',
      relationTo: 'members',
      hasMany: true,
      label: 'Anggota Terpilih',
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
        description: 'Harus sama persis dengan salah satu kategori pada anggota.',
      },
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 12,
      min: 1,
      max: maxListing,
      label: 'Jumlah Anggota',
      admin: { description: `Maksimal ${maxListing} anggota per blok.` },
    },
    {
      name: 'showPhoto',
      type: 'checkbox',
      defaultValue: true,
      label: 'Tampilkan foto',
    },
    {
      name: 'showPosition',
      type: 'checkbox',
      defaultValue: true,
      label: 'Tampilkan jabatan',
    },
    {
      name: 'showStatus',
      type: 'checkbox',
      defaultValue: true,
      label: 'Tampilkan status',
    },
    {
      name: 'showExcerpt',
      type: 'checkbox',
      defaultValue: true,
      label: 'Tampilkan ringkasan',
    },
    {
      name: 'showCategories',
      type: 'checkbox',
      defaultValue: false,
      label: 'Tampilkan kategori',
    },
    {
      name: 'emptyMessage',
      type: 'text',
      defaultValue: 'Belum ada anggota.',
      label: 'Pesan saat kosong',
    },
  ],
}
