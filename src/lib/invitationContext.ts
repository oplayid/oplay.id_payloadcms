import type { Locale } from './urls'

/**
 * Tipe konteks undangan yang diteruskan dari resolver server ke setiap blok.
 *
 * Modul ini sengaja bebas dari impor Payload agar bisa dipakai komponen
 * server maupun client (mis. form RSVP dan cover interaktif).
 */

export type InvitationRsvpStatus = 'pending' | 'attending' | 'not_attending'

export type InvitationRundownItem = {
  time?: string | null
  title?: string | null
  description?: string | null
}

export type InvitationGiftAccount = {
  label?: string | null
  bankName?: string | null
  accountNumber?: string | null
  accountName?: string | null
}

export type InvitationGalleryItem = {
  image?: unknown
  caption?: string | null
}

export type InvitationEventInfo = {
  id: string
  title: string
  dateStart?: string | null
  dateEnd?: string | null
  timezone?: string | null
  venueName?: string | null
  address?: string | null
  mapsURL?: string | null
  hostName?: string | null
  hostContact?: string | null
  dressCode?: string | null
  openingMessage?: string | null
  cover?: unknown
  allowRsvp?: boolean | null
  rsvpDeadline?: string | null
  rundown?: InvitationRundownItem[] | null
  gifts?: InvitationGiftAccount[] | null
  giftAddress?: string | null
  gallery?: InvitationGalleryItem[] | null
}

export type InvitationGuestInfo = {
  name: string
  salutation?: string | null
  category?: string | null
  pax: number
  personalNote?: string | null
  rsvpStatus: InvitationRsvpStatus
  rsvpPax?: number | null
  rsvpMessage?: string | null
}

export type InvitationBlockContext = {
  /** Kunci URL tamu (linkSlug) — dipakai endpoint RSVP. */
  key: string
  guest: InvitationGuestInfo
  event: InvitationEventInfo
  basePath: string
  locale: Locale
}

export const RSVP_STATUS_LABEL: Record<InvitationRsvpStatus, string> = {
  pending: 'Belum konfirmasi',
  attending: 'Hadir',
  not_attending: 'Tidak hadir',
}

export function isInvitationRsvpStatus(value: unknown): value is InvitationRsvpStatus {
  return value === 'pending' || value === 'attending' || value === 'not_attending'
}

/** Salam + nama tamu, tanpa menduplikasi sapaan yang sudah ada di nama. */
export function guestDisplayName(guest: {
  name?: string | null
  salutation?: string | null
}): string {
  const name = String(guest.name || '').trim()
  if (!name) return 'Tamu Undangan'

  const salutation = String(guest.salutation || '').trim()
  if (!salutation) return name

  const lowered = name.toLowerCase()
  if (lowered.startsWith(salutation.toLowerCase())) return name

  return `${salutation} ${name}`
}

/** Google Maps URL: pakai mapsURL manual bila ada, jika tidak cari dari alamat/lokasi. */
export function resolveMapsURL(event: InvitationEventInfo): string {
  const explicit = String(event.mapsURL || '').trim()
  if (explicit) return explicit

  const query = [event.venueName, event.address]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(', ')

  if (!query) return ''
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

/** Tanggal `YYYY-MM-DD` pada zona waktu tertentu. */
function dateKeyInTimezone(value: Date, timezone: string): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone || 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(value)
  } catch {
    return value.toISOString().slice(0, 10)
  }
}

/** True bila form RSVP masih boleh menerima jawaban. */
export function isRsvpOpen(
  context: Pick<InvitationBlockContext, 'event'>,
  now: Date = new Date(),
): boolean {
  if (context.event.allowRsvp === false) return false

  const deadline = context.event.rsvpDeadline
  if (!deadline) return true

  const parsed = new Date(deadline)
  if (Number.isNaN(parsed.getTime())) return true

  const timezone = context.event.timezone || 'Asia/Jakarta'

  // Deadline tanggal (tanpa jam) berlaku sampai akhir hari di zona acara.
  if (/^\d{4}-\d{2}-\d{2}(T00:00:00(\.000)?Z)?$/.test(String(deadline))) {
    return dateKeyInTimezone(now, timezone) <= parsed.toISOString().slice(0, 10)
  }

  return now.getTime() <= parsed.getTime()
}
