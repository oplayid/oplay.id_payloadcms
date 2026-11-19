import React from 'react'
import type { BlockSiteContext } from '@/components/CanvasRenderer'
import { getHighlights, readHighlightConfig } from '@/lib/highlights'
import TeamMembersBannerView, {
  type BannerMemberItem,
  type TeamMembersBannerViewData,
} from './TeamMembersBannerView'

type BannerBlockData = TeamMembersBannerViewData & {
  dataSource?: 'manual' | 'collection'
  // Konfigurasi sorotan koleksi (dibaca via readHighlightConfig)
  highlightCollection?: 'members' | 'posts'
  highlightMode?: 'latest' | 'category' | 'manual'
  highlightMemberItems?: Array<string | { id?: string }> | null
  highlightPostItems?: Array<string | { id?: string }> | null
  highlightCategory?: string | null
  highlightLimit?: number | null
  // Data manual (back-compat)
  members?: Array<{
    photo?: unknown
    fullName?: string
    position?: string
    status?: string | null
  }> | null
}

function normalizeInlineMembers(data: BannerBlockData): BannerMemberItem[] {
  if (!Array.isArray(data.members)) return []

  const items: BannerMemberItem[] = []
  data.members.forEach((member, idx) => {
    const fullName = typeof member?.fullName === 'string' ? member.fullName : ''
    if (!fullName) return

    items.push({
      id: `inline-${idx}`,
      fullName,
      position: typeof member?.position === 'string' ? member.position : '',
      status: typeof member?.status === 'string' ? member.status : null,
      photo: (member?.photo ?? null) as BannerMemberItem['photo'],
    })
  })

  return items
}

export default async function TeamMembersBannerBlock({
  data,
  themeLayout,
  siteContext,
}: {
  data: BannerBlockData
  themeLayout?: string
  siteContext?: BlockSiteContext
}) {
  let members: BannerMemberItem[] = []

  // Back-compat: tanpa dataSource berarti manual/inline.
  if (data?.dataSource === 'collection' && siteContext?.tenantID) {
    const config = readHighlightConfig(data as Record<string, any>, {
      defaultCollection: 'members',
      defaultMode: 'latest',
    })

    const items = await getHighlights({
      collection: config.collection,
      tenantID: siteContext.tenantID,
      locale: siteContext.locale,
      mode: config.mode,
      category: config.category,
      ids: config.ids,
      limit: config.limit ?? 12,
    })

    members = items.map((item) => ({
      id: item.id,
      slug: item.slug,
      fullName: item.title,
      position: item.subtitle ?? '',
      status: item.badge ?? null,
      photo: item.image ?? null,
    }))
  } else {
    members = normalizeInlineMembers(data)
  }

  return (
    <TeamMembersBannerView
      data={{ variant: data?.variant, title: data?.title }}
      members={members}
      themeLayout={themeLayout}
      siteContext={siteContext}
    />
  )
}
