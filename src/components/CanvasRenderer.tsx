import React from 'react'
import { siteHref, type Locale } from '@/lib/urls'
import { buildThemeVariables } from '@/lib/themeStyle'
import type { InvitationBlockContext } from '@/lib/invitationContext'

/** Konteks situs yang diteruskan ke setiap blok. */
export type BlockSiteContext = {
  tenantID: string
  basePath: string
  locale: Locale
}

export type BlockComponent = React.ComponentType<any>

export type CanvasLayoutData = {
  themePreset?: string
  theme?: any
  canvasBlocks?: Array<any>
  basePath?: string
  locale?: Locale
  layoutMode?: 'inherit' | 'canvas' | 'bare'
  tenantID?: string
  invitation?: InvitationBlockContext
}

export type CanvasRendererProps = {
  layoutData?: CanvasLayoutData
  /**
   * Elemen akar kanvas. Undangan menaruh dua kanvas bersarang (cover + detail),
   * jadi memakai `div` agar tidak ada dua `<main>` dalam satu halaman.
   */
  rootElement?: 'main' | 'div'
  /** Hilangkan padding atas/bawah (dipakai cover layar penuh). */
  bare?: boolean
  /** Peta tipe blok -> komponen yang dipakai untuk merender. */
  components: Record<string, BlockComponent>
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
  components,
}: CanvasRendererProps) {
  const componentRegistry = components

  const theme = layoutData.theme || {}
  const dynamicThemeStyle = buildThemeVariables(theme)

  const containerClass = theme.layout?.containerClass || 'w-full max-w-5xl space-y-6'
  const layoutMode = layoutData.layoutMode || 'inherit'
  const topPadding = bare ? '' : layoutMode === 'bare' ? 'pt-0' : 'pt-16 md:pt-28'
  const bottomPadding = bare ? '' : 'pb-12'
  const Root = rootElement
  const canvasBlocks = localizeBlockHrefs(
    layoutData.canvasBlocks || [],
    layoutData.basePath || '',
    layoutData.locale || 'id',
  )

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
        const blockType = block.blockType || block.type
        const ComponentToRender = componentRegistry[blockType]

        if (!ComponentToRender) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn(
              `Komponen dengan tipe "${blockType}" belum terdaftar di componentRegistry!`,
            )
          }
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

        const componentData = block.data || block.props || block

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
