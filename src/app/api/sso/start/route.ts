import { createHash, randomBytes } from 'node:crypto'
import { NextResponse } from 'next/server'
import { getServerURL } from '@/lib/urls'

/**
 * Memulai alur SSO (OIDC/PocketID).
 *
 * `state` melindungi dari login-CSRF, `code_verifier` (PKCE S256) melindungi
 * authorization code yang bocor. Keduanya disimpan di cookie httpOnly selama
 * 10 menit dan diverifikasi oleh /api/sso/callback.
 */
export const dynamic = 'force-dynamic'

const SSO_COOKIE_MAX_AGE = 10 * 60

function getIssuer(): string {
  return (process.env.OIDC_URI || 'https://apps.oplay.id').replace(/\/+$/, '')
}

export async function GET() {
  const clientId = process.env.NEXT_PUBLIC_OIDC_CLIENT_ID || process.env.OIDC_CLIENT_ID || ''
  const clientSecret = process.env.OIDC_CLIENT_SECRET || ''
  const baseUrl = getServerURL()

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/admin/login?error=SSONotConfigured', baseUrl))
  }

  const state = randomBytes(32).toString('base64url')
  const codeVerifier = randomBytes(32).toString('base64url')
  const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url')

  const authorizeURL = new URL('/authorize', getIssuer())
  authorizeURL.search = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: `${baseUrl}/api/sso/callback`,
    scope: 'openid profile email',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  }).toString()

  const response = NextResponse.redirect(authorizeURL)
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SSO_COOKIE_MAX_AGE,
  }

  response.cookies.set('sso_state', state, cookieOptions)
  response.cookies.set('sso_verifier', codeVerifier, cookieOptions)
  return response
}
