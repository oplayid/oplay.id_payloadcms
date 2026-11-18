'use client'

import React, { useState } from 'react'
import {
  InvitationBlockProps,
  InvitationOnlyNotice,
  InvitationSection,
  SectionHeading,
} from './shared'

export type GiftInfoData = {
  variant?: string | null
  sectionBadge?: string | null
  sectionTitle?: string | null
  sectionSubtitle?: string | null
  showAccounts?: boolean | null
  copyLabel?: string | null
  showGiftAddress?: boolean | null
  giftAddressOverride?: string | null
  note?: string | null
}

async function copyText(value: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  const input = document.createElement('textarea')
  input.value = value
  input.style.position = 'fixed'
  input.style.opacity = '0'
  document.body.appendChild(input)
  input.select()
  document.execCommand('copy')
  document.body.removeChild(input)
}

function CopyIcon({ className = '' }: { className?: string }) {
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
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  )
}

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 5 5L20 7" />
    </svg>
  )
}

export default function GiftInfoBlock({
  data,
  invitationContext,
}: InvitationBlockProps<GiftInfoData>) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  if (!invitationContext) return <InvitationOnlyNotice />

  const { event, locale } = invitationContext
  const gifts = data.showAccounts === false ? [] : Array.isArray(event.gifts) ? event.gifts : []
  const address =
    data.showGiftAddress === false
      ? ''
      : data.giftAddressOverride?.trim() || event.giftAddress || ''

  if (gifts.length === 0 && !address && !data.note) return null

  const handleCopy = async (index: number, value: string) => {
    try {
      await copyText(value.replace(/\s+/g, ''))
      setCopiedIndex(index)
      window.setTimeout(() => setCopiedIndex(null), 1800)
    } catch {
      setCopiedIndex(null)
    }
  }

  const list = data.variant === 'gift-list'

  return (
    <InvitationSection>
      <SectionHeading
        badge={data.sectionBadge}
        title={data.sectionTitle || 'Hadiah & Angpao'}
        subtitle={data.sectionSubtitle}
      />

      {gifts.length > 0 ? (
        <div className={list ? 'space-y-3' : 'grid gap-3 sm:grid-cols-2'}>
          {gifts.map((gift, index) => {
            const copied = copiedIndex === index
            return (
              <div
                key={`${gift.bankName}-${gift.accountNumber}-${index}`}
                className="relative overflow-hidden border border-(--theme-border) bg-(--theme-surface) p-5 transition-colors duration-300 hover:border-(--theme-border-hover)"
                style={{ borderRadius: 'var(--theme-radius-box)' }}
              >
                <span
                  className="absolute inset-x-0 top-0 h-0.5"
                  style={{ background: index === 0 ? 'var(--theme-primary)' : 'var(--theme-border)' }}
                  aria-hidden="true"
                />

                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    {gift.label ? (
                      <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-(--theme-muted)">
                        {gift.label}
                      </p>
                    ) : null}
                    <p className="mt-1.5 text-sm font-semibold text-(--theme-text)">
                      {gift.bankName}
                    </p>
                    <p
                      className="mt-1 break-all text-lg font-medium tracking-[0.08em] text-(--theme-text) tabular-nums"
                      style={{ fontFamily: 'var(--theme-font-heading)' }}
                    >
                      {gift.accountNumber}
                    </p>
                    {gift.accountName ? (
                      <p className="mt-1 text-xs text-(--theme-muted)">a.n. {gift.accountName}</p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(index, String(gift.accountNumber || ''))}
                    aria-label={
                      copied
                        ? locale === 'en'
                          ? 'Number copied'
                          : 'Nomor tersalin'
                        : data.copyLabel || 'Salin nomor'
                    }
                    className={`inline-flex shrink-0 items-center gap-2 border px-3 py-2 text-[11px] font-semibold transition ${
                      copied
                        ? 'border-(--theme-success) text-(--theme-success)'
                        : 'border-(--theme-border) text-(--theme-text) hover:border-(--theme-border-hover)'
                    }`}
                    style={{ borderRadius: 'var(--theme-radius-btn)' }}
                  >
                    {copied ? (
                      <CheckIcon className="h-3.5 w-3.5" />
                    ) : (
                      <CopyIcon className="h-3.5 w-3.5" />
                    )}
                    {copied
                      ? locale === 'en'
                        ? 'Copied'
                        : 'Tersalin'
                      : data.copyLabel || 'Salin nomor'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : null}

      {address ? (
        <div
          className="mt-4 border border-(--theme-border) bg-(--theme-surface) p-5"
          style={{ borderRadius: 'var(--theme-radius-box)' }}
        >
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-(--theme-muted)">
            {locale === 'en' ? 'Gift delivery address' : 'Alamat pengiriman hadiah'}
          </p>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-(--theme-text)">
            {address}
          </p>
        </div>
      ) : null}

      {data.note ? (
        <p className="mt-5 text-center text-xs leading-relaxed text-(--theme-muted)">{data.note}</p>
      ) : null}
    </InvitationSection>
  )
}
