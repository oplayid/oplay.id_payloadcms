/**
 * Helper pembuat URL undangan tamu.
 *
 * Dipisah dari `lib/invitations` (yang mengimpor `@payload-config`) agar bisa
 * dipakai dari definisi koleksi dan komponen admin tanpa impor melingkar.
 *
 * Format link: `/undangan/<slug-nama>-<kode-acak>`
 * - Slug nama membuat link terasa personal saat dibagikan lewat WhatsApp.
 * - Kode acak membuat link tidak bisa ditebak dari nama tamu.
 */

export const INVITATION_PREFIX = 'undangan'
export const INVITATION_CODE_LENGTH = 6

/** Tanpa huruf/angka yang mudah tertukar (0/o, 1/l/i). */
const CODE_ALPHABET = '23456789abcdefghjkmnpqrstuvwxyz'

/**
 * Kode acak untuk URL + QR check-in.
 *
 * Memakai Web Crypto bila tersedia (Node 19+ dan browser), fallback ke
 * Math.random untuk lingkungan yang sangat lama. Bukan rahasia kriptografis,
 * hanya perlu cukup acak agar link tidak bisa dienumerasi.
 */
export function generateInvitationCode(length = INVITATION_CODE_LENGTH): string {
  const size = Math.max(4, Math.min(length, 24))
  const bytes = new Uint8Array(size)
  const cryptoApi = globalThis.crypto

  if (cryptoApi && typeof cryptoApi.getRandomValues === 'function') {
    cryptoApi.getRandomValues(bytes)
  } else {
    for (let index = 0; index < size; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256)
    }
  }

  let code = ''
  for (const byte of bytes) {
    code += CODE_ALPHABET[byte % CODE_ALPHABET.length]
  }
  return code
}

/** `budi-santoso` + `8f3k2a` -> `budi-santoso-8f3k2a`. */
export function buildInvitationLinkSlug(name: string | null | undefined, code: string): string {
  const base =
    String(name || '')
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40)
      .replace(/-+$/g, '') || 'tamu'

  const suffix = String(code || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 12)

  if (!suffix) return base

  return `${base}-${suffix}`.slice(0, 60).replace(/-+$/g, '')
}

/** Path canonical undangan (relatif terhadap base path site). */
export function invitationPath(linkSlug: string): string {
  return `/${INVITATION_PREFIX}/${linkSlug}`.replace(/\/{2,}/g, '/')
}

/** Normalisasi input URL (uppercase dari QR, spasi, trailing slash). */
export function normalizeInvitationKey(value: string | null | undefined): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
}

/** Ambil segmen terakhir path, dipakai endpoint RSVP untuk menerima path mentah. */
export function invitationKeyFromPath(path: string | null | undefined): string {
  const segments = String(path || '')
    .split('?')[0]
    .split('#')[0]
    .split('/')
    .filter(Boolean)

  return normalizeInvitationKey(segments[segments.length - 1])
}
