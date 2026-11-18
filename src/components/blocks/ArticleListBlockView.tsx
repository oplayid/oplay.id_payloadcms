'use client'

import React, { useEffect, useMemo, useState } from 'react'
import type { BlockSiteContext } from '@/components/CanvasRenderer'
import Container from '@/components/ui/Container'
import { formatLongDate } from '@/lib/formatDate'
import { mediaAlt, mediaSrcSet, mediaUrl } from '@/lib/mediaUrl'
import { getRoutablePath } from '@/lib/routableCollections'
import { siteHref } from '@/lib/urls'

type ArticleItem = {
  id?: string
  title?: string
  slug?: string
  excerpt?: string | null
  cover?: unknown
  publishedAt?: string | null
  categories?: string[] | null
}

export type ArticleListData = {
  variant?: string
  sectionBadge?: string
  sectionTitle?: string
  sectionSubtitle?: string
  source?: 'latest' | 'manual' | 'category'
  posts?: Array<string | { id?: string }> | null
  category?: string | null
  limit?: number | null
  showCover?: boolean | null
  showExcerpt?: boolean | null
  showDate?: boolean | null
  emptyMessage?: string | null
}

type Props = {
  data: ArticleListData
  themeLayout?: string
  siteContext?: BlockSiteContext
  /** Artikel hasil fetch server (SSR). Bila kosong/undefined, komponen fetch client-side. */
  articles?: ArticleItem[]
}

function categoriesOf(article: ArticleItem): string[] {
  if (!Array.isArray(article.categories)) return []
  return article.categories.filter((value): value is string => typeof value === 'string')
}

function hrefFor(article: ArticleItem, siteContext: BlockSiteContext): string {
  const slug = typeof article.slug === 'string' ? article.slug : ''
  return siteHref(
    slug ? getRoutablePath('posts', slug) : '/',
    siteContext.basePath,
    siteContext.locale,
  )
}

function dateOf(article: ArticleItem, siteContext: BlockSiteContext): string | null {
  return formatLongDate(article.publishedAt, siteContext.locale)
}

function Cover({
  article,
  className,
  sizes,
}: {
  article: ArticleItem
  className: string
  sizes: string
}) {
  const url = mediaUrl(article.cover as never, 'card')
  if (!url) {
    return (
      <div
        className={`${className} bg-(--theme-surface) border border-(--theme-border) flex items-center justify-center`}
        style={{ borderRadius: 'var(--theme-radius-box)' }}
        aria-hidden="true"
      >
        <span className="text-xs uppercase tracking-widest text-(--theme-muted)">
          {String(article.title || '').slice(0, 2) || 'OP'}
        </span>
      </div>
    )
  }

  return (
    <img
      src={url}
      srcSet={mediaSrcSet(article.cover as never, ['card', 'hero'])}
      sizes={sizes}
      alt={mediaAlt(article.cover as never, String(article.title || ''))}
      className={`${className} object-cover border border-(--theme-border)`}
      style={{ borderRadius: 'var(--theme-radius-box)' }}
      loading="lazy"
    />
  )
}

