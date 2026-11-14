"use client";

import React, { useState } from "react";
import Container from "@/components/ui/Container";

type DocumentPage = {
  tabTitle: string;
  heading: string;
  subheading?: string;
  paragraphs: string[];
  badges?: string[];
};

type DocumentFlipData = {
  variant?: string; // "dossier-folder" atau "paper-sheet"
  mainTitle?: string;
  pages: DocumentPage[];
};

export default function DocumentFlipBlock({
  data,
  themeLayout,
}: {
  data: DocumentFlipData;
  themeLayout?: string;
}) {
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const variant = data.variant || "dossier-folder";
  const pages = data.pages || [];

  const handlePageChange = (index: number) => {
    if (index === activePageIndex || isAnimating) return;
    setIsAnimating(true);
    setActivePageIndex(index);
    setTimeout(() => {
      setIsAnimating(false);
    }, 300); // Durasi transisi
  };

  if (pages.length === 0) return null;

  const currentPage = pages[activePageIndex];

  return (
    <section className="w-full py-20 relative overflow-hidden">
      <Container containerClass={themeLayout}>
        <div className="max-w-4xl mx-auto">
          {/* Judul Utama Dokumen (Opsional) */}
          {data.mainTitle && (
            <div className="text-center mb-8">
              <span className="font-mono text-[10px] uppercase tracking-widest text-(--theme-primary) px-3 py-1 bg-(--theme-primary)/10 border border-(--theme-primary)/30 rounded-full">
                // ACTIVE_DOSSIER_SYSTEM
              </span>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-(--theme-text) mt-3">
                {data.mainTitle}
              </h2>
            </div>
          )}

          {/* =========================================================
              VARIAN: dossier-folder (Gaya Map Dokumen / Kertas Ditumpuk)
             ========================================================= */}
          {variant === "dossier-folder" && (
            <div className="flex flex-col">
              {/* Tab Navigasi Atas (Menyerupai Tab Kertas Arsip) */}
              {/* Tab Navigasi Atas dengan Horizontal Scroll untuk HP & Wrap untuk Desktop */}
              <div className="flex overflow-x-auto sm:flex-wrap gap-2 px-2 z-10 pb-2 scrollbar-none">
                {pages.map((page, idx) => {
                  const isActive = idx === activePageIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => handlePageChange(idx)}
                      style={{
                        borderRadius: "var(--theme-radius-box)",
                      }}
                      className={`whitespace-nowrap px-4 sm:px-5 py-2.5 text-[11px] sm:text-xs font-sub font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer border shrink-0 ${
                        isActive
                          ? "bg-(--theme-surface) text-(--theme-text) border-(--theme-border) border-b-transparent shadow-lg -translate-y-1"
                          : "bg-white/5 text-(--theme-muted) border-(--theme-border) hover:bg-white/10 hover:text-(--theme-text)"
                      }`}
                    >
                      <span className="font-mono mr-2 text-(--theme-primary)">
                        0{idx + 1}.
                      </span>
                      {page.tabTitle}
                    </button>
                  );
                })}
              </div>

              {/* Badan "Kertas" Utama */}
              <div
                style={{
                  borderRadius: "var(--theme-radius-box)",
                  boxShadow: "var(--theme-shadow)",
                }}
                className="relative p-8 md:p-12 bg-(--theme-surface)/60 border border-(--theme-border) backdrop-blur-2xl z-20 min-h-95 flex flex-col justify-between"
              >
                {/* Konten Kertas dengan Efek Fade & Slide Halus */}
                <div
                  className={`transition-all duration-300 transform ${
                    isAnimating
                      ? "opacity-0 translate-y-2 scale-[0.99]"
                      : "opacity-100 translate-y-0 scale-100"
                  }`}
                >
                  {/* Badge dalam Kertas */}
                  {currentPage.badges && currentPage.badges.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {currentPage.badges.map((badge, bIdx) => (
                        <span
                          key={bIdx}
                          className="px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-(--theme-primary)/10 text-(--theme-primary) border border-(--theme-primary)/20 rounded"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}

                  <h3 className="font-heading text-xl md:text-2xl font-bold text-(--theme-text) mb-2">
                    {currentPage.heading}
                  </h3>

                  {currentPage.subheading && (
                    <p className="font-sub text-xs md:text-sm text-(--theme-primary) font-medium mb-6">
                      {currentPage.subheading}
                    </p>
                  )}

                  <div className="space-y-4 font-sub text-xs md:text-sm text-(--theme-muted) font-light leading-relaxed text-justify">
                    {currentPage.paragraphs.map((p, pIdx) => (
                      <p key={pIdx}>{p}</p>
                    ))}
                  </div>
                </div>

                {/* Footer Kertas: Navigasi Sebelumnya / Selanjutnya */}
                <div className="mt-10 pt-6 border-t border-(--theme-border) flex items-center justify-between text-xs font-mono">
                  <button
                    onClick={() =>
                      handlePageChange(Math.max(0, activePageIndex - 1))
                    }
                    disabled={activePageIndex === 0}
                    className={`px-4 py-2 rounded-lg border border-(--theme-border) transition-all cursor-pointer ${
                      activePageIndex === 0
                        ? "opacity-30 cursor-not-allowed bg-transparent"
                        : "hover:bg-white/5 hover:text-(--theme-text) text-(--theme-muted)"
                    }`}
                  >
                    ←
                  </button>

                  <span className="text-(--theme-muted)">
                    {activePageIndex + 1} - {pages.length}
                  </span>

                  <button
                    onClick={() =>
                      handlePageChange(
                        Math.min(pages.length - 1, activePageIndex + 1),
                      )
                    }
                    disabled={activePageIndex === pages.length - 1}
                    className={`px-4 py-2 rounded-lg border border-(--theme-border) transition-all cursor-pointer ${
                      activePageIndex === pages.length - 1
                        ? "opacity-30 cursor-not-allowed bg-transparent"
                        : "hover:bg-white/5 hover:text-(--theme-text) text-(--theme-muted)"
                    }`}
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
