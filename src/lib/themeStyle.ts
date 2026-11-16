import type { CSSProperties } from 'react'

export type ThemeLike =
  | {
      colors?: Record<string, string | null | undefined> | null
      fonts?: Record<string, string | null | undefined> | null
      effects?: Record<string, string | null | undefined> | null
    }
  | null
  | undefined

/**
 * Mengubah dokumen tema Payload menjadi CSS variable `--theme-*`.
 *
 * Dipakai bersama oleh `CanvasRenderer` (halaman blok) dan renderer konten
 * (mis. detail artikel) agar semua section memakai tema tenant yang sama.
 */
export function buildThemeVariables(theme: ThemeLike): CSSProperties {
  const colors = theme?.colors || {}
  const fonts = theme?.fonts || {}
  const effects = theme?.effects || {}

  return {
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
  } as CSSProperties
}
