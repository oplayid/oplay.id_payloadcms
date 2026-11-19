import React from 'react'
import type { CSSProperties } from 'react'
import Container from '@/components/ui/Container'
import { buildMapEmbedURL, isAllowedMapEmbedURL, type MapEmbedProvider } from '@/lib/mapEmbed'

export type LocationMapData = {
  variant?: string | null
  sectionBadge?: string | null
  sectionTitle?: string | null
  sectionSubtitle?: string | null
  locationName?: string | null
  address?: string | null
  latitude?: number | null
  longitude?: number | null
  showCoordinates?: boolean | null
  showGrid?: boolean | null
  height?: string | null
  embedMode?: string | null
  embedProvider?: MapEmbedProvider | null
  zoom?: number | null
  customEmbedUrl?: string | null
  mapsUrl?: string | null
  buttonLabel?: string | null
  note?: string | null
}

type Props = {
  data: LocationMapData
  themeLayout?: string
}

type InfoCardProps = {
  locationText: string
  address?: string | null
  coordinateText: string
  showCoordinates: boolean
  mapsURL: string | null
  buttonLabel?: string | null
}

/** Hanya izinkan tautan http(s) agar tidak ada skema `javascript:`. */
function safeMapURL(value: string | null | undefined): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null
  } catch {
    return null
  }
}

/**
 * Posisi marker dekoratif untuk mode tanpa iframe. Diturunkan dari angka
 * kordinat, bukan proyeksi peta — dipakai bila embedMode = 'none'.
 */
function markerPosition(value: number | null | undefined, axis: 'lat' | 'lng'): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 50
  const fraction = Math.abs(value % 1)
  return axis === 'lat' ? Math.round(80 - fraction * 60) : Math.round(20 + fraction * 60)
}

function formatCoordinate(value: number, positive: string, negative: string): string {
  return `${Math.abs(value).toFixed(5)}° ${value >= 0 ? positive : negative}`
}

function LocationInfoCard({
  locationText,
  address,
  coordinateText,
  showCoordinates,
  mapsURL,
  buttonLabel,
}: InfoCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-(--theme-radius-box) border border-(--theme-border) bg-(--theme-surface) p-4 shadow-(--theme-shadow)">
      {locationText ? (
        <p className="font-heading text-base font-semibold text-(--theme-text) md:text-lg">
          {locationText}
        </p>
      ) : null}
      {address ? <p className="text-sm text-(--theme-muted)">{address}</p> : null}
      {showCoordinates ? (
        <p className="font-mono text-xs text-(--theme-muted)">{coordinateText}</p>
      ) : null}
      {mapsURL ? (
        <a
          href={mapsURL}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto mt-1 w-fit text-sm font-semibold text-(--theme-primary) underline underline-offset-4"
        >
          {buttonLabel || 'Buka di Maps'}
        </a>
      ) : null}
    </div>
  )
}

