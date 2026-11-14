import React from "react";
import Container from "@/components/ui/Container";
import { mediaUrl, type MediaLike } from "@/lib/mediaUrl";

type ImageItem = {
  src: MediaLike;
  alt: string;
  caption?: string;
  category?: string;
};

type GalleryLightboxData = {
  variant?: string;
  sectionBadge?: string;
  sectionTitle: string;
  sectionSubtitle?: string;
  images: ImageItem[];
};

export default function GalleryLightboxBlock({
  data,
  themeLayout,
}: {
  data: GalleryLightboxData;
  themeLayout?: string;
}) {
  const variant = data.variant || "gallery-grid-standard";
  const mainImage = data.images[0];
  const subImages = data.images.slice(1);

  return (
    <section id="gallery" className="w-full py-20 relative overflow-hidden">
      <Container containerClass={themeLayout}>
        {/* HEADER SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          {data.sectionBadge && (
            <div
              style={{ borderRadius: "var(--theme-radius-btn)" }}
              className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wider text-(--theme-muted) uppercase bg-white/5 border border-(--theme-border) font-sub backdrop-blur-md"
            >
              {data.sectionBadge}
            </div>
          )}
          <h2 className="font-heading text-3xl md:text-5xl font-semibold tracking-tight text-(--theme-text) mb-4">
            {data.sectionTitle}
          </h2>
          {data.sectionSubtitle && (
            <p className="font-sub text-sm md:text-base text-(--theme-muted) font-light">
              {data.sectionSubtitle}
            </p>
          )}
        </div>

        {/* =========================================================
            VARIAN 1: gallery-featured-hero (Satu Gambar Besar di Atas, Grid di Bawah)
           ========================================================= */}
        {variant === "gallery-featured-hero" && mainImage && (
          <div className="space-y-6">
            <div
              style={{
                borderRadius: "var(--theme-radius-box)",
                boxShadow: "var(--theme-shadow)",
              }}
              className="relative overflow-hidden bg-(--theme-surface)/30 border border-(--theme-border) group h-96 md:h-112.5"
            >
              <img
                src={mediaUrl(mainImage.src, "hero")}
                alt={mainImage.alt}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-(--theme-bg) via-transparent to-transparent opacity-90 flex flex-col justify-end p-8">
                {mainImage.category && (
                  <span className="px-2.5 py-1 text-[10px] font-mono text-(--theme-primary) bg-white/10 border border-(--theme-border) w-fit mb-2 rounded backdrop-blur-md">
                    {mainImage.category}
                  </span>
                )}
                <h3 className="font-heading text-xl md:text-2xl font-semibold text-(--theme-text) mb-1">
                  {mainImage.alt}
                </h3>
                {mainImage.caption && (
                  <p className="font-sub text-xs md:text-sm text-(--theme-muted) font-light">
                    {mainImage.caption}
                  </p>
                )}
              </div>
            </div>

            {subImages.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {subImages.map((img, idx) => (
                  <div
                    key={idx}
                    style={{
                      borderRadius: "var(--theme-radius-box)",
                      boxShadow: "var(--theme-shadow)",
                    }}
                    className="relative overflow-hidden bg-(--theme-surface)/30 border border-(--theme-border) group h-64"
                  >
                    <img
                      src={mediaUrl(img.src, "card")}
                      alt={img.alt}
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-(--theme-bg) via-transparent to-transparent opacity-0 group-hover:opacity-95 transition-opacity duration-300 flex flex-col justify-end p-6">
                      {img.category && (
                        <span className="px-2 py-0.5 text-[10px] font-mono text-(--theme-primary) bg-white/10 border border-(--theme-border) w-fit mb-1 rounded">
                          {img.category}
                        </span>
                      )}
                      <h4 className="font-heading text-sm font-semibold text-(--theme-text)">
                        {img.alt}
                      </h4>
                      {img.caption && (
                        <p className="font-sub text-xs text-(--theme-muted) font-light mt-1">
                          {img.caption}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            VARIAN 2: gallery-grid-standard (Grid Standar 3 Kolom Rapi)
           ========================================================= */}
        {variant === "gallery-grid-standard" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.images.map((item, idx) => (
              <div
                key={idx}
                style={{
                  borderRadius: "var(--theme-radius-box)",
                  boxShadow: "var(--theme-shadow)",
                }}
                className="relative overflow-hidden bg-(--theme-surface)/30 border border-(--theme-border) group h-72"
              >
                <img
                  src={mediaUrl(item.src, "card")}
                  alt={item.alt}
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-(--theme-bg) via-(--theme-bg)/40 to-transparent opacity-0 group-hover:opacity-95 transition-opacity duration-300 flex flex-col justify-end p-6">
                  {item.category && (
                    <span className="px-2 py-0.5 text-[10px] font-mono text-(--theme-primary) bg-white/10 border border-(--theme-border) w-fit mb-2 rounded backdrop-blur-md">
                      {item.category}
                    </span>
                  )}
                  <h4 className="font-heading text-sm font-semibold text-(--theme-text) mb-1">
                    {item.alt}
                  </h4>
                  {item.caption && (
                    <p className="font-sub text-xs text-(--theme-muted) font-light">
                      {item.caption}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================
            VARIAN 3: gallery-masonry-style (Gaya Kolom Asimetris Dinamis)
           ========================================================= */}
        {variant === "gallery-masonry-style" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 auto-rows-60">
            {data.images.map((item, idx) => (
              <div
                key={idx}
                style={{
                  borderRadius: "var(--theme-radius-box)",
                  boxShadow: "var(--theme-shadow)",
                }}
                className={`relative overflow-hidden bg-(--theme-surface)/30 border border-(--theme-border) group ${
                  idx % 3 === 0 ? "md:row-span-2" : "md:row-span-1"
                }`}
              >
                <img
                  src={mediaUrl(item.src, "card")}
                  alt={item.alt}
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-(--theme-bg) via-transparent to-transparent opacity-0 group-hover:opacity-95 transition-opacity duration-300 flex flex-col justify-end p-6">
                  {item.category && (
                    <span className="px-2 py-0.5 text-[10px] font-mono text-(--theme-primary) bg-white/10 border border-(--theme-border) w-fit mb-2 rounded">
                      {item.category}
                    </span>
                  )}
                  <h4 className="font-heading text-sm font-semibold text-(--theme-text) mb-1">
                    {item.alt}
                  </h4>
                  {item.caption && (
                    <p className="font-sub text-xs text-(--theme-muted) font-light">
                      {item.caption}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================
            VARIAN 4: gallery-horizontal-strip (Strip Horisontal Geser Clean)
           ========================================================= */}
        {variant === "gallery-horizontal-strip" && (
          <div className="flex overflow-x-auto pb-6 gap-6 scrollbar-none snap-x">
            {data.images.map((item, idx) => (
              <div
                key={idx}
                style={{
                  borderRadius: "var(--theme-radius-box)",
                  boxShadow: "var(--theme-shadow)",
                }}
                className="relative overflow-hidden bg-(--theme-surface)/30 border border-(--theme-border) group min-w-[320px] md:min-w-100 h-80 shrink-0 snap-start"
              >
                <img
                  src={mediaUrl(item.src, "card")}
                  alt={item.alt}
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-(--theme-bg) via-transparent to-transparent opacity-90 flex flex-col justify-end p-6">
                  {item.category && (
                    <span className="px-2 py-0.5 text-[10px] font-mono text-(--theme-primary) bg-white/10 border border-(--theme-border) w-fit mb-1 rounded">
                      {item.category}
                    </span>
                  )}
                  <h4 className="font-heading text-base font-medium text-(--theme-text)">
                    {item.alt}
                  </h4>
                  {item.caption && (
                    <p className="font-sub text-xs text-(--theme-muted) font-light mt-1">
                      {item.caption}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================
            VARIAN 5: gallery-minimal-cards (Gaya Kartu Berbingkai Bersih)
           ========================================================= */}
        {variant === "gallery-minimal-cards" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.images.map((item, idx) => (
              <div
                key={idx}
                style={{ borderRadius: "var(--theme-radius-box)" }}
                className="p-4 bg-(--theme-surface)/30 border border-(--theme-border) backdrop-blur-xl flex flex-col gap-4 group"
              >
                <div className="overflow-hidden rounded-lg h-60 border border-(--theme-border)/50">
                  <img
                    src={mediaUrl(item.src, "card")}
                    alt={item.alt}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div>
                  {item.category && (
                    <span className="font-mono text-[10px] text-(--theme-primary) uppercase tracking-wider block mb-1">
                      {item.category}
                    </span>
                  )}
                  <h4 className="font-heading text-base font-semibold text-(--theme-text) mb-1">
                    {item.alt}
                  </h4>
                  {item.caption && (
                    <p className="font-sub text-xs text-(--theme-muted) font-light">
                      {item.caption}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
