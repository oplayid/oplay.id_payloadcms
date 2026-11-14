"use client";

import React, { useState } from "react";
import Container from "@/components/ui/Container";

type AccordionItem = {
  question: string;
  answer: string;
  category?: string;
};

type AccordionDirectoryData = {
  variant?: string;
  sectionBadge?: string;
  sectionTitle: string;
  sectionSubtitle?: string;
  items: AccordionItem[];
};

export default function AccordionDirectoryBlock({
  data,
  themeLayout,
}: {
  data: AccordionDirectoryData;
  themeLayout?: string;
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const variant = data.variant || "accordion-vertical-list";

  const toggleAccordion = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="w-full py-20 relative overflow-hidden">
      <Container containerClass={themeLayout}>
        {/* HEADER SECTION (Dinamis & Sinkron Penuh dengan Theme Pusat) */}
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
            VARIAN 1: accordion-vertical-list (Standar dengan Nomor Indeks)
           ========================================================= */}
        {variant === "accordion-vertical-list" && (
          <div className="max-w-4xl mx-auto space-y-4">
            {data.items.map((item, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div
                  key={idx}
                  style={{
                    borderRadius: "var(--theme-radius-box)",
                    boxShadow: "var(--theme-shadow)",
                  }}
                  className={`bg-(--theme-surface)/30 border transition-all duration-300 backdrop-blur-xl overflow-hidden ${
                    isOpen
                      ? "border-(--theme-border-hover) bg-(--theme-surface)/50 shadow-xl"
                      : "border-(--theme-border)"
                  }`}
                >
                  <button
                    onClick={() => toggleAccordion(idx)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 focus:outline-none cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs text-(--theme-primary) font-bold">
                        0{idx + 1}
                      </span>
                      <div>
                        {item.category && (
                          <span className="font-mono text-[10px] text-(--theme-muted) uppercase tracking-wider block mb-1">
                            {item.category}
                          </span>
                        )}
                        <h3 className="font-heading text-base md:text-lg font-medium text-(--theme-text) group-hover:text-(--theme-primary) transition-colors">
                          {item.question}
                        </h3>
                      </div>
                    </div>

                    <span
                      className={`w-8 h-8 rounded-full bg-white/5 border border-(--theme-border) flex items-center justify-center font-mono text-xs text-(--theme-text) transition-transform duration-300 shrink-0 ${
                        isOpen
                          ? "rotate-45 bg-(--theme-primary) text-(--theme-primary-text) border-transparent"
                          : ""
                      }`}
                      style={{ borderRadius: "var(--theme-radius-btn)" }}
                    >
                      +
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100 pb-6 px-6 pt-2"
                        : "grid-rows-[0fr] opacity-0 overflow-hidden px-6"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-(--theme-border)/40 pt-4 font-sub text-xs md:text-sm text-(--theme-muted) font-light leading-relaxed">
                        {item.answer}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* =========================================================
            VARIAN 2: accordion-boxed-cards (Kartu Terpisah dengan Efek Glow)
           ========================================================= */}
        {variant === "accordion-boxed-cards" && (
          <div className="max-w-3xl mx-auto grid grid-cols-1 gap-6">
            {data.items.map((item, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div
                  key={idx}
                  style={{
                    borderRadius: "var(--theme-radius-box)",
                    boxShadow: "var(--theme-shadow)",
                  }}
                  className={`p-6 bg-(--theme-surface)/40 border backdrop-blur-xl transition-all duration-300 relative overflow-hidden ${
                    isOpen
                      ? "border-(--theme-primary) shadow-xl bg-(--theme-surface)/60"
                      : "border-(--theme-border) hover:border-(--theme-border-hover)"
                  }`}
                >
                  {isOpen && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-(--theme-primary) to-transparent" />
                  )}
                  <button
                    onClick={() => toggleAccordion(idx)}
                    className="w-full text-left flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
                  >
                    <div>
                      {item.category && (
                        <span className="font-mono text-[10px] px-2.5 py-0.5 rounded bg-white/5 border border-(--theme-border) text-(--theme-primary) uppercase tracking-wider inline-block mb-2">
                          {item.category}
                        </span>
                      )}
                      <h3 className="font-heading text-lg font-semibold text-(--theme-text)">
                        {item.question}
                      </h3>
                    </div>
                    <span
                      style={{ borderRadius: "var(--theme-radius-btn)" }}
                      className="font-mono text-xs px-3 py-1.5 bg-white/5 border border-(--theme-border) text-(--theme-text) shrink-0"
                    >
                      {isOpen ? "Tutup [−]" : "Buka [+]"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="mt-4 pt-4 border-t border-(--theme-border)/40 font-sub text-xs md:text-sm text-(--theme-muted) font-light leading-relaxed">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* =========================================================
            VARIAN 3: accordion-category-grouped (Gaya Grid Kolom Ganda Berkelompok)
           ========================================================= */}
        {variant === "accordion-category-grouped" && (
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.items.map((item, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div
                  key={idx}
                  style={{ borderRadius: "var(--theme-radius-box)" }}
                  className="p-6 bg-(--theme-surface)/30 border border-(--theme-border) backdrop-blur-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-mono text-[10px] uppercase text-(--theme-primary) px-2 py-0.5 bg-white/5 border border-(--theme-border) rounded">
                        {item.category || "Umum"}
                      </span>
                      <button
                        onClick={() => toggleAccordion(idx)}
                        className="font-mono text-xs text-(--theme-text) hover:text-(--theme-primary) cursor-pointer"
                      >
                        {isOpen ? "[− Sembunyikan]" : "[+ Detail]"}
                      </button>
                    </div>
                    <h3 className="font-heading text-base font-semibold text-(--theme-text) mb-2">
                      {item.question}
                    </h3>
                  </div>

                  {isOpen && (
                    <div className="mt-4 pt-4 border-t border-(--theme-border)/40 font-sub text-xs text-(--theme-muted) font-light leading-relaxed">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* =========================================================
            VARIAN 4: accordion-minimal-lines (Gaya Garis Pemisah Minimalis Bersih)
           ========================================================= */}
        {variant === "accordion-minimal-lines" && (
          <div className="max-w-3xl mx-auto divide-y divide-(--theme-border)">
            {data.items.map((item, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div key={idx} className="py-6">
                  <button
                    onClick={() => toggleAccordion(idx)}
                    className="w-full text-left flex justify-between items-center gap-4 group cursor-pointer"
                  >
                    <h3 className="font-heading text-base md:text-lg font-medium text-(--theme-text) group-hover:text-(--theme-primary) transition-colors">
                      {item.question}
                    </h3>
                    <span className="font-mono text-xs text-(--theme-muted) group-hover:text-(--theme-text)">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="mt-3 font-sub text-xs md:text-sm text-(--theme-muted) font-light leading-relaxed pr-8">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* =========================================================
            VARIAN 5: accordion-expanded-first (Semua dapat dibuka dengan fokus visual khusus)
           ========================================================= */}
        {variant === "accordion-expanded-first" && (
          <div className="max-w-4xl mx-auto space-y-4">
            {data.items.map((item, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div
                  key={idx}
                  style={{ borderRadius: "var(--theme-radius-box)" }}
                  className={`p-6 border transition-all ${
                    isOpen
                      ? "bg-(--theme-surface)/50 border-(--theme-primary) shadow-lg"
                      : "bg-white/5 border-(--theme-border)"
                  }`}
                >
                  <button
                    onClick={() => toggleAccordion(idx)}
                    className="w-full text-left flex justify-between items-center cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-2 h-2 rounded-full ${isOpen ? "bg-(--theme-primary)" : "bg-(--theme-muted)"}`}
                      />
                      <h3 className="font-heading text-base font-semibold text-(--theme-text)">
                        {item.question}
                      </h3>
                    </div>
                    <span className="font-mono text-xs text-(--theme-primary)">
                      {isOpen ? "Tutup" : "Baca"}
                    </span>
                  </button>
                  {isOpen && (
                    <p className="mt-4 pt-4 border-t border-(--theme-border)/40 font-sub text-xs md:text-sm text-(--theme-muted) font-light leading-relaxed">
                      {item.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </section>
  );
}
