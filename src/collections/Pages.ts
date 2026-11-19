// src/collections/Pages.ts
import { APIError, type CollectionConfig } from 'payload'
import { getDynamicBlocks } from './blocks'
import { createParentField } from '@payloadcms/plugin-nested-docs'
import { authenticated, isSuperAdmin } from '@/access'
import { CACHE_TAGS, invalidateContent } from '@/lib/contentCache'
import { syncRedirectForPageChange } from '@/lib/pageRedirectSync'
import { buildPreviewURL, extractPagePath } from '@/lib/pagePaths'
import type { Page, Tenant, User } from '@/payload-types'
import { getServerURL } from '@/lib/urls'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'tenant', 'updatedAt'],
    livePreview: {
      url: async ({ data, req, locale }) => {
        const tenantRef = (data as Page | undefined)?.tenant
        const tenantID =
          tenantRef && typeof tenantRef === 'object' ? tenantRef.id : tenantRef

        if (!tenantID) return getServerURL()

        const tenant = (await req.payload.findByID({
          collection: 'tenants',
          id: tenantID,
          depth: 0,
          overrideAccess: true,
          req,
        })) as Tenant & { slug?: string | null; type?: string | null }

        return buildPreviewURL({
          tenant,
          pagePath: extractPagePath((data || {}) as Page),
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
    // REST/GraphQL publik TIDAK diberi akses ke koleksi ini. Renderer frontend
    // memakai Local API dengan overrideAccess + filter tenant/status eksplisit,
    // sehingga konten tidak bisa di-enumerasi lintas tenant lewat /api/pages.
    read: ({ req }) => Boolean(req.user),
    create: authenticated,
    update: authenticated,
    delete: authenticated,
    readVersions: authenticated,
  },
  hooks: {
    beforeValidate: [
      // Blok AdvancedHTML mengeksekusi HTML/CSS/JS mentah. Hanya superadmin
      // yang boleh memakainya agar tenant tidak bisa menyuntik kode sembarang.
      // Dipisah dari validasi slug agar tidak bisa dilewati request parsial
      // (mis. update tanpa mengirim field `slug`).
      async ({ data, originalDoc, req, context }) => {
        if (!data) return data
        if (context?.skipAdvancedHtmlValidation) return data
        if (isSuperAdmin(req.user as User | null)) return data

        // `canvasBlocks` lokalized: saat locale=all nilainya bisa berupa object
        // { id: [...], en: [...] }, bukan array. Flatten supaya guard tidak bisa
        // dilewati hanya dengan mengirim payload multi-locale.
        const flattenBlocks = (value: unknown): unknown[] => {
          if (Array.isArray(value)) return value
          if (value && typeof value === 'object') {
            return Object.values(value).flatMap((entry) => (Array.isArray(entry) ? entry : []))
          }
          return []
        }

        const blocks = [
          ...flattenBlocks(data.canvasBlocks),
          ...flattenBlocks(originalDoc?.canvasBlocks),
        ]

        const usesRawHtml = blocks.some(
          (block: unknown) =>
            Boolean(
              block &&
                typeof block === 'object' &&
                'blockType' in block &&
                (block as { blockType?: unknown }).blockType === 'AdvancedHTML',
            ),
        )

        if (usesRawHtml) {
          throw new APIError('Blok "Advanced HTML" hanya dapat dipakai oleh superadmin.', 403)
        }

        return data
      },
      async ({ data, originalDoc, req, context }) => {
        if (!data) return data
        if (context?.skipSlugValidation) return data
        if (!data.slug) return data

        const tenantRef = data.tenant ?? originalDoc?.tenant
        const tenantID =
          tenantRef && typeof tenantRef === 'object' ? tenantRef.id : tenantRef

        // Default tenant diisi oleh plugin multi-tenant. Jika belum tersedia,
        // biarkan validasi Payload/plugin yang menangani.
        if (!tenantID) return data

        const parentRef = data.parent ?? originalDoc?.parent
        const parentID =
          parentRef && typeof parentRef === 'object' ? parentRef.id : parentRef

        const duplicate = await req.payload.find({
          collection: 'pages',
          where: {
            and: [
              { tenant: { equals: tenantID } },
              { slug: { equals: data.slug } },
              parentID
                ? { parent: { equals: parentID } }
                : { parent: { exists: false } },
              ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
            ],
          },
          limit: 1,
          depth: 0,
          overrideAccess: true,
          req,
        })

        if (duplicate.docs.length > 0) {
          throw new APIError(
            `Slug "${data.slug}" sudah dipakai halaman lain di tenant ini pada level yang sama.`,
            400,
          )
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        // Halaman memengaruhi lookup halaman, href navbar/footer (relasi page),
        // redirect otomatis, dan sitemap. Buang cache halaman + chrome turunannya.
        await invalidateContent([CACHE_TAGS.pages, CACHE_TAGS.redirects])

        // Rename / pindah halaman -> simpan redirect path lama ke path baru.
        // Memakai `req` yang sama supaya ikut transaksi penyimpanan halaman.
        const tenantRef = (doc as Page).tenant
        const tenantID =
          tenantRef && typeof tenantRef === 'object' ? tenantRef.id : tenantRef

        if (!tenantID) return

        try {
          await syncRedirectForPageChange({
            payload: req.payload,
            req,
            previousDoc: operation === 'update' ? (previousDoc as Page) : null,
            doc: doc as Page,
            tenantID,
          })
        } catch (error) {
          // Redirect adalah fitur kenyamanan; jangan sampai menggagalkan
          // penyimpanan halaman.
          req.payload.logger.error(
            `Gagal menyimpan redirect untuk halaman ${doc.id ?? 'baru'}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          )
        }
      },
    ],
    afterDelete: [
      async () => {
        await invalidateContent([CACHE_TAGS.pages])
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: 'Judul Halaman (Page Title)',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
      unique: false, // unik per tenant + parent, divalidasi oleh hook
      label: 'Slug Halaman (Cth: home, profil, tentang-kami)',
      admin: {
        description:
          'Gunakan "home" untuk halaman beranda. Slug hanya perlu unik di antara halaman bersaudara dalam tenant yang sama.',
      },
    },
    // Parent & breadcrumbs ditangani plugin nested-docs. filterOptions di
    // bawah mempertahankan pencegahan cycle bawaan plugin; filter tenant
    // ditambahkan otomatis oleh multiTenantPlugin.
    createParentField('pages', {
      admin: {
        position: 'sidebar',
        description: 'Pilih halaman induk dari tenant yang sama.',
      },
      filterOptions: ({ id }) => {
        if (!id) return true

        return {
          id: { not_equals: id },
          'breadcrumbs.doc': { not_in: [id] },
        }
      },
    }),
    {
      name: 'themePreset',
      type: 'relationship',
      relationTo: 'themes',
      label: 'Preset Tema',
      admin: { width: '50%' },
    },
    {
      name: 'layoutMode',
      type: 'select',
      label: 'Layout Halaman',
      options: [
        { label: 'Ikuti layout situs (navbar/footer otomatis)', value: 'inherit' },
        { label: 'Kanvas penuh (navbar/footer di dalam blok)', value: 'canvas' },
        { label: 'Polos (tanpa navbar/footer)', value: 'bare' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'Kosongkan untuk mengikuti layout default tenant. Pilih "Kanvas penuh" jika halaman ini memakai blok Navbar/Footer sendiri.',
      },
    },
    {
      name: 'canvasBlocks',
      type: 'blocks',
      localized: true,
      label: 'Susunan Blok Kanvas (Canvas Renderer)',
      blocks: getDynamicBlocks(),
    },
  ],
}
