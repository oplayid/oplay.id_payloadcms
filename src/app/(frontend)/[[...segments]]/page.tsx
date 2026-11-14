// src/app/(frontend)/[[...segments]]/page.tsx
import { headers } from 'next/headers'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import CanvasRenderer from '@/components/CanvasRenderer'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { SiteProvider } from '@/components/SiteProvider'
import { getPageForRequest } from '@/lib/pageBuilder'
import { getServerURL } from '@/lib/urls'
import { userHasTenantAccess } from '@/access'
import type { User } from '@/payload-types'

type Props = {
  params: Promise<{
    segments?: string[]
  }>
}

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

/** Draft hanya boleh dilihat oleh anggota tenant pemilik halaman. */
function canViewData(
  data: Awaited<ReturnType<typeof getPageForRequest>>,
  user: User | null,
): boolean {
  if (!data) return false
  if (!data.isPreview) return true
  return Boolean(user && userHasTenantAccess(user, data.tenant.id))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { segments = [] } = await params
  const { host, isPreview, user } = await getRequestState()
  const data = await getPageForRequest(host, segments, isPreview)

  if (!canViewData(data, user) || !data) {
    return {
      title: 'Halaman tidak ditemukan — OPLAY.ID',
      robots: { index: false, follow: false },
    }
  }

  const seo = data.meta || {}
  const ogImage =
    typeof seo.image === 'object' && seo.image?.url
      ? new URL(seo.image.url, getServerURL()).toString()
      : typeof seo.image === 'string'
        ? new URL(seo.image, getServerURL()).toString()
        : undefined

  const tenantSEO = (data.tenant as { seo?: { noIndex?: boolean | null } | null }).seo
  const noIndex = isPreview || Boolean(tenantSEO?.noIndex)

  return {
    metadataBase: new URL(getServerURL()),
    title: seo.title || data.title || 'OPLAY.ID',
    description: seo.description || undefined,
    keywords: seo.keywords || undefined,
    icons: { icon: data.favicon },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    alternates: {
      canonical: data.canonicalURL,
      languages: data.alternateURLs,
    },
    openGraph: {
      title: seo.title || data.title || 'OPLAY.ID',
      description: seo.description || undefined,
      type: 'website',
      url: data.canonicalURL,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title || data.title || 'OPLAY.ID',
      description: seo.description || undefined,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

export default async function UniversalPage({ params }: Props) {
  const { segments = [] } = await params
  const { host, isPreview, user } = await getRequestState()
  const data = await getPageForRequest(host, segments, isPreview)

  if (!canViewData(data, user) || !data) notFound()

  return (
    <SiteProvider value={{ basePath: data.basePath, locale: data.locale }}>
      {data.isPreview ? <LivePreviewListener /> : null}
      <CanvasRenderer layoutData={data} />
    </SiteProvider>
  )
}
