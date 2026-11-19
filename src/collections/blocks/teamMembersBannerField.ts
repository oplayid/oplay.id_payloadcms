import type { Block } from 'payload'
import { buildHighlightSourceFields } from './shared/highlightSourceFields'

export const teamMembersBannerField: Block = {
  slug: 'TeamMembersBanner',
  labels: { singular: 'Team Members Banner', plural: 'Team Members Banners' },
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
    ...buildHighlightSourceFields({
      allowedCollections: ['members'],
      defaultCollection: 'members',
      defaultSource: 'manual',
      manualLabel: 'Manual (isi anggota di blok ini)',
      collectionLabel: 'Sorotan dari Koleksi Anggota',
      defaultLimit: 12,
    }),
    {
      name: 'members',
      type: 'array',
      label: 'Daftar Anggota (Manual)',
      validate: (value, { siblingData }) => {
        const source = (siblingData as { dataSource?: string } | undefined)?.dataSource
        // Back-compat: dokumen lama tanpa dataSource diperlakukan sebagai manual.
        if (source === 'collection') return true
        if (!Array.isArray(value) || value.length === 0) {
          return 'Tambahkan minimal 1 anggota, atau ubah sumber data ke "Sorotan dari Koleksi Anggota".'
        }
        return true
      },
      admin: {
        condition: (_data, siblingData) =>
          (siblingData as { dataSource?: string } | undefined)?.dataSource !== 'collection',
        description: 'Dipakai saat sumber data manual. Untuk sorotan otomatis, pilih sumber koleksi di atas.',
      },
      fields: [
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Foto',
        },
        {
          name: 'fullName',
          type: 'text',
          required: true,
          label: 'Nama Lengkap',
        },
        {
          name: 'position',
          type: 'text',
          required: true,
          label: 'Jabatan',
        },
        {
          name: 'status',
          type: 'text',
          label: 'Status',
          admin: {
            description: 'Contoh: Aktif, Non-aktif, Pjs, dll.',
          },
        },
      ],
    },
  ],
}
