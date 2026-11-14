"use client";

import React, { useState } from "react";
import Container from "@/components/ui/Container";

type Tab = {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  content: string;
};

type InteractiveTabsData = {
  variant?: string;
  sectionBadge?: string;
  sectionTitle: string;
  sectionSubtitle?: string;
  tabs: Tab[];
};

export default function InteractiveTabsBlock({
  data,
  themeLayout,
}: {
  data: InteractiveTabsData;
  themeLayout?: string;
}) {
  const [activeTab, setActiveTab] = useState(0);
  const current = data.tabs[activeTab] || data.tabs[0];
  const variant = data.variant || "tabs-pill-top";

  return (
    <section className="w-full py-20 relative overflow-hidden">
      <Container containerClass={themeLayout}>
        {/* HEADER SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          {data.sectionBadge && (
            <div
              style={{ borderRadius: "var(--theme-radius-btn)" }}
              className="inline-block px-3 py-1 mb-3 text-xs font-medium tracking-wider text-(--theme-muted) uppercase bg-white/5 border border-(--theme-border) font-sub backdrop-blur-md"
            >
              {data.sectionBadge}
            </div>
          )}
          <h2 className="font-heading text-3xl md:text-5xl font-semibold tracking-tight text-(--theme-text) mb-3">
            {data.sectionTitle}
          </h2>
          {data.sectionSubtitle && (
            <p className="font-sub text-sm md:text-base text-(--theme-muted) font-light">
              {data.sectionSubtitle}
            </p>
          )}
        </div>

        {/* =========================================================
            VARIAN 1: tabs-pill-top (Navigasi Pil Di Atas Terpusat)
           ========================================================= */}
        {variant === "tabs-pill-top" && (
          <div>
            <div className="flex justify-center gap-2 mb-8 flex-wrap">
              {data.tabs.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  style={{ borderRadius: "var(--theme-radius-btn)" }}
                  className={`px-5 py-2.5 text-xs font-sub transition-all cursor-pointer ${
                    activeTab === i
                      ? "bg-(--theme-primary) text-(--theme-primary-text) shadow-lg font-medium"
                      : "bg-white/5 text-(--theme-text) border border-(--theme-border) hover:border-(--theme-border-hover)"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div
              style={{
                borderRadius: "var(--theme-radius-box)",
                boxShadow: "var(--theme-shadow)",
              }}
              className="p-8 md:p-12 bg-(--theme-surface)/30 border border-(--theme-border) max-w-3xl mx-auto backdrop-blur-xl relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-(--theme-primary) to-transparent" />
              <div className="text-center">
                <span className="font-mono text-[10px] text-(--theme-primary) uppercase tracking-widest block mb-2">
                  // MODULE_TAB_0{activeTab + 1}
                </span>
                <h3 className="font-heading text-xl md:text-2xl font-semibold text-(--theme-text) mb-2">
                  {current.title}
                </h3>
                <p className="font-sub text-xs text-(--theme-primary) uppercase tracking-widest mb-6 font-medium">
                  {current.subtitle}
                </p>
                <p className="font-sub text-xs md:text-sm text-(--theme-muted) font-light leading-relaxed max-w-2xl mx-auto">
                  {current.content}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            VARIAN 2: tabs-sidebar-layout (Tata Letak Samping Kiri-Kanan)
           ========================================================= */}
        {variant === "tabs-sidebar-layout" && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-4 flex flex-col gap-2">
              {data.tabs.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  style={{ borderRadius: "var(--theme-radius-btn)" }}
                  className={`w-full p-4 text-left text-xs font-sub transition-all cursor-pointer border flex items-center justify-between ${
                    activeTab === i
                      ? "bg-(--theme-primary) text-(--theme-primary-text) border-transparent shadow-md font-semibold"
                      : "bg-(--theme-surface)/30 text-(--theme-text) border-(--theme-border) hover:border-(--theme-border-hover)"
                  }`}
                >
                  <span>{t.label}</span>
                  <span className="font-mono text-[10px]">→</span>
                </button>
              ))}
            </div>

            <div
              style={{
                borderRadius: "var(--theme-radius-box)",
                boxShadow: "var(--theme-shadow)",
              }}
              className="md:col-span-8 p-8 md:p-10 bg-(--theme-surface)/30 border border-(--theme-border) backdrop-blur-xl"
            >
              <span className="font-mono text-[10px] text-(--theme-primary) uppercase tracking-widest block mb-2">
                ACTIVE_PANEL
              </span>
              <h3 className="font-heading text-xl font-semibold text-(--theme-text) mb-2">
                {current.title}
              </h3>
              <p className="font-sub text-xs text-(--theme-primary) uppercase mb-6">
                {current.subtitle}
              </p>
              <p className="font-sub text-xs md:text-sm text-(--theme-muted) font-light leading-relaxed">
                {current.content}
              </p>
            </div>
          </div>
        )}

        {/* =========================================================
            VARIAN 3: tabs-terminal-console (Gaya Konsol Terminal Interaktif)
           ========================================================= */}
        {variant === "tabs-terminal-console" && (
          <div
            style={{ borderRadius: "var(--theme-radius-box)" }}
            className="max-w-3xl mx-auto bg-(--theme-surface)/50 border border-(--theme-primary)/40 backdrop-blur-2xl overflow-hidden shadow-2xl"
          >
            <div className="bg-white/5 border-b border-(--theme-border) p-4 flex items-center justify-between flex-wrap gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {data.tabs.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTab(i)}
                    className={`px-3 py-1 text-[11px] font-mono rounded cursor-pointer transition-colors ${
                      activeTab === i
                        ? "bg-(--theme-primary) text-(--theme-primary-text)"
                        : "bg-white/5 text-(--theme-muted) hover:text-(--theme-text)"
                    }`}
                  >
                    [{t.label}]
                  </button>
                ))}
              </div>
            </div>
            <div className="p-8">
              <h3 className="font-heading text-lg font-semibold text-(--theme-text) mb-1">
                {current.title}
              </h3>
              <p className="font-mono text-[10px] text-(--theme-primary) uppercase tracking-wider mb-4">
                {current.subtitle}
              </p>
              <p className="font-sub text-xs md:text-sm text-(--theme-muted) font-light leading-relaxed">
                {current.content}
              </p>
            </div>
          </div>
        )}

        {/* =========================================================
            VARIAN 4: tabs-grid-cards (Navigasi Kartu Pilihan Grid)
           ========================================================= */}
        {variant === "tabs-grid-cards" && (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {data.tabs.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  style={{ borderRadius: "var(--theme-radius-box)" }}
                  className={`p-5 text-left transition-all cursor-pointer border ${
                    activeTab === i
                      ? "bg-(--theme-surface)/60 border-(--theme-primary) shadow-lg"
                      : "bg-(--theme-surface)/20 border-(--theme-border) hover:border-(--theme-border-hover)"
                  }`}
                >
                  <span className="font-mono text-[10px] text-(--theme-primary) block mb-1">
                    0{i + 1}
                  </span>
                  <span className="font-heading text-sm font-semibold text-(--theme-text) block">
                    {t.label}
                  </span>
                </button>
              ))}
            </div>

            <div
              style={{ borderRadius: "var(--theme-radius-box)" }}
              className="p-8 bg-(--theme-surface)/30 border border-(--theme-border) backdrop-blur-xl text-center"
            >
              <h3 className="font-heading text-xl font-semibold text-(--theme-text) mb-2">
                {current.title}
              </h3>
              <p className="font-sub text-xs text-(--theme-primary) uppercase mb-4">
                {current.subtitle}
              </p>
              <p className="font-sub text-xs md:text-sm text-(--theme-muted) font-light max-w-xl mx-auto leading-relaxed">
                {current.content}
              </p>
            </div>
          </div>
        )}

        {/* =========================================================
            VARIAN 5: tabs-minimal-underline (Gaya Garis Bawah Minimalis)
           ========================================================= */}
        {variant === "tabs-minimal-underline" && (
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-center border-b border-(--theme-border) mb-8 gap-8">
              {data.tabs.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`pb-4 text-xs font-sub transition-all cursor-pointer relative ${
                    activeTab === i
                      ? "text-(--theme-primary) font-semibold"
                      : "text-(--theme-muted) hover:text-(--theme-text)"
                  }`}
                >
                  {t.label}
                  {activeTab === i && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-(--theme-primary)" />
                  )}
                </button>
              ))}
            </div>

            <div
              className="text-center p-6 bg-white/5 border border-(--theme-border) backdrop-blur-xl"
              style={{ borderRadius: "var(--theme-radius-box)" }}
            >
              <h3 className="font-heading text-lg font-semibold text-(--theme-text) mb-2">
                {current.title}
              </h3>
              <p className="font-sub text-xs text-(--theme-primary) uppercase tracking-wider mb-4">
                {current.subtitle}
              </p>
              <p className="font-sub text-xs md:text-sm text-(--theme-muted) font-light leading-relaxed">
                {current.content}
              </p>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
