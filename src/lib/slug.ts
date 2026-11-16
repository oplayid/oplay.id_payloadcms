/**
 * Utilitas slug yang tidak bergantung pada konfigurasi Payload.
 *
 * Sengaja dipisah dari `lib/site` agar bisa diimpor dari definisi koleksi
 * (mis. `Posts`) tanpa memicu impor melingkar ke `@payload-config`.
 */
export function slugifyValue(value: string | undefined | null, maxLength = 64): string {
  if (!value) return ''

  return String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength)
    .replace(/-+$/g, '')
}

/** Slug satu segmen URL: huruf kecil, angka, dan tanda hubung. */
export const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/

export function isValidSlug(value: string | undefined | null): value is string {
  return Boolean(value && SLUG_REGEX.test(value))
}
