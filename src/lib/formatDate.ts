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

/** Locale Intl yang dipakai seluruh helper tanggal. */
function intlLocale(locale: Locale): string {
  return locale === 'en' ? 'en-GB' : 'id-ID'
}

export function parseDateValue(value: string | null | undefined): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/** True untuk nilai tanggal tanpa jam (Payload menyimpannya sebagai 00:00Z). */
export function isDateOnlyValue(value: string | null | undefined): boolean {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}(T00:00:00(\.000)?Z)?$/.test(String(value)))
}

/**
 * Tanggal panjang pada zona waktu acara: "Sabtu, 12 Desember 2026".
 * Dipakai blok undangan agar tanggal tidak bergeser gara-gara zona server.
 */
export function formatEventDate(
  value: string | null | undefined,
  timezone: string | null | undefined,
  locale: Locale,
): string | null {
  const date = parseDateValue(value)
  if (!date) return null

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }

  // Tanggal tanpa jam tidak boleh digeser oleh timezone.
  if (!isDateOnlyValue(value)) {
    options.timeZone = timezone || 'Asia/Jakarta'
  } else {
    options.timeZone = 'UTC'
  }

  return new Intl.DateTimeFormat(intlLocale(locale), options).format(date)
}

/** Rentang tanggal: satu hari cukup satu tanggal, beda hari dipisah "–". */
export function formatEventDateRange(
  start: string | null | undefined,
  end: string | null | undefined,
  timezone: string | null | undefined,
  locale: Locale,
): string | null {
  const startLabel = formatEventDate(start, timezone, locale)
  if (!startLabel) return null

  const endLabel = formatEventDate(end, timezone, locale)
  if (!endLabel || endLabel === startLabel) return startLabel

  return `${startLabel} – ${endLabel}`
}

/** Jam pada zona waktu acara: "10.00". */
export function formatEventTime(
  value: string | null | undefined,
  timezone: string | null | undefined,
  locale: Locale,
): string | null {
  const date = parseDateValue(value)
  if (!date) return null
  if (isDateOnlyValue(value)) return null

  const label = new Intl.DateTimeFormat(intlLocale(locale), {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: timezone || 'Asia/Jakarta',
  }).format(date)

  return label.replace(/\./g, ':').replace(/^24:/, '00:')
}

/** Singkatan zona waktu (WIB/WITA/WIT/GMT+7) untuk ditampilkan di sebelah jam. */
export function formatTimezoneLabel(
  value: string | null | undefined,
  timezone: string | null | undefined,
  locale: Locale,
): string | null {
  const zone = timezone || 'Asia/Jakarta'
  const date = parseDateValue(value) || new Date()

  try {
    const parts = new Intl.DateTimeFormat(intlLocale(locale), {
      timeZone: zone,
      timeZoneName: 'short',
    }).formatToParts(date)
    return parts.find((part) => part.type === 'timeZoneName')?.value || null
  } catch {
    return null
  }
}

/** "10.00 – 14.00 WIB"; salah satu sisi kosong tetap ditampilkan. */
export function formatEventTimeRange(
  start: string | null | undefined,
  end: string | null | undefined,
  timezone: string | null | undefined,
  locale: Locale,
): string | null {
  const startLabel = formatEventTime(start, timezone, locale)
  const endLabel = formatEventTime(end, timezone, locale)
  if (!startLabel) return null

  const zone = formatTimezoneLabel(start, timezone, locale)
  const range = endLabel ? `${startLabel} – ${endLabel}` : startLabel
  return zone ? `${range} ${zone}` : range
}

/** Tanggal ringkas untuk deadline RSVP: "12 Desember 2026". */
export function formatDeadlineDate(
  value: string | null | undefined,
  locale: Locale,
): string | null {
  const date = parseDateValue(value)
  if (!date) return null

  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}
