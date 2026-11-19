'use client'

import { useEffect } from 'react'

/**
 * Error boundary untuk seluruh halaman frontend. Tanpa ini, exception pada
 * blok atau query Payload jatuh ke halaman error generik Next.js yang tidak
 * mengikuti tema tenant.
 */
export default function FrontendError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Sengaja tidak mengirim ke vendor monitoring; nyalakan bila Sentry/OTel
    // sudah terpasang. console.error tetap berguna untuk debugging server.
    console.error('Frontend render error:', error)
  }, [error])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-(--theme-bg) px-6 text-center text-(--theme-text)">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-(--theme-muted)">Error</p>
      <h1 className="font-heading text-3xl font-semibold">Halaman tidak dapat ditampilkan</h1>
      <p className="max-w-md text-sm text-(--theme-muted)">
        Terjadi kendala saat memuat konten. Silakan coba lagi; bila masalah berlanjut, hubungi
        pengelola situs.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 rounded-full border border-(--theme-border) px-5 py-2 text-sm font-medium hover:bg-(--theme-surface)"
      >
        Coba lagi
      </button>
    </main>
  )
}
