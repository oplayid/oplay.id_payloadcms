'use client'

import { useEffect } from 'react'

/**
 * Menyuntikkan CSS/JS kustom milik tenant (khusus superadmin).
 *
 * JS dibuat sebagai elemen <script> terpisah karena script hasil innerHTML
 * tidak dieksekusi browser.
 */
export default function CodeInjection({ css, js }: { css?: string; js?: string }) {
  useEffect(() => {
    if (!js) return

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.text = js
    script.setAttribute('data-tenant-code', '')
    document.body.appendChild(script)

    return () => {
      script.remove()
    }
  }, [js])

  if (!css) return null

  return <style data-tenant-code dangerouslySetInnerHTML={{ __html: css }} />
}
