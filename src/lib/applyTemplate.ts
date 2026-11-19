import type { Payload, PayloadRequest } from 'payload'
import type { Tenant } from '@/payload-types'
import { isSuperAdmin } from '@/access'

/**
 * Menyalin isi sebuah template ke tenant: halaman, navbar, footer, dan tema.
 *
 * Aturan penting:
 * - Halaman yang slug-nya sudah ada di tenant tidak ditimpa (aman dijalankan
 *   berulang), kecuali `overwrite` untuk navbar/footer/tema.
 * - Tautan `pageSlug` pada navbar/footer template diubah menjadi relasi
 *   `page` milik tenant, jadi link ikut menyesuaikan saat slug halaman berubah.
 * - Semua ID dari dokumen template dibuang agar Payload membuat ID baru.
 */

type TemplatePage = {
  title?: string | null
  slug?: string | null
  parentSlug?: string | null
  layoutMode?: 'inherit' | 'canvas' | 'bare' | null
  blocks?: unknown[] | null
}

export type TemplateLike = {
  id: string
  name?: string | null
  slug?: string | null
  themePreset?: string | { id: string; slug?: string | null } | null
  defaultLayoutMode?: 'inherit' | 'canvas' | 'bare' | null
  navigation?: Record<string, unknown> | null
  footer?: Record<string, unknown> | null
  pages?: TemplatePage[] | null
}

export type ApplyTemplateResult = {
  /** Path halaman yang berhasil dibuat. */
  createdPages: string[]
  /** Path halaman yang dilewati karena sudah ada. */
  skippedPages: string[]
  /** True bila navbar/footer/tema tenant ikut diperbarui. */
  updatedTenant: boolean
  warnings: string[]
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

/** Buang semua `id` agar tidak menabrak dokumen lain saat disalin. */
function stripIds(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripIds)
  if (!isPlainObject(value)) return value

  const out: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(value)) {
    if (key === 'id') continue
    out[key] = stripIds(val)
  }
  return out
}

/** Ubah `pageSlug` template menjadi relasi `page` milik tenant. */
function resolvePageSlugs(value: unknown, slugToID: Map<string, string>): unknown {
  if (Array.isArray(value)) return value.map((item) => resolvePageSlugs(item, slugToID))
  if (!isPlainObject(value)) return value

  const out: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(value)) {
    if (key === 'pageSlug') continue
    out[key] = resolvePageSlugs(val, slugToID)
  }

  const pageSlug = value.pageSlug
  if (typeof pageSlug === 'string' && pageSlug) {
    const pageID = slugToID.get(pageSlug)
    if (pageID) {
      out.page = pageID
    } else {
      // Halaman tujuan tidak ada: biarkan href manual (jika ada) yang dipakai.
      delete out.page
    }
  }

  return out
}

function pagePath(parentPath: string, slug: string): string {
  if (!parentPath || parentPath === '/') return slug === 'home' ? '/' : `/${slug}`
  const base = parentPath.replace(/\/$/, '')
  return `${base}/${slug}`
}

function navigationIsEmpty(navigation: Tenant['navigation'] | undefined | null): boolean {
  if (!navigation) return true

  // `loginCta`/`languages` punya nilai default sehingga selalu terisi pada
  // tenant baru. Yang menentukan "sudah diatur" adalah brand dan daftar menu.
  return !navigation.brandName && (navigation.categories?.length ?? 0) === 0
}

function footerIsEmpty(footer: Tenant['footer'] | undefined | null): boolean {
  if (!footer) return true
  return (
    !footer.companyName &&
    !footer.tagline &&
    (footer.columns?.length ?? 0) === 0
  )
}

function relationshipID(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null
  return typeof value === 'string' ? value : value.id
}

