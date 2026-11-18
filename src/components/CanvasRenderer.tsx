import React from 'react'
import { getComponentRegistryMap } from './componentRegistry'
import { siteHref, type Locale } from '@/lib/urls'
import { buildThemeVariables } from '@/lib/themeStyle'
import type { InvitationBlockContext } from '@/lib/invitationContext'

/** Konteks situs yang diteruskan ke setiap blok. */
export type BlockSiteContext = {
  tenantID: string
  basePath: string
  locale: Locale
}

type CanvasRendererProps = {
  layoutData?: {
    themePreset?: string
    theme?: any // Bisa menerima objek tema langsung jika di-resolve di atas
    canvasBlocks?: Array<any>
    basePath?: string
    locale?: Locale
    layoutMode?: 'inherit' | 'canvas' | 'bare'
    /** ID tenant, dibutuhkan blok yang mengambil data dari koleksi lain. */
    tenantID?: string
    /** Data tamu/acara; hanya diisi saat merender URL undangan. */
    invitation?: InvitationBlockContext
  }
  /**
   * Elemen akar kanvas. Undangan menaruh dua kanvas bersarang (cover + detail),
   * jadi memakai `div` agar tidak ada dua `<main>` dalam satu halaman.
   */
  rootElement?: 'main' | 'div'
  /** Hilangkan padding atas/bawah (dipakai cover layar penuh). */
  bare?: boolean
}

/**
 * Menulis ulang href internal agar tetap berada di dalam site tenant.
 * Contoh: /profil pada site faishal menjadi /faishal/profil.
 */
function localizeBlockHrefs(value: any, basePath: string, locale: Locale): any {
  if (Array.isArray(value)) {
    return value.map((item) => localizeBlockHrefs(item, basePath, locale))
  }

  if (!value || typeof value !== 'object') return value

  const result: Record<string, any> = {}
  for (const [key, child] of Object.entries(value)) {
    if (typeof child === 'string' && (key === 'href' || key.endsWith('Href'))) {
      result[key] = siteHref(child, basePath, locale)
    } else {
      result[key] = localizeBlockHrefs(child, basePath, locale)
    }
  }

  return result
}

export default function CanvasRenderer({
  layoutData = {},
  rootElement = 'main',
  bare = false,
}: CanvasRendererProps) {
  const componentRegistry = getComponentRegistryMap()

  // Mendukung tema dari objek langsung ATAU dari preset string Payload
  const theme = layoutData.theme || {}
  const dynamicThemeStyle = buildThemeVariables(theme)

  const containerClass = theme.layout?.containerClass || 'w-full max-w-5xl space-y-6'
  const layoutMode = layoutData.layoutMode || 'inherit'
  // 'bare' tidak punya navbar, jadi tidak perlu ruang di atas.
  const topPadding = bare ? '' : layoutMode === 'bare' ? 'pt-0' : 'pt-16 md:pt-28'
  const bottomPadding = bare ? '' : 'pb-12'
  const Root = rootElement
  const canvasBlocks = localizeBlockHrefs(
    layoutData.canvasBlocks || [],
    layoutData.basePath || '',
    layoutData.locale || 'id',
  )

  // Diteruskan ke blok yang perlu query data tenant (mis. Daftar Artikel).
  const siteContext: BlockSiteContext | undefined = layoutData.tenantID
    ? {
        tenantID: layoutData.tenantID,
        basePath: layoutData.basePath || '',
        locale: layoutData.locale || 'id',
      }
    : undefined

  return (
    <Root
      style={
        {
          ...dynamicThemeStyle,
          containerType: 'inline-size',
          containerName: 'canvas_viewport',
        } as React.CSSProperties
      }
      className={`w-full max-w-full box-border bg-(--theme-bg) text-(--theme-text) flex flex-col items-center ${topPadding} ${bottomPadding} transition-colors duration-300 overflow-x-hidden`}
    >
      {canvasBlocks.map((block: any, index: number) => {
        // Payload CMS menggunakan block.blockType, kita berikan fallback ke block.type
        const blockType = block.blockType || block.type
        const ComponentToRender = componentRegistry[blockType]

        if (!ComponentToRender) {
          console.warn(`Komponen dengan tipe "${blockType}" belum terdaftar di componentRegistry!`)
          return null
        }

        const isHero =
          blockType === 'HeroBanner' ||
          blockType === 'Hero' ||
          blockType === 'EventHero' ||
          blockType === 'AdvancedHTML' ||
          blockType === 'InvitationCover'
        const scrollStyle = { scrollMarginTop: '120px' }
        const blockThemeLayout =
          block.themeLayout ||
          block.props?.themeLayout ||
          theme.layout?.sectionContainerClass ||
          'w-full max-w-6xl mx-auto'

        // Mengambil data dari Payload (bisa dari block.data, block.props, atau langsung dari field block itu sendiri)
        const componentData = block.data || block.props || block

        // JIKA HERO: Render secara mentah menyesuaikan lebar bingkai perangkat
        if (isHero) {
          return (
            <div
              key={block.id || `${blockType}-${index}`}
              id={block.id}
              style={scrollStyle}
              className="w-full max-w-full relative box-border"
            >
              <ComponentToRender
                data={{
                  ...componentData,
                  variant: componentData.variant || block.variant,
                }}
                themeLayout={blockThemeLayout}
                siteContext={siteContext}
                invitationContext={layoutData.invitation}
              />
            </div>
          )
        }

        // JIKA BUKAN HERO: Bungkus dengan pengaman box-border & padding aman untuk mobile/desktop
        return (
          <div
            key={block.id || `${blockType}-${index}`}
            id={block.id}
            style={scrollStyle}
            className={`w-full max-w-full ${containerClass} px-4 md:px-12 flex flex-col box-border`}
          >
            <ComponentToRender
              data={{
                ...componentData,
                variant: componentData.variant || block.variant,
              }}
              themeLayout={blockThemeLayout}
              siteContext={siteContext}
              invitationContext={layoutData.invitation}
            />
          </div>
        )
      })}
    </Root>
  )
}
