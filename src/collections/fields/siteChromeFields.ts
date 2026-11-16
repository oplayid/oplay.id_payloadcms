import type { Field } from 'payload'

/**
 * Definisi navbar & footer situs yang dipakai bersama oleh koleksi `tenants`
 * dan `templates`.
 *
 * Nama field sengaja identik agar template dapat disalin apa adanya ke tenant
 * (`applyTemplate`), dan `buildSiteChrome` hanya perlu membaca satu bentuk data.
 *
 * Perbedaan keduanya hanya cara menautkan halaman:
 * - `tenants`  -> relasi `page` (ikut berubah saat slug halaman berubah)
 * - `templates` -> `pageSlug` (di-resolve ke relasi `page` saat template diterapkan)
 */

type PageLinkMode = 'page' | 'slug'

function pageLinkFields(mode: PageLinkMode): Field[] {
  if (mode === 'slug') {
    return [
      {
        name: 'pageSlug',
        type: 'text',
        label: 'Slug halaman (opsional)',
        admin: {
          description:
            'Otomatis ditautkan ke halaman hasil salinan. Utamakan field ini daripada URL manual.',
        },
      },
    ]
  }

  return [
    {
      name: 'page',
      type: 'relationship',
      relationTo: 'pages',
      label: 'Tautkan ke halaman (opsional)',
      admin: { description: 'Diutamakan daripada URL manual.' },
    },
  ]
}

export function createNavigationField({ pageLink }: { pageLink: PageLinkMode }): Field {
  return {
    name: 'navigation',
    type: 'group',
    label: 'Navbar Situs (otomatis)',
    admin: {
      description:
        'Navbar yang dipakai otomatis oleh halaman ber-layout "Ikuti layout situs". Tidak wajib — halaman juga bisa memakai blok Navbar sendiri lewat layout "Kanvas penuh".',
    },
    fields: [
      {
        name: 'enabled',
        type: 'checkbox',
        defaultValue: true,
        label: 'Aktifkan navbar situs',
      },
      {
        name: 'style',
        type: 'select',
        defaultValue: 'navbar-standard',
        label: 'Varian navbar',
        options: [
          { label: 'Standard', value: 'navbar-standard' },
          { label: 'Cyber Terminal', value: 'navbar-cyber-terminal' },
          { label: 'Floating Island', value: 'navbar-floating-island' },
          { label: 'Command Palette', value: 'navbar-command-palette' },
          { label: 'Dual Tier', value: 'navbar-dual-tier' },
          { label: 'Dynamic Island', value: 'navbar-dynamic-island' },
          { label: 'Editorial', value: 'navbar-editorial' },
        ],
      },
      {
        name: 'brandName',
        type: 'text',
        label: 'Nama brand',
        admin: { description: 'Kosongkan untuk memakai nama tenant.' },
      },
      {
        name: 'categories',
        type: 'array',
        label: 'Menu navigasi',
        fields: [
          { name: 'label', type: 'text', required: true, label: 'Label menu' },
          ...pageLinkFields(pageLink),
          { name: 'href', type: 'text', label: 'URL manual' },
          {
            name: 'items',
            type: 'array',
            label: 'Submenu / mega menu',
            fields: [
              { name: 'label', type: 'text', required: true, label: 'Judul item' },
              { name: 'description', type: 'textarea', label: 'Deskripsi singkat' },
              ...pageLinkFields(pageLink),
              { name: 'href', type: 'text', label: 'URL manual' },
              { name: 'isFeatured', type: 'checkbox', label: 'Kartu unggulan' },
              {
                name: 'image',
                type: 'upload',
                relationTo: 'media',
                label: 'Gambar kartu unggulan',
              },
            ],
          },
        ],
      },
      {
        name: 'languages',
        type: 'array',
        label: 'Pilihan bahasa',
        fields: [
          { name: 'code', type: 'text', required: true, label: 'Kode (id/en)' },
          { name: 'label', type: 'text', required: true, label: 'Label singkat' },
          { name: 'name', type: 'text', label: 'Nama bahasa' },
          { name: 'flag', type: 'text', label: 'Emoji bendera' },
        ],
      },
      {
        name: 'loginCta',
        type: 'group',
        label: 'Tombol login',
        fields: [
          { name: 'label', type: 'text', defaultValue: 'Login', label: 'Label tombol' },
          { name: 'href', type: 'text', defaultValue: '/login', label: 'URL tombol' },
        ],
      },
    ],
  }
}

export function createFooterField({ pageLink }: { pageLink: PageLinkMode }): Field {
  return {
    name: 'footer',
    type: 'group',
    label: 'Footer Situs (otomatis)',
    fields: [
      {
        name: 'enabled',
        type: 'checkbox',
        defaultValue: true,
        label: 'Aktifkan footer situs',
      },
      {
        name: 'style',
        type: 'select',
        defaultValue: 'footer-standard',
        label: 'Varian footer',
        options: [
          { label: 'Standard', value: 'footer-standard' },
          { label: 'Terminal', value: 'footer-terminal' },
          { label: 'Massive Grid', value: 'footer-massive-grid' },
          { label: 'Minimal Center', value: 'footer-minimal-center' },
          { label: 'Status Bar', value: 'footer-status-bar' },
        ],
      },
      {
        name: 'companyName',
        type: 'text',
        label: 'Nama perusahaan / brand',
        admin: { description: 'Kosongkan untuk memakai nama tenant.' },
      },
      { name: 'tagline', type: 'textarea', label: 'Tagline singkat' },
      { name: 'year', type: 'number', label: 'Tahun hak cipta (opsional)' },
      {
        name: 'columns',
        type: 'array',
        label: 'Kolom tautan footer',
        fields: [
          { name: 'title', type: 'text', required: true, label: 'Judul kolom' },
          {
            name: 'links',
            type: 'array',
            label: 'Tautan',
            fields: [
              { name: 'label', type: 'text', required: true, label: 'Label' },
              ...pageLinkFields(pageLink),
              { name: 'href', type: 'text', label: 'URL manual' },
            ],
          },
        ],
      },
    ],
  }
}

/** Dipakai koleksi `tenants`: tautan memakai relasi dokumen halaman. */
export const navigationField = createNavigationField({ pageLink: 'page' })
export const footerField = createFooterField({ pageLink: 'page' })

/** Dipakai koleksi `templates`: tautan memakai slug halaman template. */
export const templateNavigationField = createNavigationField({ pageLink: 'slug' })
export const templateFooterField = createFooterField({ pageLink: 'slug' })
