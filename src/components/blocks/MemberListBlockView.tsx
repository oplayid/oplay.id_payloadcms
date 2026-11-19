'use client'

import React, { useEffect, useMemo, useState } from 'react'
import type { BlockSiteContext } from '@/components/CanvasRenderer'
import Container from '@/components/ui/Container'
import { mediaAlt, mediaSrcSet, mediaUrl } from '@/lib/mediaUrl'
import { getRoutablePath } from '@/lib/routableCollections'
import { siteHref } from '@/lib/urls'

type MemberItem = {
  id?: string
  name?: string
  slug?: string
  position?: string | null
  status?: string | null
  excerpt?: string | null
  cover?: unknown
  categories?: string[] | null
}

export type MemberListData = {
  variant?: string
  sectionBadge?: string
  sectionTitle?: string
  sectionSubtitle?: string
  source?: 'latest' | 'manual' | 'category'
  members?: Array<string | { id?: string }> | null
  category?: string | null
  limit?: number | null
  showPhoto?: boolean | null
  showPosition?: boolean | null
  showStatus?: boolean | null
  showExcerpt?: boolean | null
  showCategories?: boolean | null
  emptyMessage?: string | null
}

type Props = {
  data: MemberListData
  themeLayout?: string
  siteContext?: BlockSiteContext
  /** Anggota hasil fetch server (SSR). Bila kosong/undefined, komponen fetch client-side. */
  members?: MemberItem[]
}

function categoriesOf(member: MemberItem): string[] {
  if (!Array.isArray(member.categories)) return []
  return member.categories.filter((value): value is string => typeof value === 'string')
}

function hrefFor(member: MemberItem, siteContext: BlockSiteContext): string {
  const slug = typeof member.slug === 'string' ? member.slug : ''
  return siteHref(
    slug ? getRoutablePath('members', slug) : '/',
    siteContext.basePath,
    siteContext.locale,
  )
}

function Avatar({
  member,
  className,
  sizes,
}: {
  member: MemberItem
  className: string
  sizes: string
}) {
  const url = mediaUrl(member.cover as never, 'card')
  if (!url) {
    return (
      <div
        className={`${className} bg-(--theme-surface) border border-(--theme-border) flex items-center justify-center`}
        style={{ borderRadius: 'var(--theme-radius-box)' }}
        aria-hidden="true"
      >
        <span className="text-sm font-semibold uppercase tracking-widest text-(--theme-muted)">
          {String(member.name || '').slice(0, 2) || 'TM'}
        </span>
      </div>
    )
  }

  return (
    <img
      src={url}
      srcSet={mediaSrcSet(member.cover as never, ['thumbnail', 'card'])}
      sizes={sizes}
      alt={mediaAlt(member.cover as never, String(member.name || ''))}
      className={`${className} object-cover border border-(--theme-border)`}
      style={{ borderRadius: 'var(--theme-radius-box)' }}
      loading="lazy"
    />
  )
}

