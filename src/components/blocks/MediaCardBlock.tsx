"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Container from "@/components/ui/Container"; // (1) Mengimpor komponen Container terpusat
import { mediaUrl, mediaSrcSet, type MediaLike } from "@/lib/mediaUrl";

type MediaItem = {
  type: "image" | "video";
  src: MediaLike;
  poster?: MediaLike;
  title: string;
  subtitle?: string;
  category?: string;
  href?: string;
};

type MediaCardData = {
  sectionBadge?: string;
  sectionTitle: string;
  sectionSubtitle?: string;
  items: MediaItem[];
};

// (2) Menerima prop opsional themeLayout untuk kontrol tata letak terpusat dari JSON tema
export default function MediaCardBlock({
  data,
  themeLayout,
}: {
  data: MediaCardData;
  themeLayout?: string;
}) {
  return (
    <section className="w-full py-20">
      {/* (3) Menggunakan Container universal menggantikan max-w-7xl dan px-6 statis */}
      <Container containerClass={themeLayout}>
        {/* HEADER SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          {data.sectionBadge && (
            <div
              style={{ borderRadius: "var(--theme-radius-btn)" }}
              className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wider text-(--theme-muted) uppercase bg-white/5 border border-(--theme-border) font-sub"
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

        {/* GRID KARTU MEDIA MINIMALIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.items.map((item, idx) => (
            <MediaCard key={idx} item={item} />
          ))}
        </div>
      </Container>
    </section>
  );
}

// Komponen Pendukung
function MediaCard({ item }: { item: MediaItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    if (item.type === "video" && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (item.type === "video" && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const CardContent = (
    <div
      style={{
        borderRadius: "var(--theme-radius-box)",
        boxShadow: "var(--theme-shadow)",
      }}
      className="bg-(--theme-surface) border border-(--theme-border) relative overflow-hidden flex flex-col h-full transition-all duration-300 hover:border-(--theme-border-hover)"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Container Media (Gambar / Video) */}
      <div className="relative w-full h-64 overflow-hidden bg-(--theme-bg)">
        {item.type === "image" ? (
          <img
            src={mediaUrl(item.src, "card")}
            srcSet={mediaSrcSet(item.src)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            alt={item.title}
            className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
          />
        ) : (
          <video
            ref={videoRef}
            src={mediaUrl(item.src)}
            poster={mediaUrl(item.poster, "card")}
            muted
            loop
            playsInline
            preload="metadata"
            className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
          />
        )}

        {/* Badge Kategori Minimalis */}
        {item.category && (
          <div className="absolute top-4 left-4 z-10">
            <span
              style={{ borderRadius: "var(--theme-radius-btn)" }}
              className="px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-(--theme-text) bg-(--theme-bg)/70 backdrop-blur-md border border-(--theme-border) shadow-md"
            >
              {item.category}
            </span>
          </div>
        )}

        {/* Indikator Play khusus tipe video */}
        {item.type === "video" && (
          <div className="absolute bottom-4 right-4 z-10 w-8 h-8 rounded-full bg-(--theme-bg)/70 backdrop-blur-md border border-(--theme-border) flex items-center justify-center text-(--theme-text) text-xs opacity-80 transition-opacity">
            ▶
          </div>
        )}
      </div>

      {/* Konten Teks Kartu */}
      <div className="p-6 md:p-8 flex flex-col justify-between flex-1">
        <div>
          <h3 className="font-heading text-xl font-medium text-(--theme-text) mb-2">
            {item.title}
          </h3>
          {item.subtitle && (
            <p className="font-sub text-xs md:text-sm text-(--theme-muted) font-light leading-relaxed">
              {item.subtitle}
            </p>
          )}
        </div>

        {item.href && (
          <div className="mt-6 flex items-center text-xs font-medium text-(--theme-text) tracking-wider uppercase font-sub">
            <span>Lihat Detail</span>
            <span className="ml-2 transition-transform duration-300">→</span>
          </div>
        )}
      </div>
    </div>
  );

  if (item.href) {
    return <Link href={item.href}>{CardContent}</Link>;
  }

  return CardContent;
}
