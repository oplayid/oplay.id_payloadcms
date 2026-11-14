import React from "react";
import Link from "next/link";
import Container from "@/components/ui/Container"; // (1) Mengimpor komponen Container terpusat
import { mediaUrl, mediaSrcSet, mediaAlt, type MediaLike } from "@/lib/mediaUrl";

type ContentSectionData = {
  badge?: string;
  title: string;
  description: string;
  layout?: "split-left" | "split-right" | "stacked"; // Pilihan tata letak
  image?: MediaLike;
  cta?: {
    label: string;
    href: string;
  };
};

// (2) Menerima prop opsional themeLayout untuk kontrol tata letak terpusat dari JSON tema
export default function ContentSectionBlock({
  data,
  themeLayout,
}: {
  data: ContentSectionData;
  themeLayout?: string;
}) {
  const layout = data.layout || "split-left"; // Default: teks di kiri, gambar di kanan

  // Menentukan urutan flexbox berdasarkan layout
  const isStacked = layout === "stacked";
  const isImageLeft = layout === "split-right";

  return (
    <section className="w-full py-12 md:py-20">
      {/* (3) Menggunakan Container universal menggantikan max-w-7xl dan px-6 statis */}
      <Container containerClass={themeLayout}>
        <div
          className={`flex flex-col ${
            isStacked
              ? "gap-8"
              : "md:grid md:grid-cols-2 md:gap-16 items-center"
          }`}
        >
          {/* KONTEN TEKS */}
          <div
            className={`flex flex-col justify-center ${
              isImageLeft && !isStacked ? "md:order-2" : "md:order-1"
            }`}
          >
            {data.badge && (
              <div
                style={{ borderRadius: "var(--theme-radius-btn)" }}
                className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wider text-(--theme-muted) uppercase bg-white/5 border border-(--theme-border) w-fit font-sub"
              >
                {data.badge}
              </div>
            )}

            {/* Judul Utama menggunakan font-heading */}
            <h2 className="font-heading text-2xl md:text-4xl font-semibold tracking-tight text-(--theme-text) mb-4">
              {data.title}
            </h2>

            {/* Deskripsi menggunakan font-sub */}
            <p className="font-sub text-sm md:text-base text-(--theme-muted) leading-relaxed font-light mb-6">
              {data.description}
            </p>

            {data.cta && (
              <div>
                <Link
                  href={data.cta.href}
                  style={{
                    borderRadius: "var(--theme-radius-btn)",
                    boxShadow: "var(--theme-shadow)",
                  }}
                  className="inline-flex items-center justify-center px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-(--theme-primary-text) bg-(--theme-primary) hover:opacity-90 transition-all duration-200 font-sub"
                >
                  {data.cta.label}
                </Link>
              </div>
            )}
          </div>

          {/* GAMBAR / MEDIA */}
          {data.image && (
            <div
              style={{ borderRadius: "var(--theme-radius-box)" }}
              className={`w-full relative overflow-hidden p-4 md:p-6 bg-(--theme-surface)/40 border border-(--theme-border) backdrop-blur-xl shadow-(--theme-shadow) ${
                isImageLeft && !isStacked ? "md:order-1" : "md:order-2"
              }`}
            >
              <img
                src={
                  mediaUrl(data.image, "card") ||
                  (data.image as { src?: string } | null)?.src ||
                  ""
                }
                srcSet={mediaSrcSet(data.image)}
                sizes="(max-width: 768px) 100vw, 50vw"
                alt={mediaAlt(data.image, (data.image as { alt?: string } | null)?.alt || "")}
                style={{
                  borderRadius: "calc(var(--theme-radius-box) - 0.5rem)",
                }}
                className="w-full h-auto object-cover max-h-100 transition-transform duration-500 hover:scale-105"
              />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
