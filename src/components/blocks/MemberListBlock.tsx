import React from 'react'
import type { BlockSiteContext } from '@/components/CanvasRenderer'
import { getRoutableListing } from '@/lib/routableContent'
import MemberListBlockView, { type MemberListData } from './MemberListBlockView'

type Props = {
  data: MemberListData
  themeLayout?: string
  siteContext?: BlockSiteContext
}

/**
 * Server wrapper: mengambil daftar anggota via Local API (ter-cache),
 * lalu merender tampilan klien.
 */
export default async function MemberListBlock({ data, themeLayout, siteContext }: Props) {
  let members: unknown[] = []

  if (siteContext?.tenantID) {
    const manualIds =
      data.source === 'manual' && Array.isArray(data.members)
        ? data.members
            .map((item) => (typeof item === 'string' ? item : item?.id))
            .filter((value): value is string => Boolean(value))
        : null

    members = await getRoutableListing('members', siteContext.tenantID, {
      limit: manualIds && manualIds.length > 0 ? manualIds.length : (data.limit ?? 12),
      locale: siteContext.locale,
      category: data.source === 'category' ? data.category : null,
      ids: manualIds,
    })
  }

  return (
    <MemberListBlockView
      data={data}
      themeLayout={themeLayout}
      siteContext={siteContext}
      members={members as never[]}
    />
  )
}
