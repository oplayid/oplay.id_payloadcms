import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Syne, Inter } from 'next/font/google'
// Nanti fungsi getThemeData ini bisa diarahkan ke Payload CMS / tetap pakai helper lama Anda
import { getThemeData } from '@/lib/getTheme'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-syne',
})

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'oplay.id - Autonomous Legal Tech & AI Ecosystem',
  description: 'Platform AI hukum profesional berstandar enterprise.',
}

type Props = {
  children: React.ReactNode
  // Di level root layout, params opsional atau dikosongkan
  // karena parameter lang & slug ditangkap di level [lang]/page.tsx
}

export default async function RootLayout({ children }: Props) {
  const [theme, headersList] = await Promise.all([
    getThemeData('default-theme'),
    headers(),
  ])
  const locale = headersList.get('x-locale') === 'en' ? 'en' : 'id'

  const colors = theme?.colors || {}
  const fonts = theme?.fonts || {}
  const effects = theme?.effects || {}

  const themeStyle = theme
    ? ({
        '--theme-bg': colors.bg,
        '--theme-surface': colors.surface,
        '--theme-elevated': colors.elevated,
        '--theme-border': colors.border,
        '--theme-border-hover': colors['border-hover'],
        '--theme-text': colors.text,
        '--theme-muted': colors.muted,
        '--theme-inverse': colors.inverse,
        '--theme-primary': colors.primary,
        '--theme-primary-hover': colors['primary-hover'],
        '--theme-primary-text': colors['primary-text'],
        '--theme-accent': colors.accent,
        '--theme-accent-hover': colors['accent-hover'],
        '--theme-success': colors.success,
        '--theme-warning': colors.warning,
        '--theme-danger': colors.danger,
        '--theme-info': colors.info,
        '--theme-font-heading': 'var(--font-syne), sans-serif',
        '--theme-font-body': 'var(--font-inter), sans-serif',
        '--theme-radius-box': effects['radius-box'],
        '--theme-radius-btn': effects['radius-btn'],
        '--theme-shadow': effects.shadow,
      } as React.CSSProperties)
    : {}

  return (
    <html lang={locale} className={`${syne.variable} ${inter.variable}`} data-scroll-behavior="smooth">
      <head />
      <body style={themeStyle} className="font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
