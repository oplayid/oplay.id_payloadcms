'use client'

import { useEffect, useMemo, useState } from 'react'
import { useLivePreview } from '@payloadcms/live-preview-react'
import CanvasRenderer from '@/components/CanvasRenderer'
import SiteShell from '@/components/SiteShell'
import { getComponentRegistryClientMap } from '@/components/componentRegistryClient'
import type { Page } from '@/payload-types'
import type { LayoutMode, PageLayoutData } from '@/lib/pageBuilder'
import { getServerURL } from '@/lib/urls'

type ThemePresetRef = Page['themePreset']
type ThemeData = Record<string, unknown>

function themePresetValue(ref: ThemePresetRef): string | null {
  if (!ref) return null
  if (typeof ref === 'string') return ref
  if (typeof ref === 'object' && 'id' in ref && ref.id) return String(ref.id)
  return null
}

function themePresetKey(ref: ThemePresetRef): string | null {
  return themePresetValue(ref)
}

async function fetchThemeData(preset: string, serverURL: string): Promise<ThemeData | null> {
  const base = serverURL.replace(/\/+$/, '')

  try {
    const byID = await fetch(`${base}/api/themes/${encodeURIComponent(preset)}?depth=0`, {
      credentials: 'include',
    })
    if (byID.ok) {
      const doc = (await byID.json()) as { themeData?: ThemeData | null }
      if (doc?.themeData) return doc.themeData
    }
  } catch {
    // lanjut ke query
  }

  try {
    const query = new URLSearchParams({
      depth: '0',
      limit: '1',
      'where[or][0][slug][equals]': preset,
      'where[or][1][id][equals]': preset,
    })
    const res = await fetch(`${base}/api/themes?${query.toString()}`, {
      credentials: 'include',
    })
    if (!res.ok) return null
    const json = (await res.json()) as { docs?: Array<{ themeData?: ThemeData | null }> }
    return json.docs?.[0]?.themeData || null
  } catch {
    return null
  }
}

function computeLayoutMode(livePage: Page, initial: PageLayoutData): LayoutMode {
  const pageMode = (livePage as Page & { layoutMode?: LayoutMode | null }).layoutMode
  if (pageMode) return pageMode

  const tenantDefault = (initial.tenant as typeof initial.tenant & {
    defaultLayoutMode?: LayoutMode | null
  }).defaultLayoutMode
  if (tenantDefault) return tenantDefault

  return initial.tenant.type === 'platform' ? 'canvas' : 'inherit'
}

/**
 * Renderer halaman Pages untuk mode Live Preview (resmi: @payloadcms/live-preview-react).
 *
 * Menggabungkan data server (tema ter-resolve, chrome, konteks situs) dengan
 * data dokumen Page yang diperbarui realtime dari form admin (tanpa menunggu save).
 */
export default function PageLivePreview({ initialData }: { initialData: PageLayoutData }) {
  const serverURL = getServerURL()

  const { data: livePage } = useLivePreview<Page>({
    apiRoute: '/api',
    depth: 2,
    initialData: initialData.page,
    serverURL,
  })

  // Tema hasil fetch ketika preset diganti dari nilai awal dokumen.
  const [fetchedTheme, setFetchedTheme] = useState<{ key: string; theme: ThemeData } | null>(
    null,
  )

  const initialPresetKey = useMemo(
    () => themePresetKey(initialData.page.themePreset),
    [initialData.page.themePreset],
  )

  const tenantPreset =
    (initialData.tenant as typeof initialData.tenant & { themePreset?: string | null }).themePreset ||
    'default-theme'
  const livePreset = themePresetValue(livePage.themePreset)
  const effectivePreset = livePreset || tenantPreset
  const effectivePresetKey = themePresetKey(livePage.themePreset) ?? tenantPreset

  useEffect(() => {
    if (effectivePresetKey === initialPresetKey) return

    let active = true
    fetchThemeData(effectivePreset, serverURL).then((themeData) => {
      if (active && themeData) {
        setFetchedTheme({ key: effectivePresetKey, theme: themeData })
      }
    })

    return () => {
      active = false
    }
  }, [effectivePreset, effectivePresetKey, initialPresetKey, serverURL])

  const liveTheme =
    effectivePresetKey === initialPresetKey
      ? initialData.theme
      : fetchedTheme?.key === effectivePresetKey
        ? fetchedTheme.theme
        : initialData.theme

  const liveCanvas = (livePage as Page & { canvasBlocks?: unknown }).canvasBlocks
  const canvasBlocks = Array.isArray(liveCanvas) ? liveCanvas : []

  const merged: PageLayoutData = {
    ...initialData,
    page: livePage,
    title: livePage.title || initialData.title,
    layoutMode: computeLayoutMode(livePage, initialData),
    canvasBlocks,
    theme: liveTheme as PageLayoutData['theme'],
  }

  const components = useMemo(() => getComponentRegistryClientMap(), [])

  return (
    <SiteShell
      chrome={initialData.chrome}
      layoutMode={merged.layoutMode}
      basePath={initialData.basePath}
      locale={initialData.locale}
      theme={liveTheme as PageLayoutData['theme']}
      isPreview
    >
      <CanvasRenderer layoutData={merged} components={components} />
    </SiteShell>
  )
}

