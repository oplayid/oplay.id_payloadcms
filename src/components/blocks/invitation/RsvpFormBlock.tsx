'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { formatDeadlineDate } from '@/lib/formatDate'
import {
  isRsvpOpen,
  RSVP_STATUS_LABEL,
  type InvitationRsvpStatus,
} from '@/lib/invitationContext'
import {
  formatPaxCount,
  InvitationBlockProps,
  InvitationOnlyNotice,
  InvitationSection,
  SectionHeading,
} from './shared'

export type RsvpFormData = {
  variant?: string | null
  sectionBadge?: string | null
  sectionTitle?: string | null
  sectionSubtitle?: string | null
  submitLabel?: string | null
  successMessage?: string | null
  closedMessage?: string | null
  showPax?: boolean | null
  showMessage?: boolean | null
  messageLabel?: string | null
  note?: string | null
}

type ResponseBody = {
  ok?: boolean
  status?: InvitationRsvpStatus
  pax?: number
  error?: string
}

export default function RsvpFormBlock({
  data,
  invitationContext,
}: InvitationBlockProps<RsvpFormData>) {
  if (!invitationContext) return <InvitationOnlyNotice />

  return <RsvpForm data={data} context={invitationContext} />
}

function RsvpForm({
  data,
  context,
}: {
  data: RsvpFormData
  context: NonNullable<InvitationBlockProps<RsvpFormData>['invitationContext']>
}) {
  const { guest, event, locale, key } = context
  const deadlineLabel = formatDeadlineDate(event.rsvpDeadline, locale)

  const [isOpen, setIsOpen] = useState(() => isRsvpOpen({ event }))
  const [status, setStatus] = useState<'attending' | 'not_attending'>(
    guest.rsvpStatus === 'not_attending' ? 'not_attending' : 'attending',
  )
  const [pax, setPax] = useState(() => {
    const initial = guest.rsvpPax ?? guest.pax
    return Math.min(Math.max(1, initial), Math.max(1, guest.pax))
  })
  const [message, setMessage] = useState(guest.rsvpMessage || '')
  const [honeypot, setHoneypot] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [savedStatus, setSavedStatus] = useState<InvitationRsvpStatus>(guest.rsvpStatus)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  // Evaluasi ulang di client agar deadline tetap akurat setelah hidrasi.
  useEffect(() => {
    setIsOpen(isRsvpOpen({ event }))
  }, [event])

  const paxOptions = useMemo(
    () => Array.from({ length: Math.max(1, guest.pax) }, (_, index) => index + 1),
    [guest.pax],
  )

  const submit = async (submitEvent: React.FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault()
    if (submitting || !isOpen) return

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/invitations/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          status,
          pax: status === 'attending' ? pax : 0,
          message: message.trim(),
          path: window.location.pathname,
          website: honeypot,
        }),
      })

      const body = (await response.json().catch(() => ({}))) as ResponseBody
      if (!response.ok || body.ok === false) {
        throw new Error(body.error || 'Konfirmasi gagal dikirim. Silakan coba lagi.')
      }

      setSavedStatus(body.status || status)
      setDone(true)
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Konfirmasi gagal dikirim. Silakan coba lagi.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const statusSummary = savedStatus === 'pending' ? null : RSVP_STATUS_LABEL[savedStatus]

  return (
    <InvitationSection>
      <SectionHeading
        badge={data.sectionBadge}
        title={data.sectionTitle || 'Konfirmasi Kehadiran'}
        subtitle={data.sectionSubtitle}
      />

      <div
        className={
          data.variant === 'rsvp-plain'
            ? 'relative'
            : 'relative overflow-hidden border border-(--theme-border) bg-(--theme-surface) p-5 md:p-7'
        }
        style={data.variant === 'rsvp-plain' ? undefined : { borderRadius: 'var(--theme-radius-box)' }}
      >
        {data.variant === 'rsvp-plain' ? null : (
          <span
            className="absolute inset-x-0 top-0 h-0.5"
            style={{ background: 'var(--theme-primary)' }}
            aria-hidden="true"
          />
        )}
        {!isOpen ? (
          <div className="space-y-3 text-center">
            <p className="text-sm font-medium text-(--theme-text)">
              {data.closedMessage || 'Konfirmasi kehadiran sudah ditutup.'}
            </p>
            {statusSummary ? (
              <p className="text-sm text-(--theme-muted)">
                {locale === 'en' ? 'Your response' : 'Konfirmasi Anda'}: {statusSummary}
                {savedStatus === 'attending' ? ` · ${formatPaxCount(guest.rsvpPax || pax, locale)}` : ''}
              </p>
            ) : null}
            {deadlineLabel ? (
              <p className="text-xs text-(--theme-muted)">
                {locale === 'en' ? 'Deadline' : 'Batas konfirmasi'}: {deadlineLabel}
              </p>
            ) : null}
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  { value: 'attending', label: locale === 'en' ? 'Yes, I will attend' : 'Hadir' },
                  {
                    value: 'not_attending',
                    label: locale === 'en' ? 'Sorry, I cannot attend' : 'Tidak hadir',
                  },
                ] as const
              ).map((option) => {
                const active = status === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStatus(option.value)}
                    aria-pressed={active}
                    className={`group flex items-center gap-3 border px-4 py-3 text-left text-sm font-medium transition ${
                      active
                        ? 'border-(--theme-primary) bg-(--theme-primary) text-(--theme-primary-text)'
                        : 'border-(--theme-border) bg-(--theme-bg) text-(--theme-text) hover:border-(--theme-border-hover)'
                    }`}
                    style={{ borderRadius: 'var(--theme-radius-btn)' }}
                  >
                    <span
                      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        active ? 'border-current' : 'border-(--theme-border)'
                      }`}
                      aria-hidden="true"
                    >
                      {active ? (
                        <span className="h-2 w-2 rounded-full bg-current" />
                      ) : null}
                    </span>
                    {option.label}
                  </button>
                )
              })}
            </div>

            {data.showPax !== false && status === 'attending' ? (
              <label className="block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-(--theme-muted)">
                  {locale === 'en' ? 'Number of guests' : 'Jumlah orang yang hadir'}
                </span>
                <select
                  value={pax}
                  onChange={(selectEvent) => setPax(Number(selectEvent.target.value))}
                  className="w-full border border-(--theme-border) bg-(--theme-bg) px-3 py-2 text-sm text-(--theme-text)"
                  style={{ borderRadius: 'var(--theme-radius-box)' }}
                >
                  {paxOptions.map((option) => (
                    <option key={option} value={option}>
                      {formatPaxCount(option, locale)}
                    </option>
                  ))}
                </select>
                <span className="mt-1 block text-xs text-(--theme-muted)">
                  {locale === 'en'
                    ? `Maximum ${guest.pax} guests for this invitation.`
                    : `Maksimal ${guest.pax} orang untuk undangan ini.`}
                </span>
              </label>
            ) : null}

            {data.showMessage !== false ? (
              <label className="block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-(--theme-muted)">
                  {data.messageLabel || 'Ucapan & doa'}
                </span>
                <textarea
                  value={message}
                  onChange={(changeEvent) => setMessage(changeEvent.target.value)}
                  rows={4}
                  maxLength={700}
                  placeholder={
                    locale === 'en'
                      ? 'Write your wishes for the happy couple...'
                      : 'Tuliskan ucapan dan doa untuk kedua mempelai...'
                  }
                  className="w-full border border-(--theme-border) bg-(--theme-bg) px-3 py-2 text-sm text-(--theme-text)"
                  style={{ borderRadius: 'var(--theme-radius-box)' }}
                />
              </label>
            ) : null}

            {/* Honeypot: diisi hanya oleh bot, bukan oleh tamu. */}
            <div className="hidden" aria-hidden="true">
              <label>
                Website
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(changeEvent) => setHoneypot(changeEvent.target.value)}
                />
              </label>
            </div>

            {done ? (
              <div
                role="status"
                className="flex items-start gap-3 border px-4 py-3 text-sm"
                style={{
                  borderRadius: 'var(--theme-radius-box)',
                  borderColor: 'color-mix(in srgb, var(--theme-success) 45%, var(--theme-border))',
                  background: 'color-mix(in srgb, var(--theme-success) 8%, transparent)',
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0"
                  stroke="var(--theme-success)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m5 12 5 5L20 7" />
                </svg>
                <span className="font-medium text-(--theme-success)">
                  {data.successMessage || 'Terima kasih! Konfirmasi Anda sudah kami terima.'}
                </span>
              </div>
            ) : null}

            {error ? (
              <p className="text-sm font-medium text-(--theme-danger)" role="alert">
                {error}
              </p>
            ) : null}

            <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center px-6 py-3.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:opacity-90 disabled:opacity-60 sm:w-auto"
                style={{
                  background: 'var(--theme-primary)',
                  color: 'var(--theme-primary-text)',
                  borderRadius: 'var(--theme-radius-btn)',
                  boxShadow: 'var(--theme-shadow, 0 18px 40px -24px rgba(0,0,0,0.5))',
                }}
              >
                {submitting
                  ? locale === 'en'
                    ? 'Sending...'
                    : 'Mengirim...'
                  : data.submitLabel || 'Kirim Konfirmasi'}
              </button>

              {deadlineLabel ? (
                <span className="text-xs text-(--theme-muted)">
                  {locale === 'en' ? 'Deadline' : 'Batas konfirmasi'}: {deadlineLabel}
                </span>
              ) : null}
            </div>

            {statusSummary && !done ? (
              <p className="text-xs text-(--theme-muted)">
                {locale === 'en' ? 'Current response' : 'Konfirmasi tersimpan'}: {statusSummary}
              </p>
            ) : null}
          </form>
        )}
      </div>

      {data.note ? (
        <p className="mt-5 text-center text-xs leading-relaxed text-(--theme-muted)">{data.note}</p>
      ) : null}
    </InvitationSection>
  )
}
