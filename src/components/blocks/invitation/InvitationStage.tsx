'use client'

import { createContext, useContext } from 'react'

/**
 * Tahap undangan: cover sebagai pintu masuk, lalu halaman detail acara.
 *
 * Satu URL, dua tahap. Blok di dalam cover memanggil `open()`, sedangkan
 * tombol "kembali ke cover" (atau tombol back browser) memanggil `close()`.
 */
export type InvitationStage = 'cover' | 'detail'

export type InvitationStageValue = {
  stage: InvitationStage
  /** Buka detail acara (menambah riwayat browser + hash `#acara`). */
  open: () => void
  /** Kembali ke cover. */
  close: () => void
}

export const InvitationStageContext = createContext<InvitationStageValue | null>(null)

/**
 * `null` berarti blok sedang dirender di halaman biasa (bukan URL tamu),
 * sehingga cover memakai perilaku lama: menggulir ke blok berikutnya.
 */
export function useInvitationStage(): InvitationStageValue | null {
  return useContext(InvitationStageContext)
}
