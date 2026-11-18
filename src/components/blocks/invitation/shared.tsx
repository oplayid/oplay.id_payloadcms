import type { ReactNode } from 'react'
import type { InvitationBlockContext } from '@/lib/invitationContext'

export type InvitationBlockProps<Data> = {
  data: Data
  themeLayout?: string
  siteContext?: unknown
  invitationContext?: InvitationBlockContext
}

/** Bagian undangan dengan lebar baca yang nyaman. */
export function InvitationSection({
  children,
  className = '',
  id,
}: {
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    <section id={id} className={`w-full py-12 md:py-16 ${className}`}>
      <div className="w-full max-w-3xl mx-auto px-5 md:px-8">{children}</div>
    </section>
  )
}

/**
 * Ukuran judul undangan ditulis inline karena `globals.css` memasang aturan
 * elemen `h1`/`h2` (clamp kecil untuk halaman biasa) yang menang atas kelas
 * Tailwind. Undangan butuh judul display yang lebih besar dan tegas.
 */
export function invitationDisplay(kind: 'section' | 'hero' | 'cover' = 'section') {
  const sizes = {
    section: { fontSize: 'clamp(1.5rem, 4.5vw, 2.1rem)', lineHeight: 1.15 },
    hero: { fontSize: 'clamp(2.15rem, 7vw, 3.75rem)', lineHeight: 1.05 },
    cover: { fontSize: 'clamp(2.05rem, 8.5vw, 3.5rem)', lineHeight: 1.08 },
  }

  return {
    fontFamily: 'var(--theme-font-heading)',
    letterSpacing: '-0.015em',
    ...sizes[kind],
  } as const
}

export function SectionHeading({
  badge,
  title,
  subtitle,
}: {
  badge?: string | null
  title?: string | null
  subtitle?: string | null
}) {
  if (!badge && !title && !subtitle) return null

  return (
    <div className="mb-8 text-center">
      {badge ? (
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.3em] text-(--theme-muted)">
          {badge}
        </p>
      ) : null}
      {title ? (
        <h2 className="font-semibold" style={invitationDisplay('section')}>
          {title}
        </h2>
      ) : null}
      {subtitle ? (
        <p className="mt-3 text-sm md:text-base leading-relaxed text-(--theme-muted)">{subtitle}</p>
      ) : null}
    </div>
  )
}

/** Dipakai saat blok undangan ditaruh di halaman biasa (bukan URL tamu). */
export function InvitationOnlyNotice() {
  return (
    <InvitationSection>
      <div
        className="border border-dashed border-(--theme-border) px-5 py-6 text-center text-sm text-(--theme-muted)"
        style={{ borderRadius: 'var(--theme-radius-box)' }}
      >
        Blok undangan hanya tampil di URL tamu <code>/undangan/&lt;nama-tamu&gt;-&lt;kode&gt;</code>.
      </div>
    </InvitationSection>
  )
}

export function formatPaxCount(pax: number, locale: InvitationBlockContext['locale']): string {
  return locale === 'en' ? `${pax} guest${pax > 1 ? 's' : ''}` : `${pax} orang`
}
