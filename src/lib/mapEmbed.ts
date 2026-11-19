/**
 * Helper URL untuk iframe peta. TIDAK memanggil API dan tidak butuh API key:
 * URL ini hanya dijadikan `src` iframe yang dirender browser pengunjung.
 */

export type MapEmbedProvider = 'google' | 'osm'

const DEFAULT_EMBED_HOSTS = ['www.google.com', 'google.com', 'www.openstreetmap.org', 'openstreetmap.org']

function normalizeHostname(value: string): string {
  return value.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, '')
}

/**
 * Batasi src iframe hanya ke host embedder peta yang dikenal. Mencegah admin
 * (atau konten template) menyuntik iframe arbitrer ke halaman publik.
 */
export function isAllowedMapEmbedURL(value: string | null | undefined): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:') return null

    const host = normalizeHostname(url.hostname)
    const configured = (process.env.ALLOWED_MAP_EMBED_HOSTS || '')
      .split(',')
      .map(normalizeHostname)
      .filter(Boolean)

    return [...DEFAULT_EMBED_HOSTS, ...configured].includes(host) ? url.toString() : null
  } catch {
    return null
  }
}

type AutoEmbedInput = {
  provider: MapEmbedProvider | null | undefined
  locationName?: string | null
  address?: string | null
  latitude?: number | null
  longitude?: number | null
  zoom?: number | null
}

/** Bangun URL embed dari data blok; return null bila data tidak mencukupi. */
export function buildMapEmbedURL(input: AutoEmbedInput): string | null {
  const zoom = Math.min(20, Math.max(1, Number(input.zoom) || 15))
  const hasCoords =
    typeof input.latitude === 'number' &&
    Number.isFinite(input.latitude) &&
    typeof input.longitude === 'number' &&
    Number.isFinite(input.longitude)

  if (input.provider === 'osm') {
    if (!hasCoords) return null
    const lat = input.latitude!
    const lng = input.longitude!
    const latDelta = 180 / 2 ** zoom
    const lngDelta = 360 / 2 ** zoom
    const bbox = [lng - lngDelta, lat - latDelta, lng + lngDelta, lat + latDelta]
      .map((value) => value.toFixed(6))
      .join(',')
    return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat},${lng}`
  }

  // Google Maps embed tanpa API key / tanpa Cloud Console.
  const query = hasCoords
    ? `${input.latitude},${input.longitude}`
    : [input.locationName, input.address].map((part) => part?.trim()).filter(Boolean).join(', ')
  if (!query) return null

  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=${zoom}&output=embed`
}
