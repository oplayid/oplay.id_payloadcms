'use client'

import React, { useEffect, useState } from 'react'
import type { InvitationBlockContext } from '@/lib/invitationContext'
import { guestDisplayName } from '@/lib/invitationContext'
import { formatEventDateRange } from '@/lib/formatDate'
import { formatPaxCount, invitationDisplay, InvitationBlockProps, InvitationOnlyNotice } from './shared'
import { useInvitationStage } from './InvitationStage'
import { countdownUnits, useCountdown } from './useCountdown'

export type InvitationCoverData = {
  variant?: string | null
  eyebrow?: string | null
  backgroundImage?: unknown
  overlayOpacity?: number | null
  showEventTitle?: boolean | null
  eventTitleOverride?: string | null
  showDate?: boolean | null
  showGuestName?: boolean | null
  guestLabel?: string | null
  showPax?: boolean | null
  showPersonalNote?: boolean | null
  personalNoteLabel?: string | null
  showCountdown?: boolean | null
  countdownLabel?: string | null
  openButtonLabel?: string | null
  note?: string | null
}

function toImageValue(value: unknown): {
  url?: string | null
  sizes?: Record<string, { url?: string | null } | undefined> | null
} | null {
  if (!value) return null
  if (typeof value === 'string') return { url: value }
  if (typeof value === 'object') {
    return value as {
      url?: string | null
      sizes?: Record<string, { url?: string | null } | undefined> | null
    }
  }
  return null
}

function imageURL(value: unknown): string {
  const media = toImageValue(value)
  if (!media) return ''
  return media.sizes?.hero?.url || media.sizes?.card?.url || media.url || ''
}

function initials(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

/** Bagian tanggal besar: "12" + "DES". */
function dateParts(dateStart: string | null | undefined, timezone: string | null | undefined) {
  if (!dateStart) return null
  const date = new Date(dateStart)
  if (Number.isNaN(date.getTime())) return null

  try {
    const day = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      timeZone: timezone || 'Asia/Jakarta',
    }).format(date)
    const month = new Intl.DateTimeFormat('id-ID', {
      month: 'short',
      timeZone: timezone || 'Asia/Jakarta',
    })
      .format(date)
      .replace('.', '')
      .toUpperCase()
    return { day, month }
  } catch {
    return null
  }
}

function ArrowIcon({ className = '' }: { className?: string }) {
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
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}

function HeartIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12 21s-7.5-4.7-9.5-9.1C1 8.3 3 5 6.4 5c2 0 3.4 1.1 4.3 2.4l1.3 1.8 1.3-1.8C14.2 6.1 15.6 5 17.6 5 21 5 23 8.3 21.5 11.9 19.5 16.3 12 21 12 21Z" />
    </svg>
  )
}

export default function InvitationCoverBlock({
  data,
  invitationContext,
}: InvitationBlockProps<InvitationCoverData>) {
  if (!invitationContext) return <InvitationOnlyNotice />
  return <Cover data={data} context={invitationContext} />
}

