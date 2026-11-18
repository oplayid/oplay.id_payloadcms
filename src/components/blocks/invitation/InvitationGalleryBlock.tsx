'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import type { InvitationBlockContext } from '@/lib/invitationContext'
import { InvitationBlockProps, InvitationOnlyNotice, InvitationSection, SectionHeading } from './shared'

export type InvitationGalleryData = {
  variant?: string | null
  sectionBadge?: string | null
  sectionTitle?: string | null
  sectionSubtitle?: string | null
  /** Foto tambahan khusus blok ini (selain galeri acara). */
  images?: Array<{ image?: unknown; caption?: string | null; id?: string | null }> | null
  captionStyle?: 'overlay' | 'below' | 'hidden' | null
  note?: string | null
}

type GalleryItem = {
  key: string
  url: string
  caption: string
}

function imageURL(value: unknown): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    const media = value as {
      url?: string | null
      sizes?: Record<string, { url?: string | null } | undefined> | null
    }
    return media.sizes?.large?.url || media.sizes?.card?.url || media.url || ''
  }
  return ''
}

export default function InvitationGalleryBlock({
  data,
  invitationContext,
}: InvitationBlockProps<InvitationGalleryData>) {
  if (!invitationContext) return <InvitationOnlyNotice />
  return <Gallery data={data} context={invitationContext} />
}

function Gallery({
  data,
  context,
}: {
  data: InvitationGalleryData
  context: InvitationBlockContext
}) {
  const { event } = context
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const items = useMemo<GalleryItem[]>(() => {
    const blockImages = Array.isArray(data.images) ? data.images : []
    const eventGallery = Array.isArray(event.gallery) ? event.gallery : []

    const merged = [
      ...blockImages.map((item, index) => ({
        key: `block-${item.id || index}`,
        url: imageURL(item.image),
        caption: String(item.caption || '').trim(),
      })),
      ...eventGallery.map((item, index) => ({
        key: `event-${index}`,
        url: imageURL(item.image),
        caption: String(item.caption || '').trim(),
      })),
    ]

    return merged.filter((item) => item.url)
  }, [data.images, event.gallery])

  const close = useCallback(() => setActiveIndex(null), [])

  useEffect(() => {
    if (activeIndex === null) return

    const onKeyDown = (browserEvent: KeyboardEvent) => {
      if (browserEvent.key === 'Escape') close()
      if (browserEvent.key === 'ArrowRight') {
        setActiveIndex((current) => (current === null ? null : (current + 1) % items.length))
      }
      if (browserEvent.key === 'ArrowLeft') {
        setActiveIndex((current) =>
          current === null ? null : (current - 1 + items.length) % items.length,
        )
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeIndex, close, items.length])

  if (items.length === 0) return null

  const variant = data.variant || 'gallery-grid'
  const captionStyle = data.captionStyle || 'overlay'

  const gridClass =
    variant === 'gallery-masonry'
      ? 'columns-2 gap-3 md:columns-3 [&>*]:mb-3'
      : variant === 'gallery-carousel'
        ? 'flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3'
        : 'grid grid-cols-2 gap-3 md:grid-cols-3'

  const itemClass =
    variant === 'gallery-carousel'
      ? 'w-[72%] shrink-0 snap-center sm:w-[46%] md:w-[32%]'
      : 'break-inside-avoid'

  const active = activeIndex === null ? null : items[activeIndex]

  return (
    <InvitationSection>
      <SectionHeading
        badge={data.sectionBadge}
        title={data.sectionTitle || 'Galeri'}
        subtitle={data.sectionSubtitle}
      />

      <div className={gridClass}>
        {items.map((item, index) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`group relative block w-full overflow-hidden border border-(--theme-border) bg-(--theme-surface) ${itemClass}`}
            style={{ borderRadius: 'var(--theme-radius-box)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.url}
              alt={item.caption || `Foto ${index + 1}`}
              loading="lazy"
              className={`w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] ${
                variant === 'gallery-masonry' ? 'h-auto' : 'aspect-[4/5]'
              }`}
            />
            {captionStyle === 'overlay' && item.caption ? (
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-8 text-left text-xs font-medium text-white">
                {item.caption}
              </span>
            ) : null}
            {captionStyle === 'below' && item.caption ? (
              <span className="block px-3 py-2 text-left text-xs text-(--theme-muted)">
                {item.caption}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {data.note ? (
        <p className="mt-5 text-center text-xs leading-relaxed text-(--theme-muted)">{data.note}</p>
      ) : null}

      {active ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.caption || 'Foto galeri'}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={close}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={active.url}
            alt={active.caption || 'Foto galeri'}
            className="max-h-[82vh] max-w-full object-contain"
            onClick={(clickEvent) => clickEvent.stopPropagation()}
          />
          {active.caption ? (
            <p className="mt-4 max-w-xl text-center text-sm text-white/85">{active.caption}</p>
          ) : null}

          <div className="mt-5 flex items-center gap-3" onClick={(event_) => event_.stopPropagation()}>
            <button
              type="button"
              onClick={() =>
                setActiveIndex((current) =>
                  current === null ? null : (current - 1 + items.length) % items.length,
                )
              }
              className="border border-white/30 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10"
              style={{ borderRadius: 'var(--theme-radius-btn)' }}
            >
              Sebelumnya
            </button>
            <button
              type="button"
              onClick={() => close()}
              className="border border-white/30 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10"
              style={{ borderRadius: 'var(--theme-radius-btn)' }}
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={() =>
                setActiveIndex((current) =>
                  current === null ? null : (current + 1) % items.length,
                )
              }
              className="border border-white/30 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10"
              style={{ borderRadius: 'var(--theme-radius-btn)' }}
            >
              Berikutnya
            </button>
          </div>
        </div>
      ) : null}
    </InvitationSection>
  )
}
