import { draftMode } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { userHasTenantAccess } from '@/access'
import { getServerURL, isLocale } from '@/lib/urls'
import type { User } from '@/payload-types'

function safeRedirectPath(value: string | null): string | null {
  if (!value) return null
  if (!value.startsWith('/') || value.startsWith('//')) return null
  if (value.includes('\\')) return null
  return value
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

  const target = new URL(path, url.origin)
  if (locale && target.pathname === '/') {
    target.searchParams.set('locale', locale)
  }

  return NextResponse.redirect(target)
}
