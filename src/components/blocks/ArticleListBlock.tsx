import React from 'react'
import type { BlockSiteContext } from '@/components/CanvasRenderer'
import { getRoutableListing } from '@/lib/routableContent'
import ArticleListBlockView, { type ArticleListData } from './ArticleListBlockView'

type Props = {
  data: ArticleListData
  themeLayout?: string
  siteContext?: BlockSiteContext
}

/**
 * Server wrapper: mengambil daftar artikel via Local API (ter-cache),
 * lalu merender tampilan klien. Dipakai render SSR normal.
 */
export default async function ArticleListBlock({ data, themeLayout, siteContext }: Props) {
  let articles: unknown[] = []

  if (siteContext?.tenantID) {
    const manualIds =
      data.source === 'manual' && Array.isArray(data.posts)
        ? data.posts
            .map((item) => (typeof item === 'string' ? item : item?.id))
            .filter((value): value is string => Boolean(value))
        : null

    articles = await getRoutableListing('posts', siteContext.tenantID, {
      limit: manualIds && manualIds.length > 0 ? manualIds.length : (data.limit ?? 6),
      locale: siteContext.locale,
      category: data.source === 'category' ? data.category : null,
      ids: manualIds,
    })
  }

  return (
    <ArticleListBlockView
      data={data}
      themeLayout={themeLayout}
      siteContext={siteContext}
      articles={articles as never[]}
    />
  )
}
