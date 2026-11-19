'use client'

import React from 'react'
import type { BlockSiteContext } from '@/components/CanvasRenderer'
import Container from '@/components/ui/Container'
import { mediaAlt, mediaSrcSet, mediaUrl, type MediaLike } from '@/lib/mediaUrl'
import { getRoutablePath } from '@/lib/routableCollections'
import { siteHref } from '@/lib/urls'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCards, EffectCoverflow } from 'swiper/modules'

export type BannerMemberItem = {
  photo?: MediaLike
  fullName: string
  position?: string | null
  status?: string | null
  /** Slug anggota (jika bersumber dari koleksi Members). */
  slug?: string | null
  /** ID dokumen (opsional, untuk key). */
  id?: string | null
}

export type TeamMembersBannerViewData = {
  variant?: 'apple-coverflow' | 'apple-stack' | 'apple-smooth-scroll'
  title?: string
}

function resolveHref(member: BannerMemberItem, siteContext?: BlockSiteContext): string | null {
  const slug = typeof member.slug === 'string' && member.slug.trim() ? member.slug.trim() : null
  if (!slug || !siteContext) return null
  return siteHref(getRoutablePath('members', slug), siteContext.basePath, siteContext.locale)
}

function MemberPhoto({ member, sizes }: { member: BannerMemberItem; sizes: string }) {
  const url = mediaUrl(member.photo, 'card')
  const alt = mediaAlt(member.photo, member.fullName || 'Anggota')

  if (!url) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-(--theme-surface)" aria-hidden="true">
        <span className="text-2xl font-semibold uppercase tracking-widest text-(--theme-muted)">
          {(member.fullName || 'A').slice(0, 2)}
        </span>
      </div>
    )
  }

  return (
    <img
      src={url}
      srcSet={mediaSrcSet(member.photo, ['thumbnail', 'card'])}
      sizes={sizes}
      alt={alt}
      className="w-full h-full object-cover pointer-events-none select-none"
      draggable={false}
    />
  )
}

function MemberInfo({ member }: { member: BannerMemberItem }) {
  return (
    <div className="px-4 py-3 bg-(--theme-surface) text-center">
      <h4 className="font-heading text-sm font-semibold text-(--theme-text) leading-tight">
        {member.fullName}
      </h4>
      {member.position ? (
        <p className="mt-1 text-xs text-(--theme-muted) leading-snug">{member.position}</p>
      ) : null}
      {member.status ? (
        <span className="mt-2 inline-flex items-center rounded-full border border-(--theme-border) bg-(--theme-bg) px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-(--theme-text)">
          {member.status}
        </span>
      ) : null}
    </div>
  )
}

function CardContent({
  member,
  sizes,
  siteContext,
  className,
}: {
  member: BannerMemberItem
  sizes: string
  siteContext?: BlockSiteContext
  className?: string
}) {
  const href = resolveHref(member, siteContext)
  const inner = (
    <>
      <div className="relative flex-1 min-h-0">
        <MemberPhoto member={member} sizes={sizes} />
      </div>
      <MemberInfo member={member} />
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        draggable={false}
        className={`w-full h-full flex flex-col text-inherit no-underline ${className || ''}`}
      >
        {inner}
      </a>
    )
  }

  return <div className={`w-full h-full flex flex-col ${className || ''}`}>{inner}</div>
}

export default function TeamMembersBannerView({
  data,
  members,
  themeLayout,
  siteContext,
}: {
  data: TeamMembersBannerViewData
  members: BannerMemberItem[]
  themeLayout?: string
  siteContext?: BlockSiteContext
}) {
  const variant = data.variant || 'apple-coverflow'
  const list = Array.isArray(members) ? members : []
  const middleIndex = Math.floor(list.length / 2)

  if (list.length === 0) {
    return (
      <section className="w-full py-16 relative overflow-hidden">
        <Container containerClass={themeLayout}>
          {data.title ? (
            <div className="text-center mb-6">
              <h3 className="font-heading text-xs uppercase tracking-widest text-(--theme-muted)">
                // {data.title}
              </h3>
            </div>
          ) : null}
          <p className="text-center text-sm text-(--theme-muted)">Belum ada anggota untuk ditampilkan.</p>
        </Container>
      </section>
    )
  }

  return (
    <section className="w-full py-16 relative overflow-hidden">
      <Container containerClass={themeLayout}>
        {data.title && (
          <div className="text-center mb-10">
            <h3 className="font-heading text-xs uppercase tracking-widest text-(--theme-muted)">
              // {data.title}
            </h3>
          </div>
        )}

        {/* =========================================================
            VARIAN 1: apple-coverflow (Tengah besar, kiri-kanan tenggelam/3D)
           ========================================================= */}
        {variant === 'apple-coverflow' && (
          <div className="w-full py-6">
            <Swiper
              effect={'coverflow'}
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={'auto'}
              initialSlide={middleIndex}
              speed={600}
              observeParents={true}
              observer={true}
              coverflowEffect={{
                rotate: 0,
                stretch: 0,
                depth: 100,
                modifier: 2,
                slideShadows: false,
              }}
              modules={[EffectCoverflow]}
              className="w-full py-10 overflow-visible!"
            >
              {list.map((member, idx) => (
                <SwiperSlide
                  key={member.id || member.slug || idx}
                  style={{ width: '260px', height: '420px' }}
                  className="rounded-2xl overflow-hidden shadow-2xl transition-all select-none bg-(--theme-surface)"
                >
                  <CardContent
                    member={member}
                    sizes="(max-width: 768px) 60vw, 260px"
                    siteContext={siteContext}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {/* =========================================================
            VARIAN 2: apple-stack (Efek tumpukan kartu interaktif)
           ========================================================= */}
        {variant === 'apple-stack' && (
          <div className="w-full max-w-xs mx-auto py-6">
            <Swiper
              effect={'cards'}
              grabCursor={true}
              modules={[EffectCards]}
              className="w-65 h-[420px]"
            >
              {list.map((member, idx) => (
                <SwiperSlide
                  key={member.id || member.slug || idx}
                  className="rounded-2xl overflow-hidden shadow-2xl bg-(--theme-surface)"
                >
                  <CardContent
                    member={member}
                    sizes="(max-width: 768px) 60vw, 260px"
                    siteContext={siteContext}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {/* =========================================================
            VARIAN 3: apple-smooth-scroll (Horizontal swipe biasa yang sangat mulus)
           ========================================================= */}
        {variant === 'apple-smooth-scroll' && (
          <div className="w-full flex items-stretch gap-6 overflow-x-auto no-scrollbar px-6 snap-x snap-mandatory scroll-smooth">
            {list.map((member, idx) => (
              <div
                key={member.id || member.slug || idx}
                className="shrink-0 snap-center w-56 h-[380px] rounded-2xl overflow-hidden shadow-xl bg-(--theme-surface) transition-transform duration-500 hover:scale-105 flex flex-col"
              >
                <CardContent
                  member={member}
                  sizes="(max-width: 768px) 60vw, 224px"
                  siteContext={siteContext}
                />
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  )
}
