// src/app/(frontend)/[[...segments]]/page.tsx
import { cache } from 'react'
import { headers } from 'next/headers'
import { draftMode } from 'next/headers'
import { notFound, permanentRedirect, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import CanvasRenderer from '@/components/CanvasRenderer'
import { getComponentRegistryMap } from '@/components/componentRegistry'
import SiteShell from '@/components/SiteShell'
import RoutableDetail from '@/components/content/RoutableDetail'
import InvitationDetail from '@/components/content/InvitationDetail'
import PageLivePreview from '@/components/content/PageLivePreview'
import { getPageForRequest, type PageLayoutData } from '@/lib/pageBuilder'
import { getRoutableForRequest, type RoutableContentData } from '@/lib/routableContent'
import { getInvitationForRequest, type InvitationContentData } from '@/lib/invitations'
import { getRedirectURL } from '@/lib/redirects'
import { getServerURL, localizePath } from '@/lib/urls'
import { userHasTenantAccess } from '@/access'
import type { User } from '@/payload-types'

type Props = {
  params: Promise<{
    segments?: string[]
  }>
}

type ResolvedRequest =
  | { kind: 'page'; data: PageLayoutData }
  | { kind: 'invitation'; data: InvitationContentData }
  | { kind: 'content'; data: RoutableContentData }
  | null

async function getAuthenticatedUser(headersList: Headers): Promise<User | null> {
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: headersList })
    return (user as User | null) || null
  } catch {
    return null
  }
}

async function getRequestState() {
  const [headersList, draft] = await Promise.all([headers(), draftMode()])
  const requestHeaders = new Headers(headersList)
  const host = requestHeaders.get('host') || 'localhost:3000'

  // draftMode hanya boleh menghasilkan data draft jika user masih login.
  // Cookie preview yang tersisa di browser publik tidak membocorkan draft.
  const user = draft.isEnabled ? await getAuthenticatedUser(requestHeaders) : null

  return { host, isPreview: Boolean(user), user }
}

/**
 * Satu request bisa berupa halaman blok (`Pages`), undangan tamu
 * (`/undangan/<nama>-<kode>`), atau konten routable (artikel). Halaman menang
 * bila path-nya sama, sehingga editor tetap bisa membuat halaman statis di
 * atas prefix konten.
 */
const resolveRequest = cache(
  async (host: string, segments: string[], isPreview: boolean): Promise<ResolvedRequest> => {
    const page = await getPageForRequest(host, segments, isPreview)
    if (page) return { kind: 'page', data: page }

    const invitation = await getInvitationForRequest(host, segments, isPreview)
    if (invitation) return { kind: 'invitation', data: invitation }

    const content = await getRoutableForRequest(host, segments, isPreview)
    if (content) return { kind: 'content', data: content }

    return null
  },
)

/** Draft hanya boleh dilihat oleh anggota tenant pemilik konten. */
function canViewData(resolved: ResolvedRequest, user: User | null): boolean {
  if (!resolved) return false
  const { data } = resolved
  if (!data.isPreview) return true
  const tenantID = resolved.kind === 'page' ? data.tenant.id : data.tenantID
  return Boolean(user && userHasTenantAccess(user, tenantID))
}

function metaFromResolved(resolved: ResolvedRequest) {
  if (!resolved) return null
  return {
    meta: resolved.data.meta,
    title: resolved.data.title,
    tenant: resolved.data.tenant,
    favicon: resolved.data.favicon,
    canonicalURL: resolved.data.canonicalURL,
    alternateURLs: resolved.data.alternateURLs,
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { segments = [] } = await params
  const { host, isPreview, user } = await getRequestState()
  const resolved = await resolveRequest(host, segments, isPreview)

  const info = canViewData(resolved, user) ? metaFromResolved(resolved) : null

  if (!info) {
    return {
      title: 'Halaman tidak ditemukan — OPLAY.ID',
      robots: { index: false, follow: false },
    }
  }

  const seo = info.meta || {}
  const ogImage =
    typeof seo.image === 'object' && seo.image?.url
      ? new URL(seo.image.url, getServerURL()).toString()
      : typeof seo.image === 'string'
        ? new URL(seo.image, getServerURL()).toString()
        : undefined

  const tenantSEO = (info.tenant as { seo?: { noIndex?: boolean | null } | null }).seo
  // Undangan selalu noindex: berisi nama tamu dan URL pribadi.
  const noIndex =
    resolved?.kind === 'invitation' || isPreview || Boolean(tenantSEO?.noIndex)

  return {
    metadataBase: new URL(getServerURL()),
    title: seo.title || info.title || 'OPLAY.ID',
    description: seo.description || undefined,
    keywords: seo.keywords || undefined,
    icons: { icon: info.favicon },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    alternates: {
      canonical: info.canonicalURL,
      languages: info.alternateURLs,
    },
    openGraph: {
      title: seo.title || info.title || 'OPLAY.ID',
      description: seo.description || undefined,
      type: 'website',
      url: info.canonicalURL,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title || info.title || 'OPLAY.ID',
      description: seo.description || undefined,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

export default async function UniversalPage({ params }: Props) {
  const { segments = [] } = await params
  const { host, isPreview, user } = await getRequestState()
  const resolved = await resolveRequest(host, segments, isPreview)

  // URL lama dari halaman/artikel yang di-rename: arahkan permanen ke path
  // barunya. Preview tidak dialihkan agar editor bisa membuka draft.
  if (!resolved && !isPreview) {
    const match = await getRedirectURL({ host, segments })
    if (match) {
      if (match.statusCode === '302') redirect(match.url)
      permanentRedirect(match.url)
    }
  }

  if (!canViewData(resolved, user) || !resolved) notFound()

  // Alias prefix (mis. /blog/foo) selalu dialihkan ke canonical (/artikel/foo).
  if (resolved.kind === 'content' && resolved.data.needsCanonicalRedirect) {
    const { data } = resolved
    permanentRedirect(localizePath(data.contentPath, data.basePath, data.locale))
  }

  // Tamu yang membuka /undangan/<kode> diarahkan ke linkSlug canonical.
  if (resolved.kind === 'invitation' && resolved.data.needsCanonicalRedirect) {
    const { data } = resolved
    permanentRedirect(localizePath(data.contentPath, data.basePath, data.locale))
  }

  if (resolved.kind === 'invitation') {
    return (
      <SiteShell
        chrome={resolved.data.chrome}
        layoutMode={resolved.data.layoutMode}
        basePath={resolved.data.basePath}
        locale={resolved.data.locale}
        isPreview={resolved.data.isPreview}
      >
        <InvitationDetail data={resolved.data} />
      </SiteShell>
    )
  }

  if (resolved.kind === 'content') {
    return (
      <SiteShell
        chrome={resolved.data.chrome}
        layoutMode={resolved.data.layoutMode}
        basePath={resolved.data.basePath}
        locale={resolved.data.locale}
        isPreview={resolved.data.isPreview}
      >
        <RoutableDetail data={resolved.data} />
      </SiteShell>
    )
  }

  const { data } = resolved

  // Live Preview resmi (useLivePreview) khusus Pages: konten kanvas & judul
  // mengikuti perubahan form admin secara realtime, tanpa menunggu autosave.
  if (data.isPreview) {
    return <PageLivePreview initialData={data} />
  }

  return (
    <SiteShell
      chrome={data.chrome}
      layoutMode={data.layoutMode}
      basePath={data.basePath}
      locale={data.locale}
      isPreview={data.isPreview}
    >
      <CanvasRenderer layoutData={data} components={getComponentRegistryMap()} />
    </SiteShell>
  )
}