function Cover({ data, context }: { data: InvitationCoverData; context: InvitationBlockContext }) {
  const { guest, event, locale } = context
  const stage = useInvitationStage()
  const countdown = useCountdown(event.dateStart)
  const [entered, setEntered] = useState(false)

  // Animasi masuk halus setelah mount; hormati preferensi reduced motion.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setEntered(true)
      return
    }
    const timer = window.setTimeout(() => setEntered(true), 40)
    return () => window.clearTimeout(timer)
  }, [])

  const image = imageURL(data.backgroundImage) || imageURL(event.cover)
  const variant = data.variant || 'cover-photo'
  const usePhoto = variant === 'cover-photo' && Boolean(image)
  const overlay = Math.min(95, Math.max(0, Number(data.overlayOpacity ?? 55))) / 100
  const guestName =
    data.showGuestName !== false ? guestDisplayName(guest) : ''
  const eventTitle = data.eventTitleOverride?.trim() || event.title
  const dateLabel = formatEventDateRange(event.dateStart, event.dateEnd, event.timezone, locale)
  const parts = dateParts(event.dateStart, event.timezone)
  const monogram = initials(eventTitle || 'Undangan')
  const onDetailStage = stage?.stage === 'detail'

  const activate = () => {
    if (stage) {
      stage.open()
      return
    }

    // Blok dipakai di halaman biasa: tidak ada tahap detail, cukup gulir.
    const target = document.getElementById('acara')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
  }

  const enterStyle = (delay: number): React.CSSProperties => ({
    opacity: entered ? 1 : 0,
    transform: entered ? 'translateY(0)' : 'translateY(14px)',
    transition: `opacity 900ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 900ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  })

  const photo = variant === 'cover-photo'
  const minimal = variant === 'cover-minimal'

  const tone = {
    title: usePhoto ? 'text-white' : 'text-(--theme-text)',
    muted: usePhoto ? 'text-white/75' : 'text-(--theme-muted)',
    line: usePhoto ? 'border-white/30' : 'border-(--theme-border)',
    panel: usePhoto
      ? 'border-white/25 bg-black/25 backdrop-blur-md'
      : 'border-(--theme-border) bg-(--theme-surface)',
  }

  return (
    <section
      className={`relative flex h-[100svh] w-full flex-col overflow-hidden ${
        usePhoto ? '' : 'bg-(--theme-bg)'
      }`}
      style={
        usePhoto
          ? {
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : {
              background:
                'radial-gradient(120% 90% at 50% 0%, color-mix(in srgb, var(--theme-primary) 10%, transparent), transparent 60%), var(--theme-bg)',
            }
      }
    >
      {usePhoto ? (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, rgba(0,0,0,${Math.min(
                0.92,
                overlay + 0.18,
              )}) 0%, rgba(0,0,0,${overlay}) 45%, rgba(0,0,0,${Math.min(
                0.96,
                overlay + 0.28,
              )}) 100%)`,
            }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.16]"
            aria-hidden="true"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27120%27 height=%27120%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%272%27/%3E%3C/filter%3E%3Crect width=%27120%27 height=%27120%27 filter=%27url(%23n)%27 opacity=%270.55%27/%3E%3C/svg%3E")',
              mixBlendMode: 'soft-light',
            }}
          />
        </>
      ) : null}

      {/* Bingkai tipis + aksen sudut: sentuhan editorial, bukan kartu biasa. */}
      <div
        className={`pointer-events-none absolute inset-4 md:inset-7 border ${tone.line} opacity-70`}
        style={{ borderRadius: 'calc(var(--theme-radius-box) * 1.4)' }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {[
          'left-4 top-4 md:left-7 md:top-7',
          'right-4 top-4 md:right-7 md:top-7',
          'left-4 bottom-4 md:left-7 md:bottom-7',
          'right-4 bottom-4 md:right-7 md:bottom-7',
        ].map((position) => (
          <span
            key={position}
            className={`absolute ${position} h-2.5 w-2.5 rotate-45 ${
              usePhoto ? 'bg-white/60' : 'bg-(--theme-primary)'
            }`}
          />
        ))}
      </div>

      {/* Wilayah identitas tamu bisa digulir di layar pendek, sementara tombol
          "Buka Undangan" tetap menempel di bawah agar selalu terlihat. */}
      <div className="relative z-10 flex min-h-0 w-full flex-1 flex-col items-center overflow-y-auto overscroll-contain px-6 pb-2 pt-16 text-center [@media(max-height:660px)]:pt-10">
        <div className={`my-auto w-full py-6 [@media(max-height:660px)]:py-1 ${minimal ? 'max-w-3xl' : 'max-w-2xl'}`}>
          {data.eyebrow ? (
            <p
              style={enterStyle(0)}
              className={`text-[10px] md:text-[11px] font-medium uppercase tracking-[0.55em] ${tone.muted}`}
            >
              {data.eyebrow}
            </p>
          ) : null}

          {/* Monogram: memperkuat identitas acara tanpa mengubah data tamu. */}
          <div style={enterStyle(60)} className="mt-7 flex items-center justify-center gap-4 [@media(max-height:660px)]:mt-4">
            <span className={`h-px w-10 ${usePhoto ? 'bg-white/40' : 'bg-(--theme-border)'}`} />
            <span
              className={`flex h-14 w-14 items-center justify-center border text-sm font-semibold tracking-[0.18em] [@media(max-height:660px)]:h-11 [@media(max-height:660px)]:w-11 ${
                usePhoto
                  ? 'border-white/40 text-white'
                  : 'border-(--theme-border) text-(--theme-text)'
              }`}
              style={{
                borderRadius: '999px',
                fontFamily: 'var(--theme-font-heading)',
                background: usePhoto ? 'rgba(255,255,255,0.06)' : 'var(--theme-surface)',
              }}
            >
              {monogram}
            </span>
            <span className={`h-px w-10 ${usePhoto ? 'bg-white/40' : 'bg-(--theme-border)'}`} />
          </div>

          {data.showEventTitle !== false && eventTitle ? (
            <h1
              style={{ ...invitationDisplay('cover'), ...enterStyle(140) }}
              className={`mt-7 font-semibold tracking-tight [@media(max-height:660px)]:mt-4 ${tone.title}`}
            >
              {eventTitle}
            </h1>
          ) : null}

          {data.showDate !== false && dateLabel ? (
            <div
              style={enterStyle(220)}
              className={`mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm md:text-base [@media(max-height:660px)]:mt-3 ${tone.muted}`}
            >
              {parts ? (
                <span className="inline-flex items-baseline gap-1.5">
                  <span
                    className={`text-2xl md:text-3xl font-semibold ${tone.title}`}
                    style={{ fontFamily: 'var(--theme-font-heading)' }}
                  >
                    {parts.day}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.3em]">{parts.month}</span>
                </span>
              ) : null}
              <span className={`hidden h-3 w-px sm:block ${usePhoto ? 'bg-white/40' : 'bg-(--theme-border)'}`} />
              <span className="tracking-wide">{dateLabel}</span>
            </div>
          ) : null}

          {guestName ? (
            <div
              style={{ ...enterStyle(300), borderRadius: 'var(--theme-radius-box)' }}
              className={`mx-auto mt-10 w-full max-w-md border px-6 py-6 [@media(max-height:660px)]:mt-5 [@media(max-height:660px)]:py-4 ${tone.panel}`}
            >
              <p className={`text-[10px] uppercase tracking-[0.4em] ${tone.muted}`}>
                {data.guestLabel || 'Kepada Yth.'}
              </p>
              <p
                className={`mt-3 text-2xl md:text-3xl font-semibold leading-tight ${tone.title}`}
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                {guestName}
              </p>
              {data.showPax !== false ? (
                <p className={`mt-2 text-xs tracking-wide ${tone.muted}`}>
                  {formatPaxCount(guest.pax, locale)}
                </p>
              ) : null}
            </div>
          ) : null}

          {data.showPersonalNote !== false && guest.personalNote ? (
            <div
              style={{ ...enterStyle(360), borderRadius: 'var(--theme-radius-box)' }}
              className={`mx-auto mt-3 w-full max-w-md border px-5 py-4 text-left [@media(max-height:660px)]:mt-2 [@media(max-height:660px)]:py-3 ${tone.panel}`}
            >
              <p className={`text-[10px] uppercase tracking-[0.35em] ${tone.muted}`}>
                {data.personalNoteLabel || 'Pesan untuk Anda'}
              </p>
              <p className={`mt-2 text-sm leading-relaxed ${tone.title}`}>{guest.personalNote}</p>
            </div>
          ) : null}

          {data.showCountdown && countdown ? (
            <div style={enterStyle(420)} className="mx-auto mt-8 w-full max-w-md [@media(max-height:660px)]:mt-5">
              <p className={`mb-3 text-[10px] uppercase tracking-[0.4em] ${tone.muted}`}>
                {data.countdownLabel || 'Menuju hari bahagia'}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {countdownUnits(countdown, locale).map((item) => (
                  <div
                    key={item.key}
                    className={`border px-2 py-3 ${tone.panel}`}
                    style={{ borderRadius: 'var(--theme-radius-box)' }}
                  >
                    <p
                      className={`text-xl font-semibold tabular-nums ${tone.title}`}
                      style={{ fontFamily: 'var(--theme-font-heading)' }}
                    >
                      {String(item.value).padStart(2, '0')}
                    </p>
                    <p className={`mt-0.5 text-[9px] uppercase tracking-[0.2em] ${tone.muted}`}>
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {data.note ? (
            <p
              style={enterStyle(560)}
              className={`mx-auto mt-6 max-w-sm text-xs leading-relaxed ${tone.muted}`}
            >
              {data.note}
            </p>
          ) : null}
        </div>
      </div>

      {/* Aksi utama selalu di bawah layar, tidak ikut tergulir. */}
      {!onDetailStage ? (
        <div
          style={enterStyle(620)}
          className="relative z-10 w-full shrink-0 px-6 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-2 text-center"
        >
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 -top-24"
            aria-hidden="true"
            style={{
              background: `linear-gradient(to top, ${
                usePhoto ? 'rgba(0,0,0,0.55)' : 'var(--theme-bg)'
              } 45%, transparent)`,
            }}
          />
          <div className="relative">
            <button
              type="button"
              onClick={activate}
              className="group inline-flex items-center justify-center gap-3 px-8 py-3.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:gap-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
              style={{
                background: 'var(--theme-primary)',
                color: 'var(--theme-primary-text)',
                borderRadius: 'var(--theme-radius-btn)',
                boxShadow: 'var(--theme-shadow, 0 18px 40px -22px rgba(0,0,0,0.55))',
              }}
            >
              <HeartIcon className="h-4 w-4 opacity-80" />
              {data.openButtonLabel || 'Buka Undangan'}
              <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            <p className={`mt-3 text-[10px] uppercase tracking-[0.4em] ${tone.muted}`}>
              {photo ? 'Sentuh untuk membuka' : 'Undangan digital'}
            </p>
          </div>
        </div>
      ) : null}
    </section>
  )
}
