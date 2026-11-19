import { APIError, type CollectionConfig } from 'payload'
import { authenticated } from '@/access'
import { CACHE_TAGS, invalidateContent } from '@/lib/contentCache'
import { syncRedirectForPathChange } from '@/lib/pageRedirectSync'
import { buildPreviewURL } from '@/lib/pagePaths'
import { getRoutableListingPath, getRoutablePath } from '@/lib/routableCollections'
import { isValidSlug, slugifyValue } from '@/lib/slug'
import { getServerURL } from '@/lib/urls'
import type { Tenant } from '@/payload-types'

/**
 * Profil anggota / jajaran tim.
 *
 * Setiap anggota punya URL detail sendiri: `/anggota/<slug>` (alias `/tim/<slug>`).
 * Data dipakai sebagai sumber identitas/CV dan dapat ditarik ke Pages lewat
 * block listing (mis. filter berdasarkan kategori).
 */
export const Members: CollectionConfig = {
  slug: 'members',
  labels: {
    singular: 'Anggota',
    plural: 'Anggota',
  },
  defaultSort: 'order',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'position', 'status', 'categories', '_status', 'tenant'],
    description:
      'Profil anggota tampil di URL /anggota/<slug>. Tampilkan di halaman dengan block "Daftar Anggota".',
    livePreview: {
      url: async ({ data, req, locale }) => {
        const doc = (data || {}) as {
          tenant?: unknown
          slug?: string | null
        }
        const tenantRef = doc.tenant
        const tenantID =
          tenantRef && typeof tenantRef === 'object'
            ? (tenantRef as { id?: string }).id
            : (tenantRef as string | undefined)

        if (!tenantID) return getServerURL()

        const tenant = (await req.payload.findByID({
          collection: 'tenants',
          id: tenantID,
          depth: 0,
          overrideAccess: true,
          req,
        })) as Tenant

        const slug = typeof doc.slug === 'string' ? doc.slug : ''

        return buildPreviewURL({
          tenant,
          pagePath: slug
            ? getRoutablePath('members', slug)
            : getRoutableListingPath('members'),
          locale: locale?.code === 'en' ? 'en' : 'id',
          origin: getServerURL(),
        })
      },
    },
  },
  versions: {
    drafts: {
      autosave: { interval: 400 },
    },
  },
  access: {
    // Sama seperti Pages/Posts: data anggota hanya lewat renderer dengan
    // filter tenant/status eksplisit, bukan REST/GraphQL anonim.
    read: ({ req }) => Boolean(req.user),
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

        // Normalisasi slug; turunkan dari nama bila kosong.
        if (typeof next.slug === 'string' && next.slug.trim()) {
          const slug = slugifyValue(next.slug)
          if (!slug) {
            throw new APIError(
              'Slug anggota tidak valid. Gunakan huruf kecil, angka, dan tanda hubung.',
              400,
            )
          }
          next.slug = slug
        } else {
          const sourceName =
            typeof next.name === 'string' ? next.name : original.name
          if (typeof sourceName === 'string' && sourceName.trim()) {
            next.slug = slugifyValue(sourceName)
          }
        }

        const effectiveSlug = next.slug ?? original.slug
        if (!effectiveSlug) {
          if (isDraft) return next

          throw new APIError(
            'Nama anggota wajib diisi agar slug dibuat otomatis.',
            400,
          )
        }
        if (!isValidSlug(effectiveSlug)) {
          throw new APIError(
            'Slug anggota hanya boleh huruf kecil, angka, dan tanda hubung (maks. 64 karakter).',
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
            collection: 'members',
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
              `Slug "${effectiveSlug}" sudah dipakai anggota lain di tenant ini.`,
              400,
            )
          }
        }

        if (!next.publishedAt && !original.publishedAt && effectiveStatus === 'published') {
          next.publishedAt = new Date().toISOString()
        }

        if (typeof next.order !== 'number' && typeof original.order !== 'number') {
          next.order = 0
        }

        return next
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        await invalidateContent([CACHE_TAGS.members])

        const tenantRef = (doc as { tenant?: unknown }).tenant
        const tenantID =
          tenantRef && typeof tenantRef === 'object'
            ? (tenantRef as { id?: string }).id
            : (tenantRef as string | undefined)

        if (!tenantID) return

        const pathFor = (value: unknown): string | null => {
          const slug = (value as { slug?: string | null } | null | undefined)?.slug
          return slug ? getRoutablePath('members', slug) : null
        }

        try {
          await syncRedirectForPathChange({
            payload: req.payload,
            req,
            tenantID,
            nextPath: pathFor(doc),
            previousPath: operation === 'update' ? pathFor(previousDoc) : null,
          })
        } catch (error) {
          req.payload.logger.error(
            `Gagal menyimpan redirect anggota ${(doc as { id?: string }).id}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          )
        }
      },
    ],
    afterDelete: [
      async () => {
        await invalidateContent([CACHE_TAGS.members])
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identitas',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
              label: 'Nama Lengkap',
            },
            {
              name: 'slug',
              type: 'text',
              required: true,
              index: true,
              label: 'Slug',
              admin: {
                position: 'sidebar',
                description:
                  'Dipakai pada URL /anggota/<slug>. Kosongkan untuk dibuat otomatis dari nama.',
              },
            },
            {
              name: 'cover',
              type: 'upload',
              relationTo: 'media',
              label: 'Foto Anggota',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'position',
                  type: 'text',
                  label: 'Jabatan',
                  admin: { width: '50%' },
                },
                {
                  name: 'status',
                  type: 'text',
                  label: 'Status',
                  admin: {
                    width: '50%',
                    description: 'Contoh: Aktif, Non-aktif, Pjs, Komisaris, dll.',
                  },
                },
              ],
            },
            {
              name: 'categories',
              type: 'text',
              hasMany: true,
              index: true,
              label: 'Kategori / Divisi',
              admin: {
                description:
                  'Tekan Enter untuk menambah. Dipakai untuk filter pada block "Daftar Anggota".',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'order',
                  type: 'number',
                  defaultValue: 0,
                  label: 'Urutan Tampil',
                  admin: {
                    width: '50%',
                    position: 'sidebar',
                    description: 'Angka lebih kecil tampil lebih dulu.',
                  },
                },
                {
                  name: 'publishedAt',
                  type: 'date',
                  index: true,
                  label: 'Tanggal Terbit',
                  admin: {
                    width: '50%',
                    position: 'sidebar',
                    date: { pickerAppearance: 'dayAndTime' },
                    description: 'Diisi otomatis saat pertama kali dipublikasikan.',
                  },
                },
              ],
            },
            {
              name: 'excerpt',
              type: 'textarea',
              label: 'Ringkasan Singkat',
              admin: {
                description:
                  'Tampil di kartu daftar anggota dan sebagai deskripsi singkat bila SEO kosong.',
              },
            },
            {
              name: 'bio',
              type: 'richText',
              label: 'Profil / Biografi',
            },
          ],
        },
        {
          label: 'Kontak',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'email',
                  type: 'email',
                  label: 'Email',
                  admin: { width: '50%' },
                },
                {
                  name: 'phone',
                  type: 'text',
                  label: 'Telepon',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'website',
              type: 'text',
              label: 'Situs / Tautan Profil',
            },
            {
              name: 'address',
              type: 'textarea',
              label: 'Alamat / Domisili',
            },
            {
              name: 'socialLinks',
              type: 'array',
              label: 'Tautan Sosial / Profesional',
              labels: { singular: 'Tautan', plural: 'Tautan' },
              fields: [
                {
                  name: 'platform',
                  type: 'text',
                  required: true,
                  label: 'Platform / Label',
                  admin: { description: 'Contoh: LinkedIn, Instagram, GitHub.' },
                },
                {
                  name: 'url',
                  type: 'text',
                  required: true,
                  label: 'URL',
                },
              ],
            },
          ],
        },
        {
          label: 'Pengalaman & CV',
          fields: [
            {
              name: 'experience',
              type: 'array',
              label: 'Pengalaman',
              labels: { singular: 'Pengalaman', plural: 'Pengalaman' },
              fields: [
                {
                  name: 'role',
                  type: 'text',
                  required: true,
                  label: 'Jabatan / Peran',
                },
                {
                  name: 'organization',
                  type: 'text',
                  required: true,
                  label: 'Organisasi / Perusahaan',
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'period',
                      type: 'text',
                      label: 'Periode',
                      admin: {
                        width: '50%',
                        description: 'Contoh: 2020–2024, Jan 2022–Sekarang.',
                      },
                    },
                    {
                      name: 'location',
                      type: 'text',
                      label: 'Lokasi',
                      admin: { width: '50%' },
                    },
                  ],
                },
                {
                  name: 'description',
                  type: 'textarea',
                  label: 'Deskripsi',
                },
              ],
            },
            {
              name: 'education',
              type: 'array',
              label: 'Pendidikan',
              labels: { singular: 'Pendidikan', plural: 'Pendidikan' },
              fields: [
                {
                  name: 'institution',
                  type: 'text',
                  required: true,
                  label: 'Institusi',
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'degree',
                      type: 'text',
                      label: 'Gelar / Jenjang',
                      admin: { width: '50%' },
                    },
                    {
                      name: 'field',
                      type: 'text',
                      label: 'Bidang Studi',
                      admin: { width: '50%' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'period',
                      type: 'text',
                      label: 'Periode / Tahun',
                      admin: { width: '50%' },
                    },
                    {
                      name: 'description',
                      type: 'textarea',
                      label: 'Keterangan',
                      admin: { width: '50%' },
                    },
                  ],
                },
              ],
            },
            {
              name: 'skills',
              type: 'text',
              hasMany: true,
              label: 'Keahlian',
              admin: { description: 'Tekan Enter untuk menambah keahlian.' },
            },
            {
              name: 'certifications',
              type: 'array',
              label: 'Sertifikasi / Penghargaan',
              labels: { singular: 'Sertifikasi', plural: 'Sertifikasi' },
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                  label: 'Nama',
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'issuer',
                      type: 'text',
                      label: 'Penerbit / Penyelenggara',
                      admin: { width: '50%' },
                    },
                    {
                      name: 'year',
                      type: 'text',
                      label: 'Tahun',
                      admin: { width: '50%' },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
