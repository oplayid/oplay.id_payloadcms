'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  InvitationStageContext,
  type InvitationStage,
} from '@/components/blocks/invitation/InvitationStage'

/**
 * Alur undangan satu URL dua tahap.
 *
 * Cover tampil penuh sebagai pintu masuk, lalu "Buka Undangan" membuka
 * halaman detail acara dengan transisi halus. Hash `#acara` dipakai sebagai
 * penanda tahap sehingga:
 * - tombol back browser kembali ke cover,
 * - tautan langsung `…/undangan/<tamu>#acara` membuka detail acara.
 *
 * Cover dan detail dirender oleh server (CanvasRenderer) lalu dikirim sebagai
 * slot, jadi tidak ada duplikasi query data tamu di client.
 */

const DETAIL_HASH = '#acara'

type HistoryState = {
  invitationStage?: InvitationStage
} | null

type Props = {
  cover: React.ReactNode
  detail: React.ReactNode
  /**
   * Tampilkan tombol kembali mengambang. Dimatikan bila halaman detail sudah
   * punya tombol kembali sendiri (mis. blok `EventHero`) agar tidak dobel.
   */
  showBackButton?: boolean
}

function readStage(): InvitationStage {
  const state = window.history.state as HistoryState
  if (state?.invitationStage === 'detail') return 'detail'
  if (window.location.hash === DETAIL_HASH) return 'detail'
  return 'cover'
}

export default function InvitationExperience({
  cover,
  detail,
  showBackButton = true,
}: Props) {
  const [stage, setStage] = useState<InvitationStage>('cover')
  const [reducedMotion, setReducedMotion] = useState(false)
  const detailRef = useRef<HTMLDivElement | null>(null)
  const pushedRef = useRef(false)

  // Sinkronkan tahap dengan riwayat/hash saat halaman dimuat.
  useEffect(() => {
    const next = readStage()
    setStage(next)
    pushedRef.current = false

    window.history.replaceState(
      { ...(window.history.state || {}), invitationStage: next },
      '',
      window.location.href,
    )
  }, [])

  // Back/forward browser atau perubahan hash manual.
  useEffect(() => {
    const sync = () => {
      const next = readStage()
      pushedRef.current = false
      setStage(next)
    }

    window.addEventListener('popstate', sync)
    window.addEventListener('hashchange', sync)
    return () => {
      window.removeEventListener('popstate', sync)
      window.removeEventListener('hashchange', sync)
    }
  }, [])

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(query.matches)

    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  // Cover mengunci scroll halaman; detail mengembalikan posisi ke atas.
  useEffect(() => {
    const root = document.documentElement
    if (stage === 'cover') {
      const previous = root.style.overflow
      root.style.overflow = 'hidden'
      return () => {
        root.style.overflow = previous
      }
    }

    root.style.overflow = ''
    window.scrollTo({ top: 0, behavior: 'auto' })
    const focusTimer = window.setTimeout(() => detailRef.current?.focus({ preventScroll: true }), 60)
    return () => window.clearTimeout(focusTimer)
  }, [stage])

  const open = useCallback(() => {
    if (stage === 'detail') return

    if (window.location.hash !== DETAIL_HASH) {
      window.history.pushState(
        { ...(window.history.state || {}), invitationStage: 'detail' },
        '',
        DETAIL_HASH,
      )
      pushedRef.current = true
    }

    setStage('detail')
  }, [stage])

  const close = useCallback(() => {
    if (stage === 'cover') return

    if (pushedRef.current) {
      // Kembali ke entri riwayat cover; `popstate` yang mengubah tahap.
      window.history.back()
      return
    }

    window.history.replaceState(
      { ...(window.history.state || {}), invitationStage: 'cover' },
      '',
      `${window.location.pathname}${window.location.search}`,
    )
    setStage('cover')
  }, [stage])

  // Escape dari detail kembali ke cover (kebiasaan dialog).
  useEffect(() => {
    if (stage !== 'detail') return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return
      // Dialog/lightbox punya Escape sendiri: jangan sekalian menutup undangan.
      if (document.querySelector('[role="dialog"]')) return
      close()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [stage, close])

  const motion = reducedMotion
    ? { transitionDuration: '0ms' }
    : { transitionDuration: stage === 'detail' ? '900ms' : '650ms' }

  return (
    <InvitationStageContext.Provider value={{ stage, open, close }}>
      <div className="relative w-full" data-invitation-stage={stage}>
        <div
          ref={detailRef}
          tabIndex={-1}
          aria-hidden={stage === 'cover'}
          inert={stage === 'cover'}
          style={motion}
          className={`relative w-full outline-none transition-[opacity,transform] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            stage === 'detail'
              ? 'translate-y-0 opacity-100'
              : 'pointer-events-none translate-y-6 opacity-0'
          }`}
        >
          {detail}
        </div>

        <div
          aria-hidden={stage === 'detail'}
          inert={stage === 'detail'}
          style={motion}
          className={`fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-(--theme-bg) transition-[opacity,transform] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            stage === 'detail'
              ? 'pointer-events-none scale-[1.015] opacity-0'
              : 'scale-100 opacity-100'
          }`}
        >
          {cover}
        </div>

        {stage === 'detail' && showBackButton ? (
          <button
            type="button"
            onClick={close}
            className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 border border-(--theme-border) bg-(--theme-surface)/90 px-3.5 py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-(--theme-muted) shadow-sm backdrop-blur transition hover:text-(--theme-text)"
            style={{ borderRadius: '999px' }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="h-3.5 w-3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 15 6-6 6 6" />
            </svg>
            Cover
          </button>
        ) : null}
      </div>
    </InvitationStageContext.Provider>
  )
}
