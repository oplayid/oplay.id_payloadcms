// payload.config.ts
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

// 1. Impor koleksi & plugin
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Themes } from './collections/Themes'
import { Tenants } from './collections/Tenants'
import { Templates } from './collections/Templates'
import { Redirects } from './collections/Redirects'
import { Posts } from './collections/Posts'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import { s3Storage } from '@payloadcms/storage-s3'
import { Config } from './payload-types'
import { isSuperAdmin } from './access'
import { ensurePlatformTenant } from './lib/ensurePlatformTenant'
import { getServerURL } from './lib/urls'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: getServerURL(),
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      afterLogin: ['@/components/admin/PocketIDButton'],
    },
  },
  // 2. Daftarkan koleksi (termasuk Tenants)
  collections: [Users, Media, Pages, Themes, Tenants, Templates, Redirects, Posts],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',

  // --- 3. LOKALISASI ---
  localization: {
    locales: [
      {
        label: 'Bahasa Indonesia',
        code: 'id',
      },
      {
        label: 'English',
        code: 'en',
      },
    ],
    defaultLocale: 'id',
    fallback: true,
  },
  // ---------------------

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  sharp,

  onInit: async (payload) => {
    await ensurePlatformTenant(payload)
  },

  // --- 4. DAFTARKAN SEMUA PLUGIN DI SINI ---
  plugins: [
    seoPlugin({
      collections: ['pages', 'posts'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => (doc?.title ? `${doc.title} — OPLAY.ID` : 'OPLAY.ID'),
      generateDescription: ({ doc }) =>
        doc?.meta?.description || 'Platform eksekusi bisnis dan legal teknologi.',
    }),
    multiTenantPlugin<Config>({
      collections: {
        pages: {},
        posts: {},
        media: {},
        redirects: {},
      },
      tenantsSlug: 'tenants',
      userHasAccessToAllTenants: (user) => isSuperAdmin(user),
      // Koleksi users punya access control sendiri (self + superadmin).
      useUsersTenantFilter: false,
    }),
    // Nested Docs Plugin harus berjalan setelah tenant agar filter parent
    // otomatis digabung dengan filter tenant.
    nestedDocsPlugin({
      collections: ['pages'],
      generateLabel: (_, doc) => String(doc.title || ''),
      // Home (slug "home") adalah root; turunannya tidak memakai prefix /home.
      generateURL: (docs) => {
        const slugs = docs.map((doc) => String(doc.slug)).filter(Boolean)
        if (slugs[0] === 'home' || slugs[0] === 'beranda' || slugs[0] === 'index') {
          slugs.shift()
        }
        return slugs.length > 0 ? `/${slugs.join('/')}` : '/'
      },
    }),
    s3Storage({
      enabled: Boolean(
        process.env.R2_BUCKET &&
          process.env.R2_ACCESS_KEY_ID &&
          process.env.R2_SECRET_ACCESS_KEY &&
          process.env.R2_ENDPOINT,
      ),
      collections: {
        media: {
          // Jika R2_PUBLIC_URL tersedia, bypass proxy server
          disablePayloadAccessControl: process.env.R2_PUBLIC_URL ? true : undefined,
          ...(process.env.R2_PUBLIC_URL
            ? {
                generateFileURL: ({ filename, prefix }) =>
                  `${process.env.R2_PUBLIC_URL}/${prefix ? `${prefix}/` : ''}${filename}`,
              }
            : {}),
        },
      },
      bucket: process.env.R2_BUCKET || '',
      config: {
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
        endpoint: process.env.R2_ENDPOINT || '',
        region: process.env.R2_REGION || 'auto',
        forcePathStyle: true,
      },
    }),
  ],
})
