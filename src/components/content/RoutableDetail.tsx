import type { ComponentType } from 'react'
import type { RoutableContentData } from '@/lib/routableContent'
import ArticleDetail from './ArticleDetail'

export type RoutableDetailProps = {
  data: RoutableContentData
}

/**
 * Peta koleksi -> komponen detail.
 *
 * Menambah jenis konten baru cukup: buat renderer-nya, daftarkan di sini, lalu
 * daftarkan koleksinya di `lib/routableCollections` + `payload.config.ts`.
 */
const DETAIL_RENDERERS: Record<string, ComponentType<RoutableDetailProps>> = {
  posts: ArticleDetail,
}

export default function RoutableDetail({ data }: RoutableDetailProps) {
  const Renderer = DETAIL_RENDERERS[data.collection]
  if (!Renderer) return null
  return <Renderer data={data} />
}
