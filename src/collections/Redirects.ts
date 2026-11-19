import { APIError, type CollectionConfig } from 'payload'
import { authenticated, superAdminOnly } from '@/access'
import { CACHE_TAGS, invalidateContent } from '@/lib/contentCache'
import { normalizeRedirectTarget } from '@/lib/redirectPath'
import { normalizePagePath } from '@/lib/urls'

/**
 * Redirect lama -> baru.
 *
 * Sebagian besar baris dibuat otomatis ketika halaman di-rename
 * (`syncRedirectForPageChange`), tetapi superadmin juga bisa menambah redirect
 * manual untuk URL kampanye atau tautan lama dari situs sebelumnya.
 */
export const Redirects: CollectionConfig = {
  slug: 'redirects',
  labels: {
    singular: 'Redirect',
    plural: 'Redirect',
  },
  admin: {
    useAsTitle: 'from',
    defaultColumns: ['from', 'to', 'statusCode', 'automatic', 'tenant', 'updatedAt'],
    group: 'Situs',
    description:
      'Dibuat otomatis saat slug halaman berubah. Redirect manual juga bisa ditambahkan di sini.',
  },
  access: {
    // Frontend memakai Local API (overrideAccess). Di panel admin, plugin
    // multi-tenant membatasi tenant user ke tenant miliknya.
    read: authenticated,
    // Redirect bisa mengarahkan pengguna ke URL lain. Mutasi dibatasi
    // superadmin di UI admin. Redirect otomatis dari rename halaman tetap
    // berjalan karena syncRedirectForPathChange memakai overrideAccess: true.
    create: superAdminOnly,
    update: superAdminOnly,
    delete: superAdminOnly,
  },
  hooks: {
    beforeValidate: [
      async ({ data, originalDoc, req, context }) => {
        if (!data) return data
        if (context?.skipRedirectValidation) return data

        const fromRaw = data.from ?? originalDoc?.from
        const toRaw = data.to ?? originalDoc?.to

        const from = fromRaw ? normalizePagePath(String(fromRaw)) : ''
        const to = toRaw ? normalizeRedirectTarget(String(toRaw)) : ''

        if (!from) throw new APIError('Path asal wajib diisi.', 400)
        if (!to) throw new APIError('Path tujuan wajib diisi.', 400)
        if (from === to) {
          throw new APIError('Path asal dan tujuan tidak boleh sama.', 400)
        }

        data.from = from
        data.to = to

        const tenantRef = data.tenant ?? originalDoc?.tenant
        const tenantID =
          tenantRef && typeof tenantRef === 'object' ? tenantRef.id : tenantRef

        if (!tenantID) return data

        const duplicate = await req.payload.find({
          collection: 'redirects',
          where: {
            and: [
              { tenant: { equals: tenantID } },
              { from: { equals: from } },
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
            `Redirect dari "${from}" sudah ada untuk tenant ini. Ubah baris yang ada.`,
            400,
          )
        }

        return data
      },
    ],
    afterChange: [
      async () => {
        await invalidateContent([CACHE_TAGS.redirects])
      },
    ],
    afterDelete: [
      async () => {
        await invalidateContent([CACHE_TAGS.redirects])
      },
    ],
  },
  fields: [
    {
      name: 'from',
      type: 'text',
      required: true,
      index: true,
      label: 'Dari path',
      admin: {
        description: 'Path lama, contoh: /tentang. Selalu diawali garis miring.',
      },
    },
    {
      name: 'to',
      type: 'text',
      required: true,
      label: 'Ke path / URL',
      admin: {
        description:
          'Path baru (contoh: /tentang-kami) atau URL lengkap (https://...) untuk tujuan eksternal.',
      },
    },
    {
      name: 'statusCode',
      type: 'select',
      required: true,
      defaultValue: '301',
      label: 'Jenis redirect',
      options: [
        { label: '301 — Permanen (disarankan)', value: '301' },
        { label: '302 — Sementara', value: '302' },
      ],
    },
    {
      name: 'automatic',
      type: 'checkbox',
      defaultValue: false,
      label: 'Dibuat otomatis',
      admin: {
        readOnly: true,
        description: 'Ditandai sistem saat halaman di-rename. Boleh dihapus manual.',
        position: 'sidebar',
      },
    },
    {
      name: 'note',
      type: 'text',
      label: 'Catatan',
      admin: {
        description: 'Opsional, mis. alasan redirect atau sumber tautan lama.',
        position: 'sidebar',
      },
    },
  ],
}
