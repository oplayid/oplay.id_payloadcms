import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { CACHE_TAGS, invalidateContent } from '@/lib/contentCache'
import { normalizeInvitationKey } from '@/lib/invitationLink'
import { loadInvitation } from '@/lib/invitations'
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

  // Bucket per-IP menahan rotasi kunci; bucket per-undangan menahan spam
  // berulang pada satu tamu yang sama.
  if (
    !consumeRateLimit(`view:ip:${ip}`, 120, 60 * 1000) ||
    !consumeRateLimit(`view:${ip}:${key}`, 30, 60 * 1000)
  ) {
    return NextResponse.json({ ok: false }, { status: 429 })
  }

  // loadInvitation sudah menolak tamu disabled DAN event yang belum published.
  const invitation = await loadInvitation({ host, segments, key })
  if (!invitation) {
    return NextResponse.json({ ok: false }, { status: 404 })
  }

  const currentViews = Number(invitation.guestDoc.viewCount || 0)

  try {
    const payload = await getPayload({ config })
    await payload.update({
      collection: 'guests',
      id: invitation.guestDoc.id,
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
