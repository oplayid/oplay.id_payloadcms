import { APIError, type CollectionConfig } from 'payload'
import type { User } from '@/payload-types'
import {
  authenticated,
  getUserTenantIDs,
  isSuperAdmin,
  tenantContentScope,
} from '@/access'
import { CACHE_TAGS, invalidateContent } from '@/lib/contentCache'
import { isValidSlug, slugifyValue } from '@/lib/slug'

/**
 * Acara undangan.
 *
 * Satu tenant boleh punya banyak acara (pernikahan, syukuran, gathering, ...).
 * Setiap acara menunjuk satu halaman `Pages` yang dipakai sebagai desain
 * undangan, lalu setiap tamu di koleksi `guests` mendapat URL pribadinya.
 *
 * Koleksi ini tidak punya URL publik sendiri. Hanya `guests` yang diakses lewat
 * `/undangan/<nama-tamu>-<kode>`.
 */
export const Events: CollectionConfig = {
  slug: 'events',
  labels: {
    singular: 'Acara',
    plural: 'Acara',
  },
  admin: {
    group: 'Undangan',
    useAsTitle: 'title',
    defaultColumns: ['title', 'dateStart', 'venueName', '_status', 'tenant'],
    description:
      'Data acara + halaman desain undangan. Setelah acara dibuat, tambahkan tamu di menu "Tamu Undangan".',
  },
  versions: {
    // Tanpa autosave: form "Create New" tidak membuat draft kosong, sehingga
    // halaman admin tidak pernah blank. Draft tetap didukung untuk menyusun
    // acara sebelum dipublikasikan.
    drafts: true,
  },
  access: {
    read: tenantContentScope,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
    readVersions: authenticated,
  },
  hooks: {
    beforeValidate: [
      async ({ data, originalDoc, req }) => {
        if (!data) return data

        const next = { ...(data as Record<string, any>) }
        const original = (originalDoc || {}) as Record<string, any>
        const effectiveStatus = next._status ?? original._status
        const isDraft = effectiveStatus === 'draft'

        if (typeof next.slug === 'string' && next.slug.trim()) {
          next.slug = slugifyValue(next.slug)
        } else {
          const sourceTitle = typeof next.title === 'string' ? next.title : original.title
          if (typeof sourceTitle === 'string' && sourceTitle.trim()) {
            next.slug = slugifyValue(sourceTitle)
          }
        }

        const effectiveSlug = next.slug ?? original.slug

        if (!effectiveSlug) {
          // Draft boleh belum punya nama acara. Validasi hanya saat publish.
          if (isDraft) return next
          throw new APIError('Nama acara wajib diisi agar slug dibuat otomatis.', 400)
        }

        if (!isValidSlug(effectiveSlug)) {
          throw new APIError(
            'Slug acara hanya boleh huruf kecil, angka, dan tanda hubung (maks. 64 karakter).',
            400,
          )
        }

        const tenantRef = next.tenant ?? original.tenant
        const tenantID =
          tenantRef && typeof tenantRef === 'object'
            ? (tenantRef as { id?: string }).id
            : (tenantRef as string | undefined)

        if (tenantID) {
          const duplicate = await req.payload.find({
            collection: 'events',
            where: {
              and: [
                { tenant: { equals: tenantID } },
                { slug: { equals: effectiveSlug } },
                ...(original.id ? [{ id: { not_equals: original.id } }] : []),
              ],
            },
            limit: 1,
            depth: 0,
            overrideAccess: true,
            req,
          })

          if (duplicate.docs.length > 0) {
            throw new APIError(
              `Slug "${effectiveSlug}" sudah dipakai acara lain di tenant ini.`,
              400,
            )
          }
        }

        return next
      },
    ],
    afterChange: [
      async () => {
        await invalidateContent([CACHE_TAGS.events, CACHE_TAGS.invitations])
      },
    ],
    afterDelete: [
      async () => {
        await invalidateContent([CACHE_TAGS.events, CACHE_TAGS.invitations])
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: 'Nama Acara',
      admin: {
        description: 'Contoh: "Pernikahan Budi & Ani" atau "Syukuran Rumah Baru".',
      },
    },
    {
      name: 'slug',
      type: 'text',
      index: true,
      label: 'Slug Acara',
      admin: {
        position: 'sidebar',
        description:
          'Dipakai untuk membedakan acara di admin. Kosongkan untuk dibuat otomatis dari nama acara.',
      },
    },
    {
      name: 'dateStart',
      type: 'date',
      required: true,
      label: 'Mulai Acara',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        width: '50%',
      },
    },
    {
      name: 'dateEnd',
      type: 'date',
      label: 'Selesai Acara (opsional)',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        width: '50%',
      },
    },
    {
      name: 'timezone',
      type: 'select',
      defaultValue: 'Asia/Jakarta',
      label: 'Zona Waktu',
      options: [
        { label: 'WIB — Asia/Jakarta', value: 'Asia/Jakarta' },
        { label: 'WITA — Asia/Makassar', value: 'Asia/Makassar' },
        { label: 'WIT — Asia/Jayapura', value: 'Asia/Jayapura' },
        { label: 'Singapore', value: 'Asia/Singapore' },
        { label: 'UTC', value: 'UTC' },
      ],
      admin: { width: '50%' },
    },
    {
      name: 'venueName',
      type: 'text',
      label: 'Nama Tempat',
      admin: { width: '50%' },
    },
    {
      name: 'address',
      type: 'textarea',
      label: 'Alamat Lengkap',
    },
    {
      name: 'mapsURL',
      type: 'text',
      label: 'Link Google Maps (opsional)',
      admin: {
        description:
          'Kosongkan agar tombol Maps otomatis mencari dari nama tempat + alamat.',
      },
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      label: 'Gambar Cover Undangan',
      admin: {
        description: 'Dipakai blok cover bila blok tidak memilih gambar sendiri.',
      },
    },
    {
      name: 'openingMessage',
      type: 'textarea',
      localized: true,
      label: 'Pesan Pembuka',
      admin: {
        description: 'Tampil di cover atau blok undangan yang memakai pesan acara.',
      },
    },
    {
      name: 'invitationPage',
      type: 'relationship',
      relationTo: 'pages',
      label: 'Halaman Desain Undangan',
      admin: {
        description:
          'Halaman (Pages) yang blok-bloknya dipakai sebagai desain undangan. Halaman ini tetap dirender per tamu dengan data tamu yang sesuai.',
      },
      filterOptions: ({ req }) => {
        // Tanpa user (Local API / endpoint publik dengan `overrideAccess`) jangan
        // batasi opsi: create/update tetap dijaga `authenticated` di atas.
        if (!req.user) return true
        if (isSuperAdmin(req.user as User | null)) return true
        const ids = getUserTenantIDs(req.user as User | null)
        return ids.length > 0 ? { tenant: { in: ids } } : true
      },
    },
    {
      name: 'hostName',
      type: 'text',
      label: 'Nama Penyelenggara',
      admin: { width: '50%' },
    },
    {
      name: 'hostContact',
      type: 'text',
      label: 'WhatsApp Penyelenggara',
      admin: {
        width: '50%',
        description: 'Format internasional, contoh 6281234567890.',
      },
    },
    {
      name: 'dressCode',
      type: 'text',
      label: 'Dress Code',
    },
    {
      name: 'rsvpDeadline',
      type: 'date',
      label: 'Batas Konfirmasi Kehadiran',
      admin: {
        date: { pickerAppearance: 'dayOnly' },
        description: 'Konfirmasi ditutup setelah tanggal ini (akhir hari, zona waktu acara).',
        width: '50%',
      },
    },
    {
      name: 'allowRsvp',
      type: 'checkbox',
      defaultValue: true,
      label: 'Aktifkan konfirmasi kehadiran (RSVP)',
      admin: { width: '50%' },
    },
    {
      name: 'defaultPax',
      type: 'number',
      defaultValue: 2,
      min: 1,
      max: 50,
      label: 'Jumlah Tamu Default per Undangan',
      admin: {
        description: 'Dipakai sebagai nilai awal saat menambah tamu baru.',
      },
    },
    {
      name: 'rundown',
      type: 'array',
      label: 'Susunan Acara',
      labels: { singular: 'Acara', plural: 'Susunan Acara' },
      fields: [
        {
          name: 'time',
          type: 'text',
          label: 'Jam',
          admin: { width: '25%', description: 'Contoh: 09.00' },
        },
        { name: 'title', type: 'text', label: 'Kegiatan', required: true },
        { name: 'description', type: 'text', label: 'Keterangan' },
      ],
    },
    {
      name: 'gifts',
      type: 'array',
      label: 'Rekening / Hadiah',
      labels: { singular: 'Rekening', plural: 'Rekening / Hadiah' },
      admin: {
        description:
          'Tampil di blok "Hadiah & Angpao". Boleh dikosongkan bila tidak menerima hadiah digital.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Label',
          admin: { description: 'Contoh: Hadiah Pernikahan, Angpao Digital' },
        },
        { name: 'bankName', type: 'text', label: 'Bank / E-Wallet', required: true },
        { name: 'accountNumber', type: 'text', label: 'Nomor Rekening', required: true },
        { name: 'accountName', type: 'text', label: 'Atas Nama', required: true },
      ],
    },
    {
      name: 'giftAddress',
      type: 'textarea',
      label: 'Alamat Pengiriman Hadiah (opsional)',
      admin: {
        description: 'Untuk tamu yang ingin mengirim hadiah fisik.',
      },
    },
    {
      name: 'gallery',
      type: 'array',
      label: 'Galeri Foto Undangan',
      labels: { singular: 'Foto', plural: 'Galeri Foto' },
      admin: {
        description:
          'Dipakai blok "Galeri Undangan". Boleh dikosongkan; blok galeri juga bisa memilih foto sendiri.',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Foto',
        },
        {
          name: 'caption',
          type: 'text',
          label: 'Keterangan (opsional)',
        },
      ],
    },
  ],
}
