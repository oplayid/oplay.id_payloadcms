import { draftMode } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { userHasTenantAccess } from '@/access'
import { getPlatformHost, getServerURL, isLocale } from '@/lib/urls'
import type { User } from '@/payload-types'

function safeRedirectPath(value: string | null): string | null {
  if (!value) return null
  if (!value.startsWith('/') || value.startsWith('//')) return null
  if (value.includes('\\')) return null
  return value
}

/**
 * Origin kanonik untuk redirect preview.
 *
 * `url.origin` dari NextRequest mengikuti header X-Forwarded-Host/Proto, sehingga
 * di belakang reverse proxy bisa berisi alamat internal (mis. https://0.0.0.0:3000).
 * Memakainya sebagai base redirect membuat iframe preview gagal connect.
 */
function previewOrigin(fallback: string): string {
  const candidates = [getServerURL(), `https://${getPlatformHost()}`]

  for (const candidate of candidates) {
    try {
      return new URL(candidate).origin
    } catch {
      // Coba kandidat berikutnya.
    }
  }

  return fallback
}

/**
 * Pintu masuk Live Preview.
 *
 * - Wajib login (cookie Payload).
 * - Tenant harus di-assign ke user (kecuali superadmin).
 * - Mengaktifkan draftMode lalu redirect ke halaman publik.
 *
 * Draft tidak pernah bisa diakses lewat `?draft=true` di halaman publik.
 */
export async function GET(req: NextRequest): Promise<Response> {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  const url = req.nextUrl
  const path = safeRedirectPath(url.searchParams.get('path')) || '/'
  const tenantID = url.searchParams.get('tenant') || undefined
  const localeParam = url.searchParams.get('locale')
  const locale = isLocale(localeParam) ? localeParam : undefined

  if (!user) {
    const loginURL = new URL('/admin/login', getServerURL())
    loginURL.searchParams.set('redirect', `${url.pathname}${url.search}`)
    return NextResponse.redirect(loginURL)
  }

  if (!tenantID) {
    return new NextResponse('Parameter tenant wajib disertakan.', { status: 400 })
  }

  if (!userHasTenantAccess(user as User, tenantID)) {
    return new NextResponse('Anda tidak memiliki akses ke tenant ini.', { status: 403 })
  }

  const draft = await draftMode()
  draft.enable()

  // Redirect ke origin kanonik platform, bukan `url.origin` yang bisa tercemar
  // header proxy. Cookie draftMode di-set pada origin ini, jadi tetap same-origin.
  const target = new URL(path, previewOrigin(url.origin))

  // `buildPreviewURL` sudah menyertakan locale pada path publik. Sertakan juga
  // sebagai query agar handler penerima bisa membacanya bila diperlukan.
  if (locale) target.searchParams.set('locale', locale)

  return NextResponse.redirect(target)
}
