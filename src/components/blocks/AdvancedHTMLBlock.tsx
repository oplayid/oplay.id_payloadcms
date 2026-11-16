'use client'

import React, { useEffect, useRef } from 'react'

type AdvancedHTMLData = {
  html?: string | null
  css?: string | null
  js?: string | null
}

/**
 * Blok HTML/CSS/JS mentah (khusus superadmin).
 *
 * Script tidak dijalankan lewat innerHTML (browser tidak mengeksekusi script
 * hasil innerHTML), jadi JS dibuat sebagai elemen <script> terpisah.
 */
export default function AdvancedHTMLBlock({ data }: { data: AdvancedHTMLData }) {
  const html = data?.html || ''
  const css = data?.css || ''
  const js = data?.js || ''
  const scriptRef = useRef<HTMLScriptElement | null>(null)

  useEffect(() => {
    if (!js) return

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.text = js
    script.setAttribute('data-advanced-html', '')
    document.body.appendChild(script)
    scriptRef.current = script

    return () => {
      script.remove()
      scriptRef.current = null
    }
  }, [js])

  return (
    <div className="w-full" data-block="AdvancedHTML">
      {css ? <style data-advanced-html dangerouslySetInnerHTML={{ __html: css }} /> : null}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
