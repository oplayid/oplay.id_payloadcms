'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * SSR live preview: iframe menerima postMessage dari Payload setiap kali
 * dokumen disimpan/autosave. router.refresh() mengambil ulang data server.
 */
export function LivePreviewListener() {
  const router = useRouter()

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const type = event.data?.type
      if (type === 'payload-document-event') {
        router.refresh()
      }
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [router])

  return null
}
