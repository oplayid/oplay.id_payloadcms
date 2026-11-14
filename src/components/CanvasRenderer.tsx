import React from 'react'
import { getComponentRegistryMap } from './componentRegistry'
import { siteHref, type Locale } from '@/lib/urls'

type CanvasRendererProps = {
  layoutData?: {
    themePreset?: string
    theme?: any // Bisa menerima objek tema langsung jika di-resolve di atas
    canvasBlocks?: Array<any>
    basePath?: string
    locale?: Locale
  }
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

export default function CanvasRenderer({ layoutData = {} }: CanvasRendererProps) {
  const componentRegistry = getComponentRegistryMap()

  // Mendukung tema dari objek langsung ATAU dari preset string Payload
  const theme = layoutData.theme || {}
  const colors = theme.colors || {}
  const fonts = theme.fonts || {}
  const effects = theme.effects || {}

  const dynamicThemeStyle = {
    ...(colors.bg ? { '--theme-bg': colors.bg } : {}),
    ...(colors.surface ? { '--theme-surface': colors.surface } : {}),
    ...(colors.elevated ? { '--theme-elevated': colors.elevated } : {}),
    ...(colors.border ? { '--theme-border': colors.border } : {}),
    ...(colors['border-hover'] ? { '--theme-border-hover': colors['border-hover'] } : {}),
    ...(colors.text ? { '--theme-text': colors.text } : {}),
    ...(colors.muted ? { '--theme-muted': colors.muted } : {}),
    ...(colors.inverse ? { '--theme-inverse': colors.inverse } : {}),
    ...(colors.primary ? { '--theme-primary': colors.primary } : {}),
    ...(colors['primary-hover'] ? { '--theme-primary-hover': colors['primary-hover'] } : {}),
    ...(colors['primary-text'] ? { '--theme-primary-text': colors['primary-text'] } : {}),
    ...(colors.accent ? { '--theme-accent': colors.accent } : {}),
    ...(colors['accent-hover'] ? { '--theme-accent-hover': colors['accent-hover'] } : {}),
    ...(colors.success ? { '--theme-success': colors.success } : {}),
    ...(colors.warning ? { '--theme-warning': colors.warning } : {}),
    ...(colors.danger ? { '--theme-danger': colors.danger } : {}),
    ...(colors.info ? { '--theme-info': colors.info } : {}),
    ...(fonts.heading ? { '--theme-font-heading': fonts.heading } : {}),
    ...(fonts.sub ? { '--theme-font-sub': fonts.sub } : {}),
    ...(fonts.body ? { '--theme-font-body': fonts.body } : {}),
    ...(effects['radius-box'] ? { '--theme-radius-box': effects['radius-box'] } : {}),
    ...(effects['radius-btn'] ? { '--theme-radius-btn': effects['radius-btn'] } : {}),
    ...(effects.shadow ? { '--theme-shadow': effects.shadow } : {}),
  } as React.CSSProperties

  const containerClass = theme.layout?.containerClass || 'w-full max-w-5xl space-y-6'
  const canvasBlocks = localizeBlockHrefs(
    layoutData.canvasBlocks || [],
    layoutData.basePath || '',
    layoutData.locale || 'id',
  )

  return (
    <main
      style={
        {
          ...dynamicThemeStyle,
          containerType: 'inline-size',
          containerName: 'canvas_viewport',
        } as React.CSSProperties
      }
      className="w-full max-w-full box-border bg-(--theme-bg) text-(--theme-text) flex flex-col items-center pt-16 md:pt-28 pb-12 transition-colors duration-300 overflow-x-hidden"
    >
      {canvasBlocks.map((block: any, index: number) => {
        // Payload CMS menggunakan block.blockType, kita berikan fallback ke block.type
        const blockType = block.blockType || block.type
        const ComponentToRender = componentRegistry[blockType]

        if (!ComponentToRender) {
          console.warn(`Komponen dengan tipe "${blockType}" belum terdaftar di componentRegistry!`)
          return null
        }

        const isHero = blockType === 'HeroBanner' || blockType === 'Hero'
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
            />
          </div>
        )
      })}
    </main>
  )
}