export async function applyTemplateToTenant({
  payload,
  tenantID,
  templateID,
  overwrite = false,
  req,
}: {
  payload: Payload
  tenantID: string
  templateID: string
  overwrite?: boolean
  /** Teruskan request agar semua operasi berbagi satu transaksi. */
  req?: PayloadRequest
}): Promise<ApplyTemplateResult> {
  const tenant = (await payload.findByID({
    collection: 'tenants',
    id: tenantID,
    depth: 0,
    overrideAccess: true,
    req,
  })) as Tenant | null

  const template = (await payload.findByID({
    collection: 'templates',
    id: templateID,
    depth: 0,
    overrideAccess: true,
    req,
  })) as TemplateLike | null

  if (!tenant) throw new Error('Tenant tidak ditemukan.')
  if (!template) throw new Error('Template tidak ditemukan.')

  const existing = await payload.find({
    collection: 'pages',
    where: { tenant: { equals: tenantID } },
    limit: 2000,
    depth: 0,
    pagination: false,
    overrideAccess: true,
    select: { slug: true, parent: true },
    req,
  })

  const existingKeys = new Set<string>()
  const existingIDByKey = new Map<string, string>()

  for (const doc of existing.docs as Array<{
    id: string
    slug?: string | null
    parent?: unknown
  }>) {
    const parentID =
      doc.parent && typeof doc.parent === 'object'
        ? (doc.parent as { id: string }).id
        : (doc.parent as string | null | undefined)
    const key = `${parentID || 'root'}:${doc.slug}`
    existingKeys.add(key)
    existingIDByKey.set(key, doc.id)
  }

  const result: ApplyTemplateResult = {
    createdPages: [],
    skippedPages: [],
    updatedTenant: false,
    warnings: [],
  }

  const templatePages = (template.pages || []).filter(
    (page): page is TemplatePage => Boolean(page?.slug),
  )

  const slugToID = new Map<string, string>()
  const pathBySlug = new Map<string, string>()
  const placed = new Set<string>()

  // Beberapa putaran agar halaman anak bisa dibuat setelah induknya.
  for (let pass = 0; pass <= templatePages.length; pass += 1) {
    const pending = templatePages.filter((page) => !placed.has(String(page.slug)))
    if (pending.length === 0) break

    let progressed = false

    for (const page of pending) {
      const slug = String(page.slug)
      const parentSlug = page.parentSlug?.trim() || null

      if (parentSlug && !placed.has(parentSlug)) continue

      const parentID = parentSlug ? slugToID.get(parentSlug) : null
      const parentPath = parentSlug ? pathBySlug.get(parentSlug) || '/' : ''
      const pagePathValue = pagePath(parentPath, slug)

      const key = `${parentID || 'root'}:${slug}`
      if (existingKeys.has(key)) {
        result.skippedPages.push(pagePathValue)
        placed.add(slug)
        const existingID = existingIDByKey.get(key)
        if (existingID) slugToID.set(slug, existingID)
        pathBySlug.set(slug, pagePathValue)
        progressed = true
        continue
      }

      const layoutMode =
        page.layoutMode && page.layoutMode !== 'inherit'
          ? page.layoutMode
          : template.defaultLayoutMode || undefined

      const strippedBlocks = (stripIds(page.blocks || []) as unknown[]) || []
      // Blok AdvancedHTML mengeksekusi HTML/JS mentah. Template umumnya dibuat
      // superadmin, tetapi tenant user juga bisa menekan "Terapkan template".
      // Jadi blok itu hanya dipertahankan bila peminta memang superadmin;
      // untuk user lain dibuang sebelum create (guard Pages tetap aktif).
      const requesterIsSuperAdmin = isSuperAdmin(req?.user as never)
      const safeBlocks = requesterIsSuperAdmin
        ? strippedBlocks
        : strippedBlocks.filter(
            (block) =>
              !block ||
              typeof block !== 'object' ||
              (block as { blockType?: string | null }).blockType !== 'AdvancedHTML',
          )

      const created = await payload.create({
        collection: 'pages',
        data: {
          title: page.title || slug,
          slug,
          tenant: tenantID,
          _status: 'published',
          ...(layoutMode ? { layoutMode } : {}),
          ...(parentID ? { parent: parentID } : {}),
          canvasBlocks: safeBlocks as never,
        },
        depth: 0,
        overrideAccess: true,
        req,
        // Hanya dilewati untuk superadmin; untuk user lain blok AdvancedHTML
        // sudah dibuang di atas sehingga validasi normal tetap berjalan.
        ...(requesterIsSuperAdmin
          ? { context: { skipAdvancedHtmlValidation: true } }
          : {}),
      })

      existingKeys.add(key)
      slugToID.set(slug, created.id)
      pathBySlug.set(slug, pagePathValue)
      placed.add(slug)
      result.createdPages.push(pagePathValue)
      progressed = true
    }

    if (!progressed) break
  }

  for (const page of templatePages) {
    const slug = String(page.slug)
    if (!placed.has(slug)) {
      result.warnings.push(
        `Halaman "${slug}" dilewati: induk "${page.parentSlug}" tidak ada di template.`,
      )
    }
  }

  const tenantData: Record<string, unknown> = {}

  if (template.navigation && (overwrite || navigationIsEmpty(tenant.navigation))) {
    tenantData.navigation = resolvePageSlugs(
      stripIds(template.navigation),
      slugToID,
    )
  }

  if (template.footer && (overwrite || footerIsEmpty(tenant.footer))) {
    tenantData.footer = resolvePageSlugs(stripIds(template.footer), slugToID)
  }

  // Template menyimpan relasi ke Themes, sedangkan tenant menyimpan slug tema
  // sebagai text. Resolve dulu ke slug agar nilai yang ditulis valid.
  const themeRef = template.themePreset
  let themeSlug: string | null = null

  if (themeRef && typeof themeRef === 'object') {
    themeSlug = themeRef.slug || themeRef.id
  } else if (themeRef) {
    try {
      const theme = (await payload.findByID({
        collection: 'themes',
        id: themeRef,
        depth: 0,
        overrideAccess: true,
        req,
      })) as { slug?: string | null } | null
      themeSlug = theme?.slug || themeRef
    } catch {
      themeSlug = themeRef
    }
  }

  const currentTheme = typeof tenant.themePreset === 'string' ? tenant.themePreset : null
  if (themeSlug && (overwrite || !currentTheme || currentTheme === 'default-theme')) {
    tenantData.themePreset = themeSlug
  }

  if (Object.keys(tenantData).length > 0) {
    await payload.update({
      collection: 'tenants',
      id: tenantID,
      data: tenantData as never,
      depth: 0,
      overrideAccess: true,
      req,
      context: { skipTenantValidation: true },
    })
    result.updatedTenant = true
  }

  return result
}