export default function LocationMapBlock({ data, themeLayout }: Props) {
  const variant = data.variant || 'map-card'
  const heightClass = ['h-64', 'h-80', 'h-96'].includes(data.height || '')
    ? data.height!
    : 'h-80'
  const mapsURL = safeMapURL(data.mapsUrl)
  const hasCoordinates =
    typeof data.latitude === 'number' &&
    Number.isFinite(data.latitude) &&
    typeof data.longitude === 'number' &&
    Number.isFinite(data.longitude)
  const showCoordinates = data.showCoordinates !== false && hasCoordinates
  const showGrid = data.showGrid !== false && variant !== 'map-minimal'
  const top = markerPosition(data.latitude, 'lat')
  const left = markerPosition(data.longitude, 'lng')

  const coordinateText = hasCoordinates
    ? `${formatCoordinate(data.latitude!, 'LU', 'LS')}, ${formatCoordinate(data.longitude!, 'BT', 'BB')}`
    : ''

  const locationText = data.locationName?.trim() || ''

  // iframe optional: default 'none' mempertahankan tampilan tanpa request
  // eksternal. Mode 'auto' membuat URL embed tanpa API key.
  const embedUrl =
    data.embedMode === 'custom'
      ? isAllowedMapEmbedURL(data.customEmbedUrl)
      : data.embedMode === 'auto'
        ? isAllowedMapEmbedURL(
            buildMapEmbedURL({
              provider: data.embedProvider,
              locationName: locationText,
              address: data.address,
              latitude: data.latitude,
              longitude: data.longitude,
              zoom: data.zoom,
            }),
          )
        : null

  const infoCardProps: InfoCardProps = {
    locationText,
    address: data.address,
    coordinateText,
    showCoordinates,
    mapsURL,
    buttonLabel: data.buttonLabel,
  }

  return (
    <section className="w-full py-16 md:py-20">
      <Container containerClass={themeLayout}>
        <div className="flex flex-col gap-8">
          {(data.sectionBadge || data.sectionTitle || data.sectionSubtitle) && (
            <div className="flex flex-col items-center gap-2 text-center">
              {data.sectionBadge ? (
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-(--theme-primary)">
                  {data.sectionBadge}
                </span>
              ) : null}
              {data.sectionTitle ? (
                <h2 className="font-heading text-2xl font-semibold text-(--theme-text) md:text-3xl">
                  {data.sectionTitle}
                </h2>
              ) : null}
              {data.sectionSubtitle ? (
                <p className="max-w-2xl text-sm text-(--theme-muted) md:text-base">
                  {data.sectionSubtitle}
                </p>
              ) : null}
            </div>
          )}

          {!infoCardProps.locationText && !coordinateText && !data.address && !embedUrl ? (
            <div className="rounded-(--theme-radius-box) border border-dashed border-(--theme-border) bg-(--theme-surface) p-6 text-center text-sm text-(--theme-muted)">
              Detail lokasi belum diisi.
            </div>
          ) : embedUrl ? (
            <div className="flex flex-col gap-3">
              <div
                className={`relative w-full overflow-hidden rounded-(--theme-radius-box) border border-(--theme-border) bg-(--theme-surface) ${heightClass}`}
              >
                <iframe
                  src={embedUrl}
                  title={locationText ? `Peta ${locationText}` : 'Peta lokasi'}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  className="absolute inset-0 size-full border-0"
                />
                {showCoordinates ? (
                  <div className="pointer-events-none absolute right-3 top-3 z-10 rounded-(--theme-radius-box) border border-(--theme-border) bg-(--theme-surface)/90 px-3 py-1.5 font-mono text-[10px] text-(--theme-muted) md:text-xs">
                    {coordinateText}
                  </div>
                ) : null}
              </div>
              <LocationInfoCard {...infoCardProps} />
            </div>
          ) : variant === 'map-minimal' ? (
            <LocationInfoCard {...infoCardProps} />
          ) : (
            <div
              className={`relative w-full overflow-hidden rounded-(--theme-radius-box) border border-(--theme-border) bg-(--theme-surface) ${heightClass}`}
            >
              {/* Garis grid kordinat: murni CSS, tidak ada request jaringan. */}
              {showGrid ? (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={
                    {
                      backgroundImage:
                        'linear-gradient(to right, var(--theme-border) 1px, transparent 1px), linear-gradient(to bottom, var(--theme-border) 1px, transparent 1px)',
                      backgroundSize: '48px 48px',
                      opacity: 0.35,
                    } as CSSProperties
                  }
                />
              ) : null}

              {variant === 'map-coordinate' ? (
                <>
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-0 top-0 w-px bg-(--theme-primary)/50"
                    style={{ left: `${left}%` }}
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-0 right-0 h-px bg-(--theme-primary)/50"
                    style={{ top: `${top}%` }}
                  />
                </>
              ) : null}

              {/* Marker lokasi */}
              <div
                className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${left}%`, top: `${top}%` }}
              >
                <span className="relative flex size-4 items-center justify-center">
                  <span className="absolute size-8 animate-ping rounded-full bg-(--theme-primary)/25" />
                  <span className="relative size-4 rounded-full border-2 border-(--theme-surface) bg-(--theme-primary) shadow-(--theme-shadow)" />
                </span>
              </div>

              {showCoordinates ? (
                <div className="pointer-events-none absolute right-3 top-3 z-10 rounded-(--theme-radius-box) border border-(--theme-border) bg-(--theme-surface)/90 px-3 py-1.5 font-mono text-[10px] text-(--theme-muted) md:text-xs">
                  {coordinateText}
                </div>
              ) : null}

              <div className="absolute bottom-3 left-3 right-3 z-10 md:right-auto md:max-w-md">
                <LocationInfoCard {...infoCardProps} />
              </div>
            </div>
          )}

          {data.note ? (
            <p className="text-sm text-(--theme-muted)">{data.note}</p>
          ) : null}
        </div>
      </Container>
    </section>
  )
}
