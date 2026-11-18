'use client'

import React, { useEffect, useState } from 'react'
import type { InvitationBlockContext } from '@/lib/invitationContext'
import { formatEventDateRange, formatEventTimeRange } from '@/lib/formatDate'
import { invitationDisplay, InvitationBlockProps, InvitationOnlyNotice } from './shared'
import { useInvitationStage } from './InvitationStage'

export type EventHeroData = {
  variant?: string | null
  eyebrow?: string | null
  titleOverride?: string | null
  backgroundImage?: unknown
  overlayOpacity?: number | null
  showDate?: boolean | null
  showTime?: boolean | null
  showVenue?: boolean | null
  showOpeningMessage?: boolean | null
  openingMessageOverride?: string | null
  scrollHint?: string | null
  note?: string | null
}

function imageURL(value: unknown): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    const media = value as {
      url?: string | null
      sizes?: Record<string, { url?: string | null } | undefined> | null
    }
    return media.sizes?.hero?.url || media.sizes?.large?.url || media.url || ''
  }
  return ''
}

function BackIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </svg>
  )
}

/** Tombol kembali ke cover: satu-satunya jalan pintas selain tombol back browser. */
function BackToCover({ light = false }: { light?: boolean }) {
  const stage = useInvitationStage()
  if (!stage || stage.stage !== 'detail') return null

  return (
    <button
      type="button"
      onClick={stage.close}
      className={`inline-flex items-center gap-2 border px-3 py-2 text-[11px] font-medium uppercase tracking-[0.2em] backdrop-blur-sm transition hover:opacity-80 ${
        light
          ? 'border-white/30 bg-black/25 text-white'
          : 'border-(--theme-border) bg-(--theme-surface)/70 text-(--theme-muted)'
      }`}
      style={{ borderRadius: 'var(--theme-radius-btn)' }}
    >
      <BackIcon className="h-3.5 w-3.5" />
      Cover
    </button>
  )
}

export default function EventHeroBlock({
  data,
  invitationContext,
}: InvitationBlockProps<EventHeroData>) {
  if (!invitationContext) return <InvitationOnlyNotice />
  return <EventHero data={data} context={invitationContext} />
}

