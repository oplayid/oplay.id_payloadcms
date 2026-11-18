'use client'

import React from 'react'
import { formatEventDateRange } from '@/lib/formatDate'
import { InvitationBlockProps, InvitationOnlyNotice, InvitationSection, SectionHeading } from './shared'
import { countdownUnits, useCountdown } from './useCountdown'

export type CountdownData = {
  variant?: string | null
  sectionBadge?: string | null
  sectionTitle?: string | null
  sectionSubtitle?: string | null
  showDate?: boolean | null
  finishedLabel?: string | null
  note?: string | null
}

export default function CountdownBlock({
  data,
  invitationContext,
}: InvitationBlockProps<CountdownData>) {
  if (!invitationContext) return <InvitationOnlyNotice />
  return <Countdown data={data} context={invitationContext} />
}

function Countdown({
  data,
  context,
}: {
  data: CountdownData
  context: NonNullable<InvitationBlockProps<CountdownData>['invitationContext']>
}) {
  const { event, locale } = context
  const countdown = useCountdown(event.dateStart)
  const dateLabel = formatEventDateRange(event.dateStart, event.dateEnd, event.timezone, locale)
  const variant = data.variant || 'countdown-cards'

  if (!event.dateStart) return null

  const units = countdown ? countdownUnits(countdown, locale) : null
  const finished = countdown?.finished === true
  const inline = variant === 'countdown-inline'

  return (
    <InvitationSection>
      <SectionHeading
        badge={data.sectionBadge}
        title={data.sectionTitle || (locale === 'en' ? 'Counting down' : 'Menuju Hari Bahagia')}
        subtitle={data.sectionSubtitle}
      />

      {finished ? (
        <p className="text-center text-base font-medium text-(--theme-success)">
          {data.finishedLabel || (locale === 'en' ? 'The day has arrived.' : 'Hari bahagia telah tiba.')}
        </p>
      ) : (
        <div
          className={
            inline
              ? 'mx-auto flex w-full max-w-xl items-stretch justify-center divide-x divide-(--theme-border) border-y border-(--theme-border)'
              : 'mx-auto grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4'
          }
        >
          {(units || []).map((unit, index) => (
            <div
              key={unit.key}
              className={
                inline
                  ? 'flex-1 px-3 py-5 text-center'
                  : 'border border-(--theme-border) bg-(--theme-surface) px-3 py-6 text-center'
              }
              style={inline ? undefined : { borderRadius: 'var(--theme-radius-box)' }}
            >
              <p
                className="text-4xl font-semibold tabular-nums leading-none text-(--theme-text) md:text-5xl"
                style={{ fontFamily: 'var(--theme-font-heading)' }}
              >
                {String(unit.value).padStart(2, '0')}
              </p>
              <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-(--theme-muted)">
                {unit.label}
              </p>
              {!inline ? (
                <span
                  className="mx-auto mt-3 block h-1 w-1 rotate-45"
                  style={{
                    background: index === 0 ? 'var(--theme-primary)' : 'var(--theme-border)',
                  }}
                  aria-hidden="true"
                />
              ) : null}
            </div>
          ))}
        </div>
      )}

      {data.showDate !== false && dateLabel ? (
        <p className="mt-6 text-center text-xs uppercase tracking-[0.3em] text-(--theme-muted)">
          {dateLabel}
        </p>
      ) : null}

      {data.note ? (
        <p className="mt-4 text-center text-xs leading-relaxed text-(--theme-muted)">{data.note}</p>
      ) : null}
    </InvitationSection>
  )
}
