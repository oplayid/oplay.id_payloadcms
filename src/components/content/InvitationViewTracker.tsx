'use client'

import { useEffect } from 'react'

/**
 * Mencatat kunjungan undangan sekali per sesi browser.
 *
 * Tidak boleh mengganggu tampilan: semua error diabaikan dan pemanggilan
 * dilakukan setelah halaman selesai dirender.
 */
export default function InvitationViewTracker({
  invitationKey,
  enabled,
}: {
  invitationKey: string
  enabled: boolean
}) {
  useEffect(() => {
    if (!enabled || !invitationKey) return

    const storageKey = `invitation-viewed:${invitationKey}`
    try {
      if (window.sessionStorage.getItem(storageKey)) return
      window.sessionStorage.setItem(storageKey, '1')
    } catch {
      // Mode privasi / storage diblokir: tetap kirim, server yang menahan.
    }

    const controller = new AbortController()
    fetch('/api/invitations/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: invitationKey, path: window.location.pathname }),
      signal: controller.signal,
      keepalive: true,
    }).catch(() => {
      // Statistik kunjungan bersifat opsional.
    })

    return () => controller.abort()
  }, [enabled, invitationKey])

  return null
}