function EventHero({ data, context }: { data: EventHeroData; context: InvitationBlockContext }) {
  const { event, locale } = context
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setEntered(true)
      return
    }
    const timer = window.setTimeout(() => setEntered(true), 60)
    return () => window.clearTimeout(timer)
  }, [])

  const image = imageURL(data.backgroundImage) || imageURL(event.cover)
  const variant = data.variant || 'hero-arch'
  const usePhoto = variant === 'hero-photo' && Boolean(image)
  const title = data.titleOverride?.trim() || event.title
  const dateLabel = formatEventDateRange(event.dateStart, event.dateEnd, event.timezone, locale)
  const timeLabel = formatEventTimeRange(event.dateStart, event.dateEnd, event.timezone, locale)
  const openingMessage =
    data.openingMessageOverride?.trim() || event.openingMessage || ''
  const overlay = Math.min(95, Math.max(0, Number(data.overlayOpacity ?? 58))) / 100

  const enter = (delay: number): React.CSSProperties => ({
    opacity: entered ? 1 : 0,
    transform: entered ? 'translateY(0)' : 'translateY(18px)',
    transition: `opacity 900ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 900ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  })

  const venueLine = [event.venueName, event.address].filter(Boolean).join(' · ')

  if (usePhoto) {
    return (
      <section
        id="acara"
        className="relative flex min-h-[92svh] w-full flex-col justify-end overflow-hidden"
        style={{
          backgroundImage: `url(${image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, rgba(0,0,0,${Math.min(
              0.7,
              overlay,
            )}) 0%, rgba(0,0,0,${overlay * 0.55}) 42%, rgba(0,0,0,${Math.min(
              0.95,
              overlay + 0.3,
            )}) 100%)`,
          }}
          aria-hidden="true"
        />

        <div className="absolute left-5 top-5 z-20 md:left-8 md:top-8">
          <BackToCover light />
        </div>

        <div className="relative z-10 w-full px-6 pb-16 pt-40 text-center md:px-12 md:pb-24">
          <div style={enter(80)} className="mx-auto w-full max-w-3xl">
            {data.eyebrow ? (
              <p className="text-[10px] uppercase tracking-[0.5em] text-white/75">{data.eyebrow}</p>
            ) : null}
            <h1 className="mt-5 font-semibold tracking-tight text-white" style={invitationDisplay('hero')}>
              {title}
            </h1>

            {data.showDate !== false && dateLabel ? (
              <p className="mt-5 text-sm tracking-wide text-white/85 md:text-base">{dateLabel}</p>
            ) : null}

            {data.showOpeningMessage !== false && openingMessage ? (
              <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-white/80">
                {openingMessage}
              </p>
            ) : null}

            <div className="mt-10 inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-white/60">
              <span className="h-px w-8 bg-white/40" />
              {data.scrollHint || 'Detail acara'}
              <span className="h-px w-8 bg-white/40" />
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="acara" className="relative w-full overflow-hidden bg-(--theme-bg) pt-20 pb-14 md:pt-24 md:pb-20">
      {/* Cahaya lembut dari warna primary: kedalaman tanpa gambar. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[70%]"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(90% 80% at 50% 0%, color-mix(in srgb, var(--theme-primary) 16%, transparent), transparent 70%)',
        }}
      />

      <div className="absolute left-5 top-5 z-20 md:left-8 md:top-8">
        <BackToCover />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-4xl px-6 text-center md:px-10">
        <div style={enter(60)}>
          {data.eyebrow ? (
            <p className="text-[10px] font-medium uppercase tracking-[0.5em] text-(--theme-muted)">
              {data.eyebrow}
            </p>
          ) : null}

          <h1
            className="mx-auto mt-6 max-w-3xl font-semibold tracking-tight text-(--theme-text)"
            style={invitationDisplay('hero')}
          >
            {title}
          </h1>
        </div>

        <div style={enter(160)} className="mx-auto mt-8 flex max-w-xl items-center justify-center gap-4">
          <span className="h-px flex-1 bg-(--theme-border)" />
          <span className="h-1.5 w-1.5 rotate-45 bg-(--theme-primary)" aria-hidden="true" />
          <span className="h-px flex-1 bg-(--theme-border)" />
        </div>

        {variant === 'hero-arch' && image ? (
          <div style={enter(220)} className="relative mx-auto mt-10 w-full max-w-md">
            <div
              className="relative overflow-hidden border border-(--theme-border) bg-(--theme-surface)"
              style={{
                borderRadius: '999px 999px var(--theme-radius-box) var(--theme-radius-box)',
                boxShadow: 'var(--theme-shadow, 0 32px 80px -48px rgba(0,0,0,0.6))',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={title}
                className="h-[26rem] w-full object-cover"
                loading="eager"
              />
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, transparent 55%, color-mix(in srgb, var(--theme-bg) 55%, transparent) 100%)',
                }}
              />
            </div>
          </div>
        ) : null}

        <div style={enter(300)} className="mt-10">
          {data.showDate !== false || data.showTime !== false ? (
            <p className="text-base font-medium text-(--theme-text) md:text-lg">
              {[dateLabel, data.showTime !== false ? timeLabel : ''].filter(Boolean).join(' · ')}
            </p>
          ) : null}

          {data.showVenue !== false && venueLine ? (
            <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-(--theme-muted)">
              {venueLine}
            </p>
          ) : null}

          {data.showOpeningMessage !== false && openingMessage ? (
            <p className="mx-auto mt-8 max-w-2xl text-sm leading-relaxed text-(--theme-text)/80 md:text-base">
              {openingMessage}
            </p>
          ) : null}

          <div className="mt-12 inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-(--theme-muted)">
            <span className="h-px w-8 bg-(--theme-border)" />
            {data.scrollHint || 'Detail acara'}
            <span className="h-px w-8 bg-(--theme-border)" />
          </div>
        </div>

        {data.note ? (
          <p className="mx-auto mt-8 max-w-md text-xs leading-relaxed text-(--theme-muted)">
            {data.note}
          </p>
        ) : null}
      </div>
    </section>
  )
}
