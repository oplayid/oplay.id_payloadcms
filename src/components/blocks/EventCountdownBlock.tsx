'use client'

import React from 'react'
import Container from '@/components/ui/Container'
import { countdownUnits, useCountdown } from '@/lib/useCountdown'

export type EventCountdownData = {
  variant?: string | null
  sectionBadge?: string | null
  sectionTitle?: string | null
  sectionSubtitle?: string | null
  targetDate?: string | null
  timezone?: string | null
  showDate?: boolean | null
  showLabels?: boolean | null
  finishedLabel?: string | null
  note?: string | null
}

type Props = {
  data: EventCountdownData
  themeLayout?: string
  siteContext?: { locale?: string } | null
}

/** Format tanggal deterministik di server maupun client (zona waktu eksplisit). */
function formatTargetDate(value: string, timezone: string, locale: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  try {
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'id-ID', {
      timeZone: timezone,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  } catch {
    // Zona waktu invalid dari admin: jangan sampai merusak halaman.
    return date.toISOString()
  }
}

export default function EventCountdownBlock({
  data,
  themeLayout,
  siteContext,
}: Props) {
  const variant = data.variant || 'countdown-cards'
  const timezone = data.timezone?.trim() || 'Asia/Jakarta'
  const locale = siteContext?.locale === 'en' ? 'en' : 'id'
  const remaining = useCountdown(data.targetDate)
  const dateLabel = data.targetDate
    ? formatTargetDate(data.targetDate, timezone, locale)
    : ''

  if (!data.targetDate) {
    return (
      <section className="w-full py-12">
        <Container containerClass={themeLayout}>
          <div className="rounded-(--theme-radius-box) border border-dashed border-(--theme-border) bg-(--theme-surface) p-6 text-center text-sm text-(--theme-muted)">
            {locale === 'en'
              ? 'No target time has been set for this countdown yet.'
              : 'Waktu target untuk hitung mundur ini belum diatur.'}
          </div>
        </Container>
      </section>
    )
  }

  const units = remaining ? countdownUnits(remaining, locale) : null

  return (
    <section className="w-full py-16 md:py-20">
      <Container containerClass={themeLayout}>
        <div className="flex flex-col items-center gap-8 text-center">
          {(data.sectionBadge ||
            data.sectionTitle ||
            data.sectionSubtitle) && (
            <div className="flex flex-col items-center gap-2">
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

          {remaining?.finished ? (
            <p className="font-heading text-2xl font-semibold text-(--theme-primary) md:text-3xl">
              {data.finishedLabel || (locale === 'en' ? 'The time has come' : 'Waktu telah tiba')}
            </p>
          ) : variant === 'countdown-minimal' ? (
            <p
              className="font-heading text-xl font-semibold text-(--theme-text) md:text-2xl"
              aria-live="polite"
            >
              {units
                ? units.map((unit) => `${unit.value} ${unit.label}`).join(' · ')
                : '· · ·'}
            </p>
          ) : variant === 'countdown-inline' ? (
            <div
              className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
              aria-live="polite"
            >
              {(units || countdownUnits(
                { days: 0, hours: 0, minutes: 0, seconds: 0, finished: false },
                locale,
              )).map((unit, index) => (
                <React.Fragment key={unit.key}>
                  {index > 0 ? (
                    <span className="text-(--theme-muted)" aria-hidden="true">
                      :
                    </span>
                  ) : null}
                  <span className="flex items-baseline gap-1.5">
                    <span className="font-heading text-2xl font-bold tabular-nums text-(--theme-text) md:text-3xl">
                      {remaining ? String(unit.value).padStart(2, '0') : '--'}
                    </span>
                    {data.showLabels !== false ? (
                      <span className="text-xs text-(--theme-muted)">{unit.label}</span>
                    ) : null}
                  </span>
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="grid w-full max-w-3xl grid-cols-2 gap-3 md:grid-cols-4" aria-live="polite">
              {(units || countdownUnits(
                { days: 0, hours: 0, minutes: 0, seconds: 0, finished: false },
                locale,
              )).map((unit) => (
                <div
                  key={unit.key}
                  className="flex flex-col items-center gap-1 rounded-(--theme-radius-box) border border-(--theme-border) bg-(--theme-surface) px-4 py-5 shadow-(--theme-shadow)"
                >
                  <span className="font-heading text-3xl font-bold tabular-nums text-(--theme-primary) md:text-4xl">
                    {remaining ? String(unit.value).padStart(2, '0') : '--'}
                  </span>
                  {data.showLabels !== false ? (
                    <span className="text-xs uppercase tracking-wider text-(--theme-muted)">
                      {unit.label}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          {data.showDate && dateLabel ? (
            <p className="text-sm text-(--theme-muted)">{dateLabel}</p>
          ) : null}
          {data.note ? (
            <p className="max-w-2xl text-sm text-(--theme-muted)">{data.note}</p>
          ) : null}
        </div>
      </Container>
    </section>
  )
}
