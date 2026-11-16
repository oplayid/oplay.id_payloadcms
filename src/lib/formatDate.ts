import type { Locale } from './urls'

/** Format tanggal panjang sesuai locale situs (id-ID / en-GB). */
export function formatLongDate(
  value: string | null | undefined,
  locale: Locale,
): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}
