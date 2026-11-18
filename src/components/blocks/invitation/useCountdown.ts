'use client'

import { useEffect, useState } from 'react'

export type CountdownValue = {
  days: number
  hours: number
  minutes: number
  seconds: number
  /** True setelah waktu target terlewati. */
  finished: boolean
}

/**
 * Hitung mundur ke tanggal acara.
 *
 * Nilai awal `null` sampai komponen ter-mount supaya markup server dan client
 * identik (tidak ada hydration mismatch karena jam yang berbeda).
 */
export function useCountdown(target: string | null | undefined): CountdownValue | null {
  const [remaining, setRemaining] = useState<CountdownValue | null>(null)

  useEffect(() => {
    if (!target) return
    const targetTime = new Date(target).getTime()
    if (Number.isNaN(targetTime)) return

    const tick = () => {
      const diff = targetTime - Date.now()
      if (diff <= 0) {
        setRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, finished: true })
        return
      }

      setRemaining({
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1000),
        finished: false,
      })
    }

    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [target])

  return remaining
}

export function countdownUnits(value: CountdownValue, locale: 'id' | 'en') {
  return [
    { key: 'days', label: locale === 'en' ? 'Days' : 'Hari', value: value.days },
    { key: 'hours', label: locale === 'en' ? 'Hours' : 'Jam', value: value.hours },
    { key: 'minutes', label: locale === 'en' ? 'Minutes' : 'Menit', value: value.minutes },
    { key: 'seconds', label: locale === 'en' ? 'Seconds' : 'Detik', value: value.seconds },
  ]
}
