import type { Field } from 'payload'
import { getRoutableConfig } from '@/lib/routableCollections'
import type { HighlightCollection } from '@/lib/highlights'

export type HighlightSourceFieldsOptions = {
  /** Koleksi yang boleh dipilih sebagai sumber sorotan. */
  allowedCollections: HighlightCollection[]
  /** Koleksi default saat mode koleksi aktif. */
  defaultCollection?: HighlightCollection
  /** Sumber default blok: manual (inline) atau koleksi. */
  defaultSource?: 'manual' | 'collection'
  /** Mode default saat sumber koleksi. */
  defaultMode?: 'latest' | 'category' | 'manual'
  /** Label sumber manual (disesuaikan konteks blok). */
  manualLabel?: string
  /** Label sumber koleksi. */
  collectionLabel?: string
  /** Batas default jumlah item. */
  defaultLimit?: number
}

function maxLimitFor(collection: HighlightCollection, fallback: number): number {
  return getRoutableConfig(collection)?.maxListing ?? fallback
}

/**
 * Field bersama untuk menjadikan blok sebagai sorotan/highlight dari koleksi
 * routable (`members`/`posts`) di samping data manual/inlinenya sendiri.
 *
 * Blok tetap menyimpan field inline-nya sendiri (ditampilkan saat
 * `dataSource === 'manual'`) agar data lama tetap kompatibel. Helper ini hanya
 * menambahkan konfigurasi sumber koleksi.
 */
export function buildHighlightSourceFields(
  options: HighlightSourceFieldsOptions,
): Field[] {
  const allowed = options.allowedCollections
  const defaultCollection = options.defaultCollection ?? allowed[0] ?? 'members'
  const allowMembers = allowed.includes('members')
  const allowPosts = allowed.includes('posts')
  const multiCollection = allowMembers && allowPosts
  const defaultLimit = options.defaultLimit ?? (defaultCollection === 'members' ? 12 : 6)
  const limitMax = Math.max(
    allowMembers ? maxLimitFor('members', 48) : 0,
    allowPosts ? maxLimitFor('posts', 24) : 0,
    defaultLimit,
  )

  const fields: Field[] = [
    {
      name: 'dataSource',
      type: 'select',
      defaultValue: options.defaultSource ?? 'manual',
      label: 'Sumber Data',
      options: [
        { label: options.manualLabel ?? 'Manual (isi di blok ini)', value: 'manual' },
        { label: options.collectionLabel ?? 'Sorotan dari Koleksi', value: 'collection' },
      ],
      admin: {
        description:
          'Pilih "Sorotan dari Koleksi" untuk menampilkan item dari Anggota/Artikel secara otomatis.',
      },
    },
  ]

  if (multiCollection) {
    fields.push({
      name: 'highlightCollection',
      type: 'select',
      defaultValue: defaultCollection,
      label: 'Koleksi Sorotan',
      options: [
        ...(allowMembers ? [{ label: 'Anggota', value: 'members' as const }] : []),
        ...(allowPosts ? [{ label: 'Artikel', value: 'posts' as const }] : []),
      ],
      admin: {
        condition: (_data, siblingData) =>
          (siblingData as { dataSource?: string } | undefined)?.dataSource === 'collection',
      },
    })
  }

  fields.push({
    name: 'highlightMode',
    type: 'select',
    defaultValue: options.defaultMode ?? 'latest',
    label: 'Mode Sorotan',
    options: [
      { label: 'Terbaru / Urutan default', value: 'latest' },
      { label: 'Pilih manual', value: 'manual' },
      { label: 'Berdasarkan kategori', value: 'category' },
    ],
    admin: {
      condition: (_data, siblingData) =>
        (siblingData as { dataSource?: string } | undefined)?.dataSource === 'collection',
    },
  })

  if (allowMembers) {
    fields.push({
      name: 'highlightMemberItems',
      type: 'relationship',
      relationTo: 'members',
      hasMany: true,
      label: 'Anggota Terpilih',
      admin: {
        condition: (_data, siblingData) => {
          const s = siblingData as {
            dataSource?: string
            highlightMode?: string
            highlightCollection?: string
          } | undefined
          if (s?.dataSource !== 'collection' || s?.highlightMode !== 'manual') return false
          return multiCollection ? s?.highlightCollection === 'members' : defaultCollection === 'members'
        },
        description: 'Urutan tampil mengikuti urutan pilihan.',
      },
    })
  }

  if (allowPosts) {
    fields.push({
      name: 'highlightPostItems',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
      label: 'Artikel Terpilih',
      admin: {
        condition: (_data, siblingData) => {
          const s = siblingData as {
            dataSource?: string
            highlightMode?: string
            highlightCollection?: string
          } | undefined
          if (s?.dataSource !== 'collection' || s?.highlightMode !== 'manual') return false
          return multiCollection ? s?.highlightCollection === 'posts' : defaultCollection === 'posts'
        },
        description: 'Urutan tampil mengikuti urutan pilihan.',
      },
    })
  }

  fields.push({
    name: 'highlightCategory',
    type: 'text',
    label: 'Kategori Sorotan',
    admin: {
      condition: (_data, siblingData) => {
        const s = siblingData as { dataSource?: string; highlightMode?: string } | undefined
        return s?.dataSource === 'collection' && s?.highlightMode === 'category'
      },
      description: 'Harus sama persis dengan salah satu kategori/tag pada item koleksi.',
    },
  })

  fields.push({
    name: 'highlightLimit',
    type: 'number',
    defaultValue: defaultLimit,
    min: 1,
    max: limitMax,
    label: 'Jumlah Item Sorotan',
    admin: {
      condition: (_data, siblingData) =>
        (siblingData as { dataSource?: string } | undefined)?.dataSource === 'collection',
      description: `Maksimal ${limitMax} item per blok (mengikuti batas koleksi).`,
    },
  })

  return fields
}
