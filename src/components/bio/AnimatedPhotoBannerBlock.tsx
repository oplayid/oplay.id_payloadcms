'use client'

import React from 'react'
import Container from '@/components/ui/Container'
import { mediaUrl, mediaSrcSet, type MediaLike } from '@/lib/mediaUrl'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCoverflow, EffectCards } from 'swiper/modules'

type PhotoItem = {
  url: MediaLike
  alt: string
  caption?: string
}

type BannerData = {
  variant?: 'apple-coverflow' | 'apple-stack' | 'apple-smooth-scroll'
  title?: string
  photos: PhotoItem[]
}

export default function AnimatedPhotoBannerBlock({
  data,
  themeLayout,
}: {
  data: BannerData
  themeLayout?: string
}) {
  const variant = data.variant || 'apple-coverflow'
  const safePhotos = data.photos || []
  const middleIndex = Math.floor(safePhotos.length / 2)

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
              // Tambahkan parameter ini agar sentuhan/geseran mouse dijamin aktif
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
              {safePhotos.map((photo, idx) => (
                <SwiperSlide
                  key={idx}
                  // Berikan lebar & tinggi pasti via inline style agar Swiper dapat menghitung posisi 3D
                  style={{ width: '260px', height: '360px' }}
                  className="rounded-2xl overflow-hidden shadow-2xl transition-all select-none"
                >
                  <div className="w-full h-full relative group">
                    <img
                      src={mediaUrl(photo.url, "card")}
                      srcSet={mediaSrcSet(photo.url, ["thumbnail", "card"])}
                      sizes="(max-width: 768px) 50vw, 260px"
                      alt={photo.alt}
                      className="w-full h-full object-cover pointer-events-none"
                    />
                    {photo.caption && (
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <span className="text-xs text-white font-medium">{photo.caption}</span>
                      </div>
                    )}
                  </div>
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
              className="w-65 h-90"
            >
              {safePhotos.map((photo, idx) => (
                <SwiperSlide
                  key={idx}
                  className="rounded-2xl overflow-hidden shadow-2xl bg-(--theme-surface)"
                >
                  <img
                    src={mediaUrl(photo.url, "card")}
                    srcSet={mediaSrcSet(photo.url, ["thumbnail", "card"])}
                    sizes="(max-width: 768px) 50vw, 260px"
                    alt={photo.alt}
                    className="w-full h-full object-cover"
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
          <div className="w-full flex items-center gap-6 overflow-x-auto no-scrollbar px-6 snap-x snap-mandatory scroll-smooth">
            {safePhotos.map((photo, idx) => (
              <div
                key={idx}
                className="shrink-0 snap-center w-55 h-80 rounded-2xl overflow-hidden shadow-xl transition-transform duration-500 hover:scale-105"
              >
                <img
                  src={mediaUrl(photo.url, "card")}
                  srcSet={mediaSrcSet(photo.url, ["thumbnail", "card"])}
                  sizes="(max-width: 768px) 50vw, 260px"
                  alt={photo.alt}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  )
}
