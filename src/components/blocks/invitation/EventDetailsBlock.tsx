import React from 'react'
import { formatEventDateRange, formatEventTimeRange } from '@/lib/formatDate'
import { resolveMapsURL } from '@/lib/invitationContext'
import {
  InvitationBlockProps,
  InvitationOnlyNotice,
  InvitationSection,
  SectionHeading,
} from './shared'

export type EventDetailsData = {
  variant?: string | null
  sectionBadge?: string | null
  sectionTitle?: string | null
  sectionSubtitle?: string | null
  showDate?: boolean | null
  showTime?: boolean | null
  showVenue?: boolean | null
  showMaps?: boolean | null
  mapsButtonLabel?: string | null
  showDressCode?: boolean | null
  showHost?: boolean | null
  showRundown?: boolean | null
  rundownTitle?: string | null
  note?: string | null
}

function whatsappLink(contact: string | null | undefined): string {
  const digits = String(contact || '').replace(/[^\d]/g, '')
  if (!digits) return ''
  const normalized = digits.startsWith('0') ? `62${digits.slice(1)}` : digits
  return `https://wa.me/${normalized}`
}

type IconName = 'calendar' | 'clock' | 'pin' | 'dress' | 'user'

function DetailIcon({ name, className = '' }: { name: IconName; className?: string }) {
  const paths: Record<IconName, React.ReactNode> = {
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M8 3v4M16 3v4M3 11h18" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    pin: (
      <>
        <path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    dress: (
      <>
        <path d="M9 4c0 2 6 2 6 0l-1 4 3 3-2 9H9l-2-9 3-3-1-4Z" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
      </>
    ),
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}

function InfoCard({
  label,
  value,
  hint,
  action,
  icon,
  tone = 'default',
}: {
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  action?: React.ReactNode
  icon: IconName
  tone?: 'default' | 'accent'
}) {
  if (!value) return null

  return (
    <div
      className="group relative overflow-hidden border border-(--theme-border) bg-(--theme-surface) p-5 transition-colors duration-300 hover:border-(--theme-border-hover)"
      style={{
        borderRadius: 'var(--theme-radius-box)',
        ...(tone === 'accent'
          ? { borderColor: 'color-mix(in srgb, var(--theme-primary) 45%, var(--theme-border))' }
          : {}),
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center border border-(--theme-border) text-(--theme-muted)"
          style={{ borderRadius: '999px' }}
        >
          <DetailIcon name={icon} className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-(--theme-muted)">
            {label}
          </p>
          <div className="mt-1.5 text-base font-medium leading-relaxed text-(--theme-text)">
            {value}
          </div>
          {hint ? <div className="mt-1 text-sm leading-relaxed text-(--theme-muted)">{hint}</div> : null}
          {action ? <div className="mt-3">{action}</div> : null}
        </div>
      </div>
    </div>
  )
}

export default function EventDetailsBlock({
  data,
  invitationContext,
}: InvitationBlockProps<EventDetailsData>) {
  if (!invitationContext) return <InvitationOnlyNotice />

  const { event, locale } = invitationContext
  const variant = data.variant || 'details-cards'
  const dateLabel = formatEventDateRange(event.dateStart, event.dateEnd, event.timezone, locale)
  const timeLabel = formatEventTimeRange(event.dateStart, event.dateEnd, event.timezone, locale)
  const mapsURL = resolveMapsURL(event)
  const waLink = whatsappLink(event.hostContact)
  const rundown = Array.isArray(event.rundown) ? event.rundown : []
  const showRundown = data.showRundown !== false && rundown.length > 0

  const gridClass =
    variant === 'details-list'
      ? 'space-y-3'
      : variant === 'details-minimal'
        ? 'grid gap-4 sm:grid-cols-2'
        : 'grid gap-4 sm:grid-cols-2'

  const mapsButton =
    data.showMaps !== false && mapsURL ? (
      <a
        href={mapsURL}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold transition hover:-translate-y-0.5 hover:opacity-90"
        style={{
          background: 'var(--theme-primary)',
          color: 'var(--theme-primary-text)',
          borderRadius: 'var(--theme-radius-btn)',
        }}
      >
        <DetailIcon name="pin" className="h-3.5 w-3.5" />
        {data.mapsButtonLabel || 'Buka di Google Maps'}
      </a>
    ) : null

  return (
    <InvitationSection>
      <SectionHeading
        badge={data.sectionBadge}
        title={data.sectionTitle || 'Detail Acara'}
        subtitle={data.sectionSubtitle}
      />

      <div className={gridClass}>
        {data.showDate !== false && dateLabel ? (
          <InfoCard
            label={locale === 'en' ? 'Date' : 'Tanggal'}
            value={dateLabel}
            icon="calendar"
            tone="accent"
          />
        ) : null}

        {data.showTime !== false && timeLabel ? (
          <InfoCard label={locale === 'en' ? 'Time' : 'Waktu'} value={timeLabel} icon="clock" />
        ) : null}

        {data.showVenue !== false && (event.venueName || event.address) ? (
          <InfoCard
            label={locale === 'en' ? 'Venue' : 'Lokasi'}
            value={event.venueName || event.address}
            hint={event.address && event.address !== event.venueName ? event.address : undefined}
            action={mapsButton}
            icon="pin"
          />
        ) : null}

        {data.showDressCode !== false && event.dressCode ? (
          <InfoCard label="Dress Code" value={event.dressCode} icon="dress" />
        ) : null}

        {data.showHost !== false && (event.hostName || event.hostContact) ? (
          <InfoCard
            label={locale === 'en' ? 'Host' : 'Penyelenggara'}
            value={event.hostName || 'Penyelenggara'}
            hint={event.hostContact}
            icon="user"
            action={
              waLink ? (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center justify-center border border-(--theme-border) px-4 py-2 text-xs font-semibold text-(--theme-text) transition hover:border-(--theme-border-hover)"
                  style={{ borderRadius: 'var(--theme-radius-btn)' }}
                >
                  {locale === 'en' ? 'Chat via WhatsApp' : 'Hubungi via WhatsApp'}
                </a>
              ) : null
            }
          />
        ) : null}
      </div>

      {showRundown ? (
        <div className="mt-10">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h3
              className="text-lg font-semibold text-(--theme-text) md:text-xl"
              style={{ fontFamily: 'var(--theme-font-heading)' }}
            >
              {data.rundownTitle || 'Susunan Acara'}
            </h3>
            <span className="h-px flex-1 bg-(--theme-border)" aria-hidden="true" />
          </div>

          <ol className="relative space-y-2.5 border-l border-(--theme-border) pl-5">
            {rundown.map((item, index) => (
              <li key={`${item.time || ''}-${index}`} className="relative">
                <span
                  className="absolute -left-[1.65rem] top-4 h-2 w-2 rotate-45"
                  style={{
                    background: index === 0 ? 'var(--theme-primary)' : 'var(--theme-border)',
                  }}
                  aria-hidden="true"
                />
                <div
                  className="border border-(--theme-border) bg-(--theme-surface) px-4 py-3 transition-colors duration-300 hover:border-(--theme-border-hover)"
                  style={{ borderRadius: 'var(--theme-radius-box)' }}
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-(--theme-primary)">
                    {item.time || '—'}
                  </span>
                  <span className="mt-1 block text-sm font-medium text-(--theme-text)">
                    {item.title}
                  </span>
                  {item.description ? (
                    <span className="mt-1 block text-xs leading-relaxed text-(--theme-muted)">
                      {item.description}
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {data.note ? (
        <p className="mt-6 text-center text-xs leading-relaxed text-(--theme-muted)">{data.note}</p>
      ) : null}
    </InvitationSection>
  )
}
