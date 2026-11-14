// src/collections/Pages.ts
import { APIError, type CollectionConfig } from 'payload'
import { getDynamicBlocks } from './blocks'
import { createParentField } from '@payloadcms/plugin-nested-docs'
import { authenticated } from '@/access'
import { buildPreviewURL } from '@/lib/pagePaths'
import type { Page, Tenant } from '@/payload-types'
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
          page: (data || {}) as Page,
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
    // Publik hanya boleh membaca halaman published. Draft hanya bisa dibaca
    // lewat /preview yang sudah terautentikasi.
    read: ({ req }) =>
      req.user ? true : { _status: { equals: 'published' } },
    create: authenticated,
    update: authenticated,
    delete: authenticated,
    readVersions: authenticated,
  },
  hooks: {
    beforeValidate: [
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
      name: 'canvasBlocks',
      type: 'blocks',
      localized: true,
      label: 'Susunan Blok Kanvas (Canvas Renderer)',
      blocks: getDynamicBlocks(),
    },
  ],
}
