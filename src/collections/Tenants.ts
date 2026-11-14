// src/collections/Tenants.ts
import { APIError, type CollectionConfig } from 'payload'
import {
  superAdminFieldOnly,
  superAdminOnly,
} from '@/access'
import { normalizeHost, isPlatformSubdomain } from '@/lib/urls'
import {
  RESERVED_SLUGS,
  TENANT_SLUG_REGEX,
  isValidTenantSlug,
  slugifyTenantName,
} from '@/lib/site'

type HostEntry = {
  host?: string | null
  kind?: 'subdomain' | 'custom' | null
  verified?: boolean | null
  isPrimary?: boolean | null
}

type TenantData = {
  id?: string
  name?: string | null
  slug?: string | null
  type?: 'platform' | 'individual' | 'corporate' | null
  status?: 'active' | 'suspended' | null
  hosts?: HostEntry[] | null
  domain?: string | null
}

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'type', 'status', 'updatedAt'],
  },
  access: {
    // Frontend memakai Local API dengan overrideAccess, jadi publik tidak
    // membutuhkan akses REST ke daftar tenant.
    read: ({ req }) => Boolean(req.user),
    create: superAdminOnly,
    delete: superAdminOnly,
    update: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeValidate: [
      async ({ data, originalDoc, operation, req, context }) => {
        if (context?.skipTenantValidation) return data

        const next = { ...(data as TenantData) }
        const effective: TenantData = {
          ...((originalDoc as TenantData | undefined) || {}),
          ...next,
        }

        // Normalisasi handle.
        if (effective.type !== 'platform') {
          const rawSlug =
            next.slug !== undefined
              ? next.slug
              : effective.slug || slugifyTenantName(effective.name || '')

          if (rawSlug) {
            const slug = String(rawSlug).trim().toLowerCase()
            if (!TENANT_SLUG_REGEX.test(slug) || RESERVED_SLUGS.has(slug)) {
              throw new APIError(
                'Slug tenant tidak valid. Gunakan huruf kecil, angka, dan tanda hubung. Slug sistem (admin, api, en, profil, dll) tidak boleh dipakai.',
                400,
              )
            }
            next.slug = slug
            effective.slug = slug
          }
        } else if (next.slug) {
          next.slug = String(next.slug).trim().toLowerCase()
          effective.slug = next.slug
        }

        if (
          operation === 'create' &&
          effective.type !== 'platform' &&
          !isValidTenantSlug(effective.slug)
        ) {
          throw new APIError('Slug tenant wajib diisi dan valid.', 400)
        }

        // Handle unik antar tenant.
        if (next.slug) {
          const duplicateSlug = await req.payload.find({
            collection: 'tenants',
            where: {
              slug: { equals: next.slug },
              ...(originalDoc?.id ? { id: { not_equals: originalDoc.id } } : {}),
            },
            limit: 1,
            depth: 0,
            overrideAccess: true,
            req,
          })

          if (duplicateSlug.docs.length > 0) {
            throw new APIError('Slug tenant sudah dipakai.', 400)
          }

          // Handle tenant tidak boleh menabrak halaman platform di root domain.
          if (effective.type !== 'platform') {
            // Hanya halaman milik tenant platform yang menjadi route root.
            const platformTenant = await req.payload.find({
              collection: 'tenants',
              where: { type: { equals: 'platform' } },
              limit: 1,
              depth: 0,
              overrideAccess: true,
              req,
            })
            const platformID = platformTenant.docs[0]?.id

            const platformPageCollision = await req.payload.find({
              collection: 'pages',
              where: {
                and: [
                  { slug: { equals: next.slug } },
                  { parent: { exists: false } },
                  {
                    or: [
                      ...(platformID ? [{ tenant: { equals: platformID } }] : []),
                      { tenant: { exists: false } },
                    ],
                  },
                ],
              },
              limit: 1,
              depth: 0,
              overrideAccess: true,
              req,
            })

            if (platformPageCollision.docs.length > 0) {
              throw new APIError(
                'Slug ini sudah dipakai halaman platform. Pilih slug tenant lain.',
                400,
              )
            }
          }
        }

        // Normalisasi dan validasi daftar host.
        if (next.hosts !== undefined || operation === 'create') {
          const hosts = (next.hosts || []).map((entry) => ({
            ...entry,
            host: normalizeHost(entry.host),
          }))

          const seen = new Set<string>()
          let primaryCount = 0

          for (const entry of hosts) {
            if (!entry.host) {
              throw new APIError('Host tenant tidak boleh kosong.', 400)
            }
            if (seen.has(entry.host)) {
              throw new APIError(`Host "${entry.host}" duplikat dalam tenant ini.`, 400)
            }
            seen.add(entry.host)

            if (!entry.kind) {
              entry.kind = isPlatformSubdomain(entry.host) ? 'subdomain' : 'custom'
            }
            if (entry.isPrimary) primaryCount += 1

            const duplicateHost = await req.payload.find({
              collection: 'tenants',
              where: {
                'hosts.host': { equals: entry.host },
                ...(originalDoc?.id ? { id: { not_equals: originalDoc.id } } : {}),
              },
              limit: 1,
              depth: 0,
              overrideAccess: true,
              req,
            })

            if (duplicateHost.docs.length > 0) {
              throw new APIError(`Host "${entry.host}" sudah dipakai tenant lain.`, 400)
            }
          }

          if (primaryCount > 1) {
            throw new APIError('Hanya boleh ada satu host primary per tenant.', 400)
          }
          if (hosts.length > 0 && primaryCount === 0) {
            hosts[0].isPrimary = true
          }

          next.hosts = hosts
        }

        return next
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nama Tenant / Brand',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'Handle Tenant',
      access: {
        create: superAdminFieldOnly,
        update: superAdminFieldOnly,
      },
      admin: {
        position: 'sidebar',
        description:
          'Handle publik untuk akses subpath, contoh "faishal" pada oplay.id/faishal. Tidak bisa diubah oleh admin tenant.',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'individual',
      index: true,
      options: [
        { label: 'Platform (oplay.id)', value: 'platform' },
        { label: 'Individu (subpath)', value: 'individual' },
        { label: 'Korporasi (custom domain)', value: 'corporate' },
      ],
      access: {
        create: superAdminFieldOnly,
        update: superAdminFieldOnly,
      },
      admin: {
        position: 'sidebar',
        description:
          'Platform hanya untuk situs utama. Individu selalu diakses lewat subpath. Korporasi dapat memakai custom domain.',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      index: true,
      options: [
        { label: 'Aktif', value: 'active' },
        { label: 'Ditangguhkan', value: 'suspended' },
      ],
      access: {
        create: superAdminFieldOnly,
        update: superAdminFieldOnly,
      },
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'hosts',
      type: 'array',
      labels: { singular: 'Host', plural: 'Daftar Host' },
      access: {
        create: superAdminFieldOnly,
        update: superAdminFieldOnly,
      },
      admin: {
        description:
          'Dikelola superadmin. Custom domain wajib diverifikasi DNS sebelum dipakai publik. Subdomain *.oplay.id hanya untuk kebutuhan platform.',
      },
      fields: [
        {
          name: 'host',
          type: 'text',
          required: true,
          index: true,
          label: 'Host',
          admin: {
            description: 'Tanpa protokol dan tanpa www, contoh: ylbhsikap.or.id',
          },
        },
        {
          name: 'kind',
          type: 'select',
          required: true,
          defaultValue: 'custom',
          options: [
            { label: 'Custom domain', value: 'custom' },
            { label: 'Subdomain platform', value: 'subdomain' },
          ],
        },
        {
          name: 'verified',
          type: 'checkbox',
          defaultValue: false,
          label: 'DNS terverifikasi',
        },
        {
          name: 'isPrimary',
          type: 'checkbox',
          defaultValue: false,
          label: 'Host utama (canonical)',
        },
      ],
    },
    {
      name: 'favicon',
      type: 'text',
      label: 'URL Favicon',
      admin: {
        description:
          'URL favicon untuk seluruh halaman tenant ini, contoh /images/favicon.ico atau URL CDN.',
      },
    },
    {
      name: 'themePreset',
      type: 'select',
      defaultValue: 'default-theme',
      options: [
        { label: 'Default Theme', value: 'default-theme' },
        { label: 'Cyber Neon', value: 'cyber-neon' },
        { label: 'Justice Public', value: 'justice-public-theme' },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO Default Tenant',
      fields: [
        { name: 'title', type: 'text', label: 'Default title' },
        { name: 'description', type: 'textarea', label: 'Default description' },
        {
          name: 'noIndex',
          type: 'checkbox',
          defaultValue: false,
          label: 'Jangan indeks situs ini',
        },
      ],
    },
    {
      name: 'domain',
      type: 'text',
      label: 'Domain (legacy)',
      unique: true,
      access: {
        create: superAdminFieldOnly,
        update: superAdminFieldOnly,
      },
      admin: {
        hidden: true,
        readOnly: true,
        description:
          'Dipertahankan sementara untuk migrasi data lama. Gunakan field hosts.',
      },
    },
  ],
}
