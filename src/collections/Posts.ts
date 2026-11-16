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
 * Artikel / berita.
 *
 * Berbeda dari `Pages` yang menyusun blok, artikel memakai rich text untuk
 * badan tulisan dan punya URL sendiri: `/artikel/<slug>`.
 *
 * Untuk menambah jenis konten lain (proyek, event, ...), duplikasi pola ini
 * lalu daftarkan koleksinya di `lib/routableCollections` + `payload.config.ts`.
 */
export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: 'Artikel',
    plural: 'Artikel',
  },
  defaultSort: '-publishedAt',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'publishedAt', '_status', 'tenant'],
    description:
      'Artikel tampil di URL /artikel/<slug>. Buat halaman daftar dengan blok "Daftar Artikel".',
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
            ? getRoutablePath('posts', slug)
            : getRoutableListingPath('posts'),
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
    // Publik hanya boleh membaca artikel published (REST/local publik).
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
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

        // Normalisasi slug; turunkan dari judul bila kosong.
        if (typeof next.slug === 'string' && next.slug.trim()) {
          const slug = slugifyValue(next.slug)
          if (!slug) {
            throw new APIError(
              'Slug artikel tidak valid. Gunakan huruf kecil, angka, dan tanda hubung.',
              400,
            )
          }
          next.slug = slug
        } else {
          const sourceTitle =
            typeof next.title === 'string' ? next.title : original.title
          if (typeof sourceTitle === 'string' && sourceTitle.trim()) {
            next.slug = slugifyValue(sourceTitle)
          }
        }

        const effectiveSlug = next.slug ?? original.slug
        if (!effectiveSlug) {
          // Payload membuat draft kosong begitu halaman "Create New" dibuka
          // (autosave). Draft boleh belum punya judul/slug; validasi hanya
          // diberlakukan saat artikel dipublikasikan.
          if (isDraft) return next

          throw new APIError('Judul artikel wajib diisi agar slug dibuat otomatis.', 400)
        }
        if (!isValidSlug(effectiveSlug)) {
          throw new APIError(
            'Slug artikel hanya boleh huruf kecil, angka, dan tanda hubung (maks. 64 karakter).',
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
            collection: 'posts',
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
              `Slug "${effectiveSlug}" sudah dipakai artikel lain di tenant ini.`,
              400,
            )
          }
        }

        // Tanggal terbit otomatis saat pertama kali dipublikasikan.
        if (!next.publishedAt && !original.publishedAt && effectiveStatus === 'published') {
          next.publishedAt = new Date().toISOString()
        }

        return next
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        await invalidateContent([CACHE_TAGS.posts])

        const tenantRef = (doc as { tenant?: unknown }).tenant
        const tenantID =
          tenantRef && typeof tenantRef === 'object'
            ? (tenantRef as { id?: string }).id
            : (tenantRef as string | undefined)

        if (!tenantID) return

        const pathFor = (value: unknown): string | null => {
          const slug = (value as { slug?: string | null } | null | undefined)?.slug
          return slug ? getRoutablePath('posts', slug) : null
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
          // Redirect adalah kenyamanan; jangan gagalkan penyimpanan artikel.
          req.payload.logger.error(
            `Gagal menyimpan redirect artikel ${(doc as { id?: string }).id}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          )
        }
      },
    ],
    afterDelete: [
      async () => {
        await invalidateContent([CACHE_TAGS.posts])
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: 'Judul Artikel',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
      label: 'Slug Artikel',
      admin: {
        position: 'sidebar',
        description:
          'Dipakai pada URL /artikel/<slug>. Kosongkan untuk dibuat otomatis dari judul.',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      index: true,
      label: 'Tanggal Terbit',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Diisi otomatis saat artikel pertama kali dipublikasikan.',
      },
    },
    {
      name: 'author',
      type: 'text',
      label: 'Penulis',
      admin: {
        position: 'sidebar',
        description: 'Nama yang tampil di halaman artikel.',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
      label: 'Ringkasan',
      admin: {
        description:
          'Tampil di kartu daftar artikel dan sebagai meta description bila SEO kosong. Maksimal ~2 kalimat.',
      },
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      label: 'Gambar Utama',
      admin: {
        description: 'Dipakai di kartu daftar, halaman artikel, dan Open Graph.',
      },
    },
    {
      name: 'categories',
      type: 'text',
      hasMany: true,
      index: true,
      label: 'Kategori / Tag',
      admin: {
        description: 'Tekan Enter untuk menambah. Dipakai filter pada blok Daftar Artikel.',
      },
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
      label: 'Isi Artikel',
    },
  ],
}