function useListingArticles(
  data: ArticleListData,
  siteContext: BlockSiteContext | undefined,
  serverArticles?: ArticleItem[],
) {
  const hasServerArticles = Array.isArray(serverArticles)
  const [articles, setArticles] = useState<ArticleItem[]>(serverArticles || [])
  const [fetchedKey, setFetchedKey] = useState<string | null>(null)

  const manualIds = useMemo(() => {
    if (data.source !== 'manual' || !Array.isArray(data.posts)) return null
    return data.posts
      .map((item) => (typeof item === 'string' ? item : item?.id))
      .filter((value): value is string => Boolean(value))
  }, [data.posts, data.source])

  const key = useMemo(
    () =>
      JSON.stringify({
        tenant: siteContext?.tenantID,
        locale: siteContext?.locale,
        source: data.source || 'latest',
        limit: manualIds && manualIds.length > 0 ? manualIds.length : (data.limit ?? 6),
        category: data.source === 'category' ? data.category || null : null,
        ids: manualIds,
      }),
    [data.category, data.limit, data.source, manualIds, siteContext?.locale, siteContext?.tenantID],
  )

  // Kunci awal server: saat config belum berubah dari render server, pakai data server.
  const initialKey = useMemo(() => key, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (hasServerArticles) {
      setArticles(serverArticles)
      setFetchedKey(initialKey)
    }
  }, [hasServerArticles, initialKey, serverArticles])

  useEffect(() => {
    if (!siteContext?.tenantID || typeof window === 'undefined') return
    // Jika data server cocok dengan config saat ini, tidak perlu fetch.
    if (hasServerArticles && key === initialKey) return
    if (fetchedKey === key) return

    let active = true
    const controller = new AbortController()

    const limit = manualIds && manualIds.length > 0 ? manualIds.length : (data.limit ?? 6)
    const params = new URLSearchParams({
      depth: '2',
      limit: String(limit),
      sort: '-publishedAt',
      'where[and][0][tenant][equals]': siteContext.tenantID,
      'where[and][1][_status][equals]': 'published',
      locale: siteContext.locale || 'id',
    })

    let andIndex = 2
    if (data.source === 'category' && data.category) {
      params.set(`where[and][${andIndex}][categories][contains]`, data.category)
      andIndex += 1
    }
    if (manualIds && manualIds.length > 0) {
      manualIds.forEach((id, i) => {
        params.set(`where[and][${andIndex}][id][in][${i}]`, id)
      })
    }

    fetch(`/api/posts?${params.toString()}`, {
      credentials: 'include',
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!active || !json) return
        let docs = (Array.isArray(json.docs) ? json.docs : []) as ArticleItem[]
        if (manualIds && manualIds.length > 0) {
          const order = new Map(manualIds.map((id, index) => [id, index]))
          docs = [...docs].sort(
            (a, b) => (order.get(String(a.id)) ?? 0) - (order.get(String(b.id)) ?? 0),
          )
        }
        setArticles(docs)
        setFetchedKey(key)
      })
      .catch(() => {
        if (active) setFetchedKey(key)
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [data.category, data.source, fetchedKey, hasServerArticles, initialKey, key, manualIds, siteContext?.locale, siteContext?.tenantID])

  return articles
}

export default function ArticleListBlockView({
  data,
  themeLayout,
  siteContext,
  articles: serverArticles,
}: Props) {
  const variant = data.variant || 'article-grid'
  const articles = useListingArticles(data, siteContext, serverArticles)

  if (!siteContext?.tenantID) {
    return (
      <section className="w-full py-16">
        <Container containerClass={themeLayout}>
          <p className="text-sm text-(--theme-muted)">
            Daftar artikel belum dapat dimuat (tenant tidak terdeteksi).
          </p>
        </Container>
      </section>
    )
  }

  const showCover = data.showCover !== false
  const showExcerpt = data.showExcerpt !== false
  const showDate = data.showDate !== false

  return (
    <section className="w-full py-16 md:py-20 relative overflow-hidden">
      <Container containerClass={themeLayout}>
        {(data.sectionBadge || data.sectionTitle || data.sectionSubtitle) && (
          <div className="max-w-3xl mb-10 md:mb-14">
            {data.sectionBadge ? (
              <div
                style={{ borderRadius: 'var(--theme-radius-btn)' }}
                className="inline-block px-3 py-1 mb-4 text-[11px] font-medium tracking-wider text-(--theme-muted) uppercase bg-white/5 border border-(--theme-border)"
              >
                {data.sectionBadge}
              </div>
            ) : null}
            {data.sectionTitle ? (
              <h2 className="font-heading text-2xl md:text-4xl font-semibold tracking-tight text-(--theme-text)">
                {data.sectionTitle}
              </h2>
            ) : null}
            {data.sectionSubtitle ? (
              <p className="font-sub text-sm md:text-base text-(--theme-muted) mt-3 font-light">
                {data.sectionSubtitle}
              </p>
            ) : null}
          </div>
        )}

        {articles.length === 0 ? (
          <p className="text-sm text-(--theme-muted)">
            {data.emptyMessage || 'Belum ada artikel.'}
          </p>
        ) : null}

        {articles.length > 0 && variant === 'article-grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {articles.map((article) => (
              <a
                key={article.id || article.slug}
                href={hrefFor(article, siteContext)}
                className="group flex flex-col w-full bg-(--theme-surface)/40 border border-(--theme-border) p-4 transition-all duration-300 hover:border-(--theme-primary) hover:-translate-y-0.5"
                style={{
                  borderRadius: 'var(--theme-radius-box)',
                  boxShadow: 'var(--theme-shadow)',
                }}
              >
                {showCover ? (
                  <Cover
                    article={article}
                    className="w-full aspect-video"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : null}

                <div className="flex flex-col flex-1 mt-4">
                  {categoriesOf(article).length > 0 ? (
                    <span className="text-[10px] uppercase tracking-widest text-(--theme-primary) mb-2">
                      {categoriesOf(article)[0]}
                    </span>
                  ) : null}
                  <h3 className="font-heading text-base md:text-lg font-semibold leading-snug text-(--theme-text) group-hover:text-(--theme-primary) transition-colors">
                    {article.title}
                  </h3>
                  {showExcerpt && article.excerpt ? (
                    <p className="font-sub text-xs md:text-sm text-(--theme-muted) mt-2 line-clamp-3 font-light">
                      {article.excerpt}
                    </p>
                  ) : null}
                  {showDate && dateOf(article, siteContext) ? (
                    <time
                      dateTime={article.publishedAt || undefined}
                      className="mt-4 text-[11px] text-(--theme-muted)"
                    >
                      {dateOf(article, siteContext)}
                    </time>
                  ) : null}
                </div>
              </a>
            ))}
          </div>
        )}

        {articles.length > 0 && variant === 'article-featured' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
            <a
              href={hrefFor(articles[0], siteContext)}
              className="group flex flex-col bg-(--theme-surface)/40 border border-(--theme-border) p-4 md:p-6 transition-all duration-300 hover:border-(--theme-primary)"
              style={{
                borderRadius: 'var(--theme-radius-box)',
                boxShadow: 'var(--theme-shadow)',
              }}
            >
              {showCover ? (
                <Cover
                  article={articles[0]}
                  className="w-full aspect-[16/10]"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : null}
              <div className="mt-5">
                {categoriesOf(articles[0]).length > 0 ? (
                  <span className="text-[10px] uppercase tracking-widest text-(--theme-primary)">
                    {categoriesOf(articles[0])[0]}
                  </span>
                ) : null}
                <h3 className="font-heading text-xl md:text-3xl font-semibold leading-tight text-(--theme-text) mt-2 group-hover:text-(--theme-primary) transition-colors">
                  {articles[0].title}
                </h3>
                {showExcerpt && articles[0].excerpt ? (
                  <p className="font-sub text-sm text-(--theme-muted) mt-3 font-light">
                    {articles[0].excerpt}
                  </p>
                ) : null}
                {showDate && dateOf(articles[0], siteContext) ? (
                  <time
                    dateTime={articles[0].publishedAt || undefined}
                    className="block mt-4 text-[11px] text-(--theme-muted)"
                  >
                    {dateOf(articles[0], siteContext)}
                  </time>
                ) : null}
              </div>
            </a>

            <div className="flex flex-col divide-y divide-(--theme-border)">
              {articles.slice(1).map((article) => (
                <a
                  key={article.id || article.slug}
                  href={hrefFor(article, siteContext)}
                  className="group flex gap-4 py-4 first:pt-0 last:pb-0"
                >
                  {showCover ? (
                    <Cover
                      article={article}
                      className="w-24 h-20 md:w-32 md:h-24 shrink-0"
                      sizes="128px"
                    />
                  ) : null}
                  <div className="min-w-0">
                    <h4 className="font-heading text-sm md:text-base font-semibold leading-snug text-(--theme-text) group-hover:text-(--theme-primary) transition-colors">
                      {article.title}
                    </h4>
                    {showDate && dateOf(article, siteContext) ? (
                      <time
                        dateTime={article.publishedAt || undefined}
                        className="block mt-2 text-[11px] text-(--theme-muted)"
                      >
                        {dateOf(article, siteContext)}
                      </time>
                    ) : null}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {articles.length > 0 && variant === 'article-list' && (
          <div className="flex flex-col divide-y divide-(--theme-border) border-y border-(--theme-border)">
            {articles.map((article) => (
              <a
                key={article.id || article.slug}
                href={hrefFor(article, siteContext)}
                className="group flex flex-col sm:flex-row gap-4 md:gap-6 py-5 md:py-6"
              >
                {showCover ? (
                  <Cover
                    article={article}
                    className="w-full sm:w-48 md:w-64 aspect-video shrink-0"
                    sizes="(max-width: 640px) 100vw, 256px"
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  {categoriesOf(article).length > 0 ? (
                    <span className="text-[10px] uppercase tracking-widest text-(--theme-primary)">
                      {categoriesOf(article)[0]}
                    </span>
                  ) : null}
                  <h3 className="font-heading text-lg md:text-2xl font-semibold leading-snug text-(--theme-text) mt-1 group-hover:text-(--theme-primary) transition-colors">
                    {article.title}
                  </h3>
                  {showExcerpt && article.excerpt ? (
                    <p className="font-sub text-sm text-(--theme-muted) mt-2 line-clamp-2 font-light">
                      {article.excerpt}
                    </p>
                  ) : null}
                  {showDate && dateOf(article, siteContext) ? (
                    <time
                      dateTime={article.publishedAt || undefined}
                      className="block mt-3 text-[11px] text-(--theme-muted)"
                    >
                      {dateOf(article, siteContext)}
                    </time>
                  ) : null}
                </div>
              </a>
            ))}
          </div>
        )}

        {articles.length > 0 && variant === 'article-compact' && (
          <ol className="flex flex-col divide-y divide-(--theme-border) border-y border-(--theme-border)">
            {articles.map((article, index) => (
              <li key={article.id || article.slug}>
                <a
                  href={hrefFor(article, siteContext)}
                  className="group flex items-baseline gap-4 py-4"
                >
                  <span className="font-sub text-xs text-(--theme-muted) tabular-nums w-6 shrink-0">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-heading text-sm md:text-base font-semibold text-(--theme-text) group-hover:text-(--theme-primary) transition-colors">
                      {article.title}
                    </span>
                    {showDate && dateOf(article, siteContext) ? (
                      <time
                        dateTime={article.publishedAt || undefined}
                        className="block mt-1 text-[11px] text-(--theme-muted)"
                      >
                        {dateOf(article, siteContext)}
                      </time>
                    ) : null}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        )}
      </Container>
    </section>
  )
}