function useListingMembers(
  data: MemberListData,
  siteContext: BlockSiteContext | undefined,
  serverMembers?: MemberItem[],
) {
  const hasServerMembers = Array.isArray(serverMembers)
  const [members, setMembers] = useState<MemberItem[]>(serverMembers || [])
  const [fetchedKey, setFetchedKey] = useState<string | null>(null)

  const manualIds = useMemo(() => {
    if (data.source !== 'manual' || !Array.isArray(data.members)) return null
    return data.members
      .map((item) => (typeof item === 'string' ? item : item?.id))
      .filter((value): value is string => Boolean(value))
  }, [data.members, data.source])

  const key = useMemo(
    () =>
      JSON.stringify({
        tenant: siteContext?.tenantID,
        locale: siteContext?.locale,
        source: data.source || 'latest',
        limit: manualIds && manualIds.length > 0 ? manualIds.length : (data.limit ?? 12),
        category: data.source === 'category' ? data.category || null : null,
        ids: manualIds,
      }),
    [data.category, data.limit, data.source, manualIds, siteContext?.locale, siteContext?.tenantID],
  )

  const initialKey = useMemo(() => key, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (hasServerMembers) {
      setMembers(serverMembers)
      setFetchedKey(initialKey)
    }
  }, [hasServerMembers, initialKey, serverMembers])

  useEffect(() => {
    if (!siteContext?.tenantID || typeof window === 'undefined') return
    if (hasServerMembers && key === initialKey) return
    if (fetchedKey === key) return

    let active = true
    const controller = new AbortController()

    const limit = manualIds && manualIds.length > 0 ? manualIds.length : (data.limit ?? 12)
    const params = new URLSearchParams({
      depth: '1',
      limit: String(limit),
      sort: 'order',
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

    fetch(`/api/members?${params.toString()}`, {
      credentials: 'include',
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!active || !json) return
        let docs = (Array.isArray(json.docs) ? json.docs : []) as MemberItem[]
        if (manualIds && manualIds.length > 0) {
          const order = new Map(manualIds.map((id, index) => [id, index]))
          docs = [...docs].sort(
            (a, b) => (order.get(String(a.id)) ?? 0) - (order.get(String(b.id)) ?? 0),
          )
        }
        setMembers(docs)
        setFetchedKey(key)
      })
      .catch(() => {
        if (active) setFetchedKey(key)
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [data.category, data.source, fetchedKey, hasServerMembers, initialKey, key, manualIds, siteContext?.locale, siteContext?.tenantID])

  return members
}

export default function MemberListBlockView({
  data,
  themeLayout,
  siteContext,
  members: serverMembers,
}: Props) {
  const variant = data.variant || 'member-grid'
  const members = useListingMembers(data, siteContext, serverMembers)

  if (!siteContext?.tenantID) {
    return (
      <section className="w-full py-16">
        <Container containerClass={themeLayout}>
          <p className="text-sm text-(--theme-muted)">
            Daftar anggota belum dapat dimuat (tenant tidak terdeteksi).
          </p>
        </Container>
      </section>
    )
  }

  const showPhoto = data.showPhoto !== false
  const showPosition = data.showPosition !== false
  const showStatus = data.showStatus !== false
  const showExcerpt = data.showExcerpt !== false
  const showCategories = data.showCategories === true

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

        {members.length === 0 ? (
          <p className="text-sm text-(--theme-muted)">
            {data.emptyMessage || 'Belum ada anggota.'}
          </p>
        ) : null}

        {members.length > 0 && variant === 'member-grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {members.map((member) => (
              <a
                key={member.id || member.slug}
                href={hrefFor(member, siteContext)}
                className="group flex flex-col w-full bg-(--theme-surface)/40 border border-(--theme-border) p-4 transition-all duration-300 hover:border-(--theme-primary) hover:-translate-y-0.5"
                style={{
                  borderRadius: 'var(--theme-radius-box)',
                  boxShadow: 'var(--theme-shadow)',
                }}
              >
                {showPhoto ? (
                  <Avatar
                    member={member}
                    className="w-full aspect-[4/5]"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                ) : null}

                <div className="flex flex-col flex-1 mt-4 text-center">
                  {showCategories && categoriesOf(member).length > 0 ? (
                    <span className="text-[10px] uppercase tracking-widest text-(--theme-primary) mb-1">
                      {categoriesOf(member)[0]}
                    </span>
                  ) : null}
                  <h3 className="font-heading text-base md:text-lg font-semibold leading-snug text-(--theme-text) group-hover:text-(--theme-primary) transition-colors">
                    {member.name}
                  </h3>
                  {showPosition && member.position ? (
                    <p className="text-xs md:text-sm text-(--theme-muted) mt-1">
                      {member.position}
                    </p>
                  ) : null}
                  {showStatus && member.status ? (
                    <div className="mt-2">
                      <span
                        style={{ borderRadius: 'var(--theme-radius-btn)' }}
                        className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide border border-(--theme-border) bg-(--theme-surface) text-(--theme-text)"
                      >
                        {member.status}
                      </span>
                    </div>
                  ) : null}
                  {showExcerpt && member.excerpt ? (
                    <p className="font-sub text-xs md:text-sm text-(--theme-muted) mt-3 line-clamp-3 font-light">
                      {member.excerpt}
                    </p>
                  ) : null}
                </div>
              </a>
            ))}
          </div>
        )}

        {members.length > 0 && variant === 'member-list' && (
          <div className="flex flex-col divide-y divide-(--theme-border) border-y border-(--theme-border)">
            {members.map((member) => (
              <a
                key={member.id || member.slug}
                href={hrefFor(member, siteContext)}
                className="group flex flex-col sm:flex-row gap-4 md:gap-6 py-5 md:py-6 items-center sm:items-start"
              >
                {showPhoto ? (
                  <Avatar
                    member={member}
                    className="w-24 h-28 md:w-28 md:h-32 shrink-0"
                    sizes="112px"
                  />
                ) : null}
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <h3 className="font-heading text-lg md:text-xl font-semibold leading-snug text-(--theme-text) group-hover:text-(--theme-primary) transition-colors">
                    {member.name}
                  </h3>
                  {showPosition && member.position ? (
                    <p className="text-sm text-(--theme-muted) mt-1">{member.position}</p>
                  ) : null}
                  {showStatus && member.status ? (
                    <div className="mt-2">
                      <span
                        style={{ borderRadius: 'var(--theme-radius-btn)' }}
                        className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide border border-(--theme-border) bg-(--theme-surface) text-(--theme-text)"
                      >
                        {member.status}
                      </span>
                    </div>
                  ) : null}
                  {showExcerpt && member.excerpt ? (
                    <p className="font-sub text-sm text-(--theme-muted) mt-2 line-clamp-2 font-light">
                      {member.excerpt}
                    </p>
                  ) : null}
                  {showCategories && categoriesOf(member).length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                      {categoriesOf(member).map((category) => (
                        <span
                          key={category}
                          className="text-[10px] uppercase tracking-widest text-(--theme-primary)"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </a>
            ))}
          </div>
        )}

        {members.length > 0 && variant === 'member-compact' && (
          <ul className="flex flex-col divide-y divide-(--theme-border) border-y border-(--theme-border)">
            {members.map((member) => (
              <li key={member.id || member.slug}>
                <a
                  href={hrefFor(member, siteContext)}
                  className="group flex items-center gap-4 py-3"
                >
                  {showPhoto ? (
                    <Avatar member={member} className="w-10 h-10 shrink-0" sizes="40px" />
                  ) : null}
                  <span className="flex-1 min-w-0">
                    <span className="block font-heading text-sm md:text-base font-semibold text-(--theme-text) group-hover:text-(--theme-primary) transition-colors">
                      {member.name}
                    </span>
                    {(showPosition && member.position) || (showStatus && member.status) ? (
                      <span className="block text-xs text-(--theme-muted) mt-0.5">
                        {[showPosition ? member.position : null, showStatus ? member.status : null]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    ) : null}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  )
}
