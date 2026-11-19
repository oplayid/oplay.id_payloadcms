import type { CSSProperties, ReactNode } from 'react'
import { buildThemeVariables } from '@/lib/themeStyle'
import type { LayoutMode } from '@/lib/pageBuilder'
import type { SiteChrome } from '@/lib/siteChrome'
import type { Locale } from '@/lib/urls'
import CodeInjection from './CodeInjection'
import { LivePreviewListener } from './LivePreviewListener'
import { SiteProvider } from './SiteProvider'
import FooterBlock from './blocks/FooterBlock'
import NavbarBlock from './blocks/NavbarBlock'

type SiteShellProps = {
  chrome: SiteChrome
  layoutMode: LayoutMode
  basePath: string
  locale: Locale
  isPreview: boolean
  /** Tema aktif tenant, supaya navbar/footer ikut tema konten. */
  theme?: Record<string, any>
  children: ReactNode
}

/**
 * Bingkai situs bersama: navbar, footer, code injection, dan konteks base path.
 *
 * Dipakai halaman biasa maupun detail konten (artikel) agar chrome tenant
 * konsisten di semua jenis URL.
 */
export default function SiteShell({
  chrome,
  layoutMode,
  basePath,
  locale,
  isPreview,
  theme,
  children,
}: SiteShellProps) {
  const useSiteChrome = layoutMode === 'inherit'
  const themeStyle = buildThemeVariables(theme) as CSSProperties

  return (
    <SiteProvider value={{ basePath, locale }}>
      {/* CanvasRenderer hanya menimpa --theme-* di dalam <main>. Bungkus juga
          chrome di sini agar navbar/footer memakai tema tenant yang sama. */}
      <div style={themeStyle} className="contents">
        {isPreview ? <LivePreviewListener /> : null}
        {useSiteChrome && chrome.navigation ? (
          <NavbarBlock data={chrome.navigation} />
        ) : null}
        {children}
        {useSiteChrome && chrome.footer ? (
          <FooterBlock data={chrome.footer} />
        ) : null}
        <CodeInjection css={chrome.codeInjection.css} js={chrome.codeInjection.js} />
      </div>
    </SiteProvider>
  )
}
