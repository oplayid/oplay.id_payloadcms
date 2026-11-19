'use client'

import React, { useEffect, useMemo, useState } from 'react'
import type { BlockSiteContext } from '@/components/CanvasRenderer'
import TeamMembersBannerView, { type BannerMemberItem } from './TeamMembersBannerView'

type BannerBlockData = {
  variant?: 'apple-coverflow' | 'apple-stack' | 'apple-smooth-scroll'
  title?: string
  dataSource?: 'manual' | 'collection'
  highlightCollection?: 'members' | 'posts'
  highlightMode?: 'latest' | 'category' | 'manual'
  highlightMemberItems?: Array<string | { id?: string }> | null
  highlightCategory?: string | null
  highlightLimit?: number | null
  members?: Array<{
    photo?: unknown
    fullName?: string
    position?: string
    status?: string | null
  }> | null
}

function readHighlightConfigLocal(data: BannerBlockData): {
  mode: 'latest' | 'category' | 'manual'
  category: string | null
  limit: number
  ids: string[] | null
} {
  const mode: 'latest' | 'category' | 'manual' =
    data.highlightMode === 'category' || data.highlightMode === 'manual'
      ? data.highlightMode
      : 'latest'

  const rawIds = data.highlightMemberItems
  const ids = Array.isArray(rawIds)
    ? rawIds
        .map((item) => (typeof item === 'string' ? item : item?.id))
        .filter((value): value is string => typeof value === 'string' && Boolean(value))
    : null

  return {
    mode,
    category: typeof data.highlightCategory === 'string' ? data.highlightCategory : null,
    limit: typeof data.highlightLimit === 'number' ? data.highlightLimit : 12,
    ids,
  }
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

function useCollectionMembers(data: BannerBlockData, siteContext?: BlockSiteContext) {
  const inline = useMemo(() => normalizeInlineMembers(data), [data])
  const [resolved, setResolved] = useState<BannerMemberItem[]>(inline)

  const isCollection = data?.dataSource === 'collection'
  const config = useMemo(() => readHighlightConfigLocal(data), [data])

  const key = useMemo(
    () =>
      JSON.stringify({
        isCollection,
        tenant: siteContext?.tenantID,
        locale: siteContext?.locale,
        mode: config.mode,
        category: config.category || null,
        limit: config.limit ?? 12,
        ids: config.ids || null,
      }),
    [config.category, config.ids, config.limit, config.mode, isCollection, siteContext?.locale, siteContext?.tenantID],
  )

  useEffect(() => {
    if (!isCollection) {
      setResolved(inline)
      return
    }

    if (!siteContext?.tenantID || typeof window === 'undefined') {
      setResolved([])
      return
    }

    let active = true
    const controller = new AbortController()

    const manualIds = config.mode === 'manual' ? (config.ids || []) : null
    const limit = manualIds && manualIds.length > 0 ? manualIds.length : (config.limit ?? 12)
    const params = new URLSearchParams({
      depth: '1',
      limit: String(limit),
      sort: 'order',
      'where[and][0][tenant][equals]': siteContext.tenantID,
      'where[and][1][_status][equals]': 'published',
      locale: siteContext.locale || 'id',
    })

    let andIndex = 2
    if (config.mode === 'category' && config.category) {
      params.set(`where[and][${andIndex}][categories][contains]`, config.category)
      andIndex += 1
    }
    if (manualIds && manualIds.length > 0) {
      manualIds.forEach((id, i) => {
        params.set(`where[and][${andIndex}][id][in][${i}]`, id)
      })
    }

    fetch(`/api/members?${params.toString()}`, {
      credentials: 'include',
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!active || !json) return
        let docs = (Array.isArray(json.docs) ? json.docs : []) as Record<string, any>[]
        if (manualIds && manualIds.length > 0) {
          const order = new Map(manualIds.map((id, index) => [id, index]))
          docs = [...docs].sort(
            (a, b) => (order.get(String(a.id)) ?? 0) - (order.get(String(b.id)) ?? 0),
          )
        }
        const items: BannerMemberItem[] = docs.map((doc) => ({
          id: doc?.id ? String(doc.id) : undefined,
          slug: typeof doc?.slug === 'string' ? doc.slug : undefined,
          fullName: typeof doc?.name === 'string' ? doc.name : '',
          position: typeof doc?.position === 'string' ? doc.position : '',
          status: typeof doc?.status === 'string' ? doc.status : null,
          photo: (doc?.cover ?? null) as BannerMemberItem['photo'],
        }))
        setResolved(items.filter((item) => item.fullName))
      })
      .catch(() => {
        if (active) setResolved([])
      })

    return () => {
      active = false
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return isCollection ? resolved : inline
}

export default function TeamMembersBannerClientBlock({
  data,
  themeLayout,
  siteContext,
}: {
  data: BannerBlockData
  themeLayout?: string
  siteContext?: BlockSiteContext
}) {
  const members = useCollectionMembers(data || {}, siteContext)
  return (
    <TeamMembersBannerView
      data={{ variant: data?.variant, title: data?.title }}
      members={members}
      themeLayout={themeLayout}
      siteContext={siteContext}
    />
  )
}
