// src/app/api/sso/callback/route.ts
import { randomBytes, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { NextResponse } from 'next/server'
import { getServerURL } from '@/lib/urls'

export const dynamic = 'force-dynamic'

function getIssuer(): string {
  return (process.env.OIDC_URI || 'https://apps.oplay.id').replace(/\/+$/, '')
}

function errorRedirect(code: string): NextResponse {
  const response = NextResponse.redirect(
    new URL(`/admin/login?error=${code}`, getServerURL()),
  )
  response.cookies.delete('sso_state')
  response.cookies.delete('sso_verifier')
  return response
}

/** Perbandingan state yang tahan timing attack. */
function statesMatch(a: string, b: string): boolean {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  if (!code || !state) return errorRedirect('NoCode')

  const cookieStore = await cookies()
  const savedState = cookieStore.get('sso_state')?.value
  const codeVerifier = cookieStore.get('sso_verifier')?.value

  // Validasi state: tanpa ini siapa pun bisa memaksa login dengan code miliknya.
  if (!savedState || !statesMatch(state, savedState)) return errorRedirect('InvalidState')
  if (!codeVerifier) return errorRedirect('MissingVerifier')

  const issuer = getIssuer()
  const baseUrl = getServerURL()
  const clientId = process.env.NEXT_PUBLIC_OIDC_CLIENT_ID || process.env.OIDC_CLIENT_ID || ''
  const clientSecret = process.env.OIDC_CLIENT_SECRET || ''

  try {
    // 1. Tukar authorization code memakai PKCE verifier.
    const tokenRes = await fetch(`${issuer}/api/oidc/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${baseUrl}/api/sso/callback`,
        code,
        code_verifier: codeVerifier,
      }),
    })

    if (!tokenRes.ok) return errorRedirect('TokenExchangeFailed')
    const tokens = await tokenRes.json()
    if (!tokens.access_token) return errorRedirect('TokenExchangeFailed')

    // 2. Ambil identitas dari UserInfo.
    const userInfoRes = await fetch(`${issuer}/api/oidc/userinfo`, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    if (!userInfoRes.ok) return errorRedirect('UserInfoFailed')

    const userInfo = await userInfoRes.json()
    const email =
      typeof userInfo.email === 'string' ? userInfo.email.trim().toLowerCase() : ''
    if (!email || !email.includes('@')) return errorRedirect('NoEmail')

    // 3. Cari / buat user. Kunci SSO adalah `ssoManaged`.
    const payload = await getPayload({ config })
    const found = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
      overrideAccess: true,
    })

    const existing = found.docs[0] as
      | { id: string; ssoManaged?: boolean | null }
      | undefined

    // Akun dengan password lokal TIDAK boleh diadopsi diam-diam: itu akan
    // memungkinkan siapa pun yang menguasai email IdP mengambil alih akun.
    if (
      existing &&
      !existing.ssoManaged &&
      process.env.SSO_ADOPT_EXISTING !== 'true'
    ) {
      return errorRedirect('SSOAccountExists')
    }

    // Password acak kriptografis diputar TIAP login SSO hanya untuk akun yang
    // memang dikelola SSO. Akun lokal tidak pernah disentuh.
    const ssoPassword = `${randomBytes(24).toString('base64url')}Ab1!`

    if (!existing) {
      // Akun SSO baru adalah member. Tanpa tenant, access control multi-tenant
      // membuatnya tidak bisa melihat apa pun. Beri akses ke tenant platform
      // agar alur login langsung usable; superadmin bisa menambah tenant lain.
      const defaultTenantSlug = process.env.PLATFORM_TENANT_SLUG || 'oplay'
      const tenantResult = await payload.find({
        collection: 'tenants',
        where: { slug: { equals: defaultTenantSlug } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      const defaultTenantID = tenantResult.docs[0]?.id

      await payload.create({
        collection: 'users',
        data: {
          email,
          password: ssoPassword,
          role: 'member',
          ssoManaged: true,
          ...(defaultTenantID
            ? { tenants: [{ tenant: defaultTenantID }] }
            : {}),
        },
        overrideAccess: true,
      })
    } else {
      await payload.update({
        collection: 'users',
        id: existing.id,
        data: { password: ssoPassword, ssoManaged: true },
        overrideAccess: true,
      })
    }

    // 4. Login untuk mendapatkan token sesi Payload.
    const loginResult = await payload.login({
      collection: 'users',
      data: { email, password: ssoPassword },
    })

    if (!loginResult.token) return errorRedirect('SSOFailed')

    const response = NextResponse.redirect(new URL('/admin', baseUrl))
    response.cookies.set({
      name: 'payload-token',
      value: loginResult.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    })
    response.cookies.delete('sso_state')
    response.cookies.delete('sso_verifier')
    return response
  } catch (err) {
    console.error('SSO callback gagal:', err instanceof Error ? err.message : err)
    return errorRedirect('SSOFailed')
  }
}
