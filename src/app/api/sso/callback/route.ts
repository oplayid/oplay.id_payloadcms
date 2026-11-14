// src/app/api/sso/callback/route.ts
import { getPayload } from 'payload'
import config from '@payload-config'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const issuer = process.env.OIDC_URI || 'https://apps.oplay.id'

  if (!code) {
    return NextResponse.redirect(new URL('/admin/login?error=NoCode', baseUrl))
  }

  try {
    const tokenEndpoint = `${issuer}/api/oidc/token`
    const userInfoEndpoint = `${issuer}/api/oidc/userinfo`

    // 1. Tukar 'code' dengan Token
    const tokenRes = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.NEXT_PUBLIC_OIDC_CLIENT_ID || process.env.OIDC_CLIENT_ID || '',
        client_secret: process.env.OIDC_CLIENT_SECRET || '',
        redirect_uri: `${baseUrl}/api/sso/callback`,
        code,
      }),
    })

    const tokens = await tokenRes.json()
    if (!tokens.access_token) throw new Error('Gagal mendapatkan access token')

    // 2. Ambil profil user (email) dari UserInfo
    const userInfoRes = await fetch(userInfoEndpoint, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const userInfo = await userInfoRes.json()
    const email = userInfo.email

    if (!email) throw new Error('Email tidak ditemukan dari profil Pocket ID')

    // 3. Inisialisasi Payload Local API
    const payload = await getPayload({ config })

    // 4. Cari atau Buat User di Koleksi 'Users'
    const existingUsers = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
    })

    let user = existingUsers.docs[0]
    const dummyPassword = Math.random().toString(36).slice(-8) + 'Ab1!'

    if (!user) {
      user = await payload.create({
        collection: 'users',
        data: {
          email: email,
          password: dummyPassword,
          role: 'member',
        },
      })
    }

    // 5. 🔑 GENERATE SESSION COOKIE MENGGUNAKAN PAYLOAD LOGIN
    let loginResult

    try {
      loginResult = await payload.login({
        collection: 'users',
        data: {
          email: email,
          password: dummyPassword,
        },
      })
    } catch (loginErr) {
      // Jika password lama berbeda, update paksa ke dummyPassword agar bisa login via SSO
      await payload.update({
        collection: 'users',
        id: user.id,
        data: { password: dummyPassword },
      })

      loginResult = await payload.login({
        collection: 'users',
        data: {
          email: email,
          password: dummyPassword,
        },
      })
    }

    // 6. Redirect ke /admin dengan membawa Cookie Sesi dari Payload
    const response = NextResponse.redirect(new URL('/admin', baseUrl))

    if (loginResult && loginResult.token) {
      response.cookies.set({
        name: 'payload-token',
        value: loginResult.token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
      })
    }

    return response
  } catch (err: any) {
    console.error('Pocket ID Callback Exception:', err.message || err)
    return NextResponse.redirect(new URL('/admin/login?error=SSOFailed', baseUrl))
  }
}
