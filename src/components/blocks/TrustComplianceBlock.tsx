"use client";

import React from "react";
import Container from "@/components/ui/Container"; // (1) Mengimpor komponen Container terpusat

type ComplianceItem = {
  title: string;
  description: string;
  code: string;
};

type TrustComplianceData = {
  sectionBadge?: string;
  sectionTitle: string;
  sectionSubtitle?: string;
  items: ComplianceItem[];
};

// (2) Menerima prop opsional themeLayout untuk kontrol tata letak terpusat dari JSON tema
export default function TrustComplianceBlock({
  data,
  themeLayout,
}: {
  data: TrustComplianceData;
  themeLayout?: string;
}) {
  return (
    <section className="w-full py-20 border-y border-(--theme-border)/40 bg-(--theme-surface)/10">
      {/* (3) Menggunakan Container universal menggantikan max-w-7xl dan px-6 statis */}
      <Container containerClass={themeLayout}>
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          {data.sectionBadge && (
            <div
              style={{ borderRadius: "var(--theme-radius-btn)" }}
              className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wider text-(--theme-text) uppercase bg-white/5 border border-(--theme-border) font-sub"
            >
              {data.sectionBadge}
            </div>
          )}
          {/* Judul Utama menggunakan font-heading */}
          <h2 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight text-(--theme-text) mb-4">
            {data.sectionTitle}
          </h2>
          {data.sectionSubtitle && (
            /* Subjudul menggunakan font-sub dengan kontras ditingkatkan */
            <p className="font-sub text-sm md:text-base text-(--theme-text)/80 font-light">
              {data.sectionSubtitle}
            </p>
          )}
        </div>

        {/* Grid Sertifikasi & Keamanan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.items.map((item, idx) => (
            <div
              key={idx}
              style={{
                borderRadius: "var(--theme-radius-box)",
                boxShadow: "var(--theme-shadow)",
              }}
              className="relative p-8 bg-(--theme-surface)/30 border border-(--theme-border) backdrop-blur-xl flex flex-col justify-between hover:border-(--theme-border-hover) transition-all duration-300 group"
            >
              {/* Efek Garis Cahaya Tipis di Sudut */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full pointer-events-none group-hover:bg-white/10 transition-all" />

              <div>
                <div
                  style={{ borderRadius: "var(--theme-radius-btn)" }}
                  className="text-[10px] font-semibold text-(--theme-text) tracking-widest uppercase mb-3 px-2.5 py-0.5 bg-white/5 border border-(--theme-border) w-fit font-sub"
                >
                  {item.code}
                </div>
                {/* Judul Kartu menggunakan font-heading */}
                <h3 className="font-heading text-xl font-medium text-(--theme-text) mb-3">
                  {item.title}
                </h3>
                {/* Deskripsi menggunakan font-sub dengan kontras aman */}
                <p className="font-sub text-sm text-(--theme-text)/80 font-light leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-(--theme-border)/50 flex items-center justify-between text-xs text-(--theme-text) font-sub">
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
                  Verified Active
                </span>
                <span className="font-mono text-[10px] text-(--theme-text)/70">
                  SEC-LEVEL-9
                </span>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
