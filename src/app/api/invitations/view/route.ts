import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { CACHE_TAGS, invalidateContent } from '@/lib/contentCache'
import { normalizeInvitationKey } from '@/lib/invitationLink'
import { findInvitationGuest } from '@/lib/invitations'
import { clientIPFromHeaders, consumeRateLimit } from '@/lib/rateLimit'

export const runtime = 'nodejs'

/**
 * Statistik kunjungan undangan.
 *
 * Hanya menambah `viewCount` + `lastViewedAt`. Tidak pernah mengembalikan data
 * tamu, sehingga endpoint ini tidak bisa dipakai untuk membaca PII.
 */
export async function POST(request: Request) {
  let body: { key?: unknown; path?: unknown }
  try {
    body = (await request.json()) as { key?: unknown; path?: unknown }
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const key = normalizeInvitationKey(typeof body.key === 'string' ? body.key : '')
  if (!key) return NextResponse.json({ ok: false }, { status: 400 })

  const segments =
    typeof body.path === 'string' && body.path
      ? body.path.split('?')[0].split('#')[0].split('/').filter(Boolean)
      : []

  const host = request.headers.get('host') || ''
  const ip = clientIPFromHeaders(request.headers)

  if (!consumeRateLimit(`view:${ip}:${key}`, 30, 60 * 1000)) {
    return NextResponse.json({ ok: false }, { status: 429 })
  }

  const found = await findInvitationGuest({ host, segments, key })
  if (!found || found.guestDoc.disabled) {
    return NextResponse.json({ ok: false }, { status: 404 })
  }

  const currentViews = Number(found.guestDoc.viewCount || 0)

  try {
    const payload = await getPayload({ config })
    await payload.update({
      collection: 'guests',
      id: found.guestDoc.id,
      data: {
        viewCount: currentViews + 1,
        lastViewedAt: new Date().toISOString(),
      },
      depth: 0,
      overrideAccess: true,
    })
  } catch {
    // Statistik bersifat opsional; jangan ganggu pengalaman tamu.
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  await invalidateContent([CACHE_TAGS.invitations])

  return NextResponse.json({ ok: true })
}
