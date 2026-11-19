'use client'

import { useEffect } from 'react'

/** Dedupe untuk Strict Mode: dua effect awal tidak boleh mengirim dua request. */
const inFlight = new Set<string>()

/**
 * Mencatat kunjungan undangan sekali per sesi browser.
 *
 * Tidak boleh mengganggu tampilan: semua error diabaikan. Penanda sessionStorage
 * hanya ditulis setelah server mengonfirmasi, supaya request yang gagal tidak
 * membuat kunjungan berikutnya terlewat.
 */
export default function InvitationViewTracker({
  invitationKey,
  enabled,
}: {
  invitationKey: string
  enabled: boolean
}) {
  useEffect(() => {
    if (!enabled || !invitationKey || inFlight.has(invitationKey)) return

    const storageKey = `invitation-viewed:${invitationKey}`
    try {
      if (window.sessionStorage.getItem(storageKey)) return
    } catch {
      // Mode privasi / storage diblokir: tetap kirim, server yang menahan.
    }

    inFlight.add(invitationKey)

    fetch('/api/invitations/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: invitationKey, path: window.location.pathname }),
      keepalive: true,
    })
      .then((response) => {
        if (!response.ok) return
        try {
          window.sessionStorage.setItem(storageKey, '1')
        } catch {
          // Abaikan bila storage tidak tersedia.
        }
      })
      .catch(() => {
        // Statistik kunjungan bersifat opsional.
      })
      .finally(() => {
        inFlight.delete(invitationKey)
      })
  }, [enabled, invitationKey])

  return null
}
