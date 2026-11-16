import React from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'
import type { RoutableContentData } from '@/lib/routableContent'
import { getRoutableListingPath } from '@/lib/routableCollections'
import { buildThemeVariables } from '@/lib/themeStyle'
import { mediaAlt, mediaSrcSet, mediaUrl, type MediaLike } from '@/lib/mediaUrl'
import { getServerURL, siteHref } from '@/lib/urls'
import { formatLongDate } from '@/lib/formatDate'

function countReadingMinutes(content: unknown): number | null {
  if (!content || typeof content !== 'object') return null

  try {
    const text = convertLexicalToPlaintext({ data: content as never })
    const words = text.split(/\s+/).filter(Boolean).length
    if (words === 0) return null
    return Math.max(1, Math.round(words / 200))
  } catch {
    return null
  }
}

function safeJsonLd(value: Record<string, unknown>): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

/**
 * Halaman detail artikel.
 *
 * Semua warna/typography memakai CSS variable tema tenant, jadi tampilannya
 * otomatis mengikuti tema yang dipilih.
 */
export default function ArticleDetail({ data }: { data: RoutableContentData }) {
  const doc = data.doc
  const locale = data.locale
  const title = String(doc.title || data.title || '')
  const excerpt = typeof doc.excerpt === 'string' ? doc.excerpt : null
  const author = typeof doc.author === 'string' ? doc.author : null
  const categories = Array.isArray(doc.categories)
    ? doc.categories.filter((item: unknown): item is string => typeof item === 'string')
    : []
  const cover = doc.cover as MediaLike
  const coverUrl = mediaUrl(cover, 'hero')
  const publishedAt = formatLongDate(doc.publishedAt as string | undefined, locale)
  const updatedAt = formatLongDate(doc.updatedAt as string | undefined, locale)
  const readingMinutes = countReadingMinutes(doc.content)
  const listingHref = siteHref(
    getRoutableListingPath(data.collection),
    data.basePath,
    locale,
  )

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: excerpt || data.meta.description || undefined,
    image: coverUrl ? [new URL(coverUrl, getServerURL()).toString()] : undefined,
    datePublished: (doc.publishedAt as string | undefined) || undefined,
    dateModified: (doc.updatedAt as string | undefined) || undefined,
    author: author ? { '@type': 'Person', name: author } : undefined,
    publisher: { '@type': 'Organization', name: data.tenant.name || 'OPLAY.ID' },
    mainEntityOfPage: data.canonicalURL,
    inLanguage: locale,
  }

  return (
    <main
      style={buildThemeVariables(data.theme)}
      className="w-full min-h-screen bg-(--theme-bg) text-(--theme-text) pt-16 md:pt-28 pb-20 transition-colors duration-300"
    >
      <article className="mx-auto w-full max-w-3xl px-4 md:px-6">
        <a
          href={listingHref}
          className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-(--theme-muted) hover:text-(--theme-primary) transition-colors"
        >
          <span aria-hidden="true">←</span>
          Semua {data.config.label.toLowerCase()}
        </a>

        <header className="mt-6">
          {categories.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map((category) => (
                <span
                  key={category}
                  style={{ borderRadius: 'var(--theme-radius-btn)' }}
                  className="px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-(--theme-muted) bg-white/5 border border-(--theme-border)"
                >
                  {category}
                </span>
              ))}
            </div>
          ) : null}

          <h1 className="font-heading text-3xl md:text-5xl font-semibold tracking-tight">
            {title}
          </h1>

          {excerpt ? (
            <p className="font-sub text-sm md:text-base text-(--theme-muted) mt-4 font-light">
              {excerpt}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-5 text-xs text-(--theme-muted)">
            {author ? <span className="font-medium text-(--theme-text)">{author}</span> : null}
            {author && publishedAt ? <span aria-hidden="true">·</span> : null}
            {publishedAt ? (
              <time dateTime={doc.publishedAt as string}>{publishedAt}</time>
            ) : null}
            {readingMinutes ? (
              <>
                <span aria-hidden="true">·</span>
                <span>{readingMinutes} menit baca</span>
              </>
            ) : null}
          </div>
        </header>

        {coverUrl ? (
          <figure className="mt-8">
            <img
              src={coverUrl}
              srcSet={mediaSrcSet(cover, ['hero', 'card'])}
              alt={mediaAlt(cover, title)}
              className="w-full h-auto object-cover"
              style={{ borderRadius: 'var(--theme-radius-box)' }}
            />
          </figure>
        ) : null}

        {doc.content ? (
          <div className="article-body mt-10">
            <RichText data={doc.content as never} />
          </div>
        ) : (
          <p className="mt-10 text-sm text-(--theme-muted)">Isi artikel belum tersedia.</p>
        )}

        {updatedAt && updatedAt !== publishedAt ? (
          <p className="mt-10 text-xs text-(--theme-muted)">
            Diperbarui {updatedAt}
          </p>
        ) : null}
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
    </main>
  )
}
