import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { CACHE_TAGS, invalidateContent } from '@/lib/contentCache'
import { isRsvpOpen } from '@/lib/invitationContext'
import { normalizeInvitationKey } from '@/lib/invitationLink'
import { loadInvitation, toEventInfo } from '@/lib/invitations'
import { clientIPFromHeaders, consumeRateLimit } from '@/lib/rateLimit'

export const runtime = 'nodejs'

type RsvpBody = {
  key?: unknown
  status?: unknown
  pax?: unknown
  message?: unknown
  /** Path halaman saat form dikirim; dipakai untuk resolve tenant subpath. */
  path?: unknown
  /** Honeypot: hanya diisi bot. */
  website?: unknown
}

function pathSegments(value: unknown): string[] {
  if (typeof value !== 'string' || !value) return []
  return value.split('?')[0].split('#')[0].split('/').filter(Boolean)
}

function fail(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status })
}

/**
 * Konfirmasi kehadiran tamu.
 *
 * Server memvalidasi ulang semuanya (kunci URL, status acara, deadline, batas
 * kursi) karena request bisa dikirim langsung tanpa melewati form.
 */
export async function POST(request: Request) {
  let body: RsvpBody
  try {
    body = (await request.json()) as RsvpBody
  } catch {
    return fail('Format permintaan tidak valid.')
  }

  // Honeypot: balas sukses palsu agar bot tidak mencoba lagi.
  if (typeof body.website === 'string' && body.website.trim()) {
    return NextResponse.json({ ok: true, status: 'attending' })
  }

  const key = normalizeInvitationKey(typeof body.key === 'string' ? body.key : '')
  if (!key) return fail('Undangan tidak ditemukan.', 404)

  const host = request.headers.get('host') || ''
  const ip = clientIPFromHeaders(request.headers)

  if (!consumeRateLimit(`rsvp:${ip}:${key}`, 10, 10 * 60 * 1000)) {
    return fail('Terlalu banyak percobaan. Coba lagi beberapa menit lagi.', 429)
  }

  const status = body.status
  if (status !== 'attending' && status !== 'not_attending') {
    return fail('Pilih status kehadiran terlebih dahulu.')
  }

  const invitation = await loadInvitation({
    host,
    segments: pathSegments(body.path),
    key,
  })
  if (!invitation) return fail('Undangan tidak ditemukan.', 404)

  const { guestDoc, eventDoc } = invitation
  const event = toEventInfo(eventDoc)

  if (event.allowRsvp === false) {
    return fail('Konfirmasi kehadiran tidak dibuka untuk acara ini.', 403)
  }

  if (!isRsvpOpen({ event })) {
    return fail('Konfirmasi kehadiran sudah ditutup.', 400)
  }

  const maxPax = Math.max(1, Number(guestDoc.pax || 1))
  const requestedPax = Math.round(Number(body.pax ?? maxPax))
  const finalPax =
    status === 'attending'
      ? Math.min(Math.max(1, Number.isFinite(requestedPax) ? requestedPax : maxPax), maxPax)
      : 0

  const rawMessage = typeof body.message === 'string' ? body.message.trim() : ''
  const message = rawMessage.slice(0, 700)

  try {
    const payload = await getPayload({ config })
    await payload.update({
      collection: 'guests',
      id: guestDoc.id,
      data: {
        rsvpStatus: status,
        rsvpPax: finalPax,
        rsvpMessage: message || null,
        rsvpAt: new Date().toISOString(),
      },
      depth: 0,
      overrideAccess: true,
    })
  } catch (error) {
    console.error(
      `Gagal menyimpan RSVP tamu ${guestDoc.id}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    )
    return fail('Konfirmasi gagal disimpan. Silakan coba lagi.', 500)
  }

  await invalidateContent([CACHE_TAGS.invitations])

  return NextResponse.json({ ok: true, status, pax: finalPax })
}
