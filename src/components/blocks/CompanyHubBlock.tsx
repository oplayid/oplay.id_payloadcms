"use client";

import React, { useState, useEffect } from "react";
import Container from "@/components/ui/Container"; // (1) Mengimpor komponen Container terpusat

type CompanyTab = {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  content: string;
  extraDetails?: { label: string; value: string }[];
};

type CompanyHubData = {
  sectionBadge?: string;
  tabs: CompanyTab[];
};

// (2) Menambahkan prop opsional themeLayout agar bisa menerima string kelas layout dari JSON tema
export default function CompanyHubBlock({
  data,
  themeLayout,
}: {
  data: CompanyHubData;
  themeLayout?: string;
}) {
  const defaultTab = data.tabs[0]?.id || "about";
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      const matchedTab = data.tabs.find((t) => t.id === hash);
      if (matchedTab) {
        setActiveTab(matchedTab.id);
      }
    };

    if (window.location.hash) {
      handleHashChange();
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [data.tabs]);

  const handleTabClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setActiveTab(id);
    window.history.pushState(null, "", `#${id}`);
  };

  return (
    <section className="w-full py-16">
      {/* (3) Mengganti div pembungkus berukuran statis "mx-auto max-w-5xl" dengan komponen Container yang membaca konfigurasi layout JSON tema */}
      <Container containerClass={themeLayout}>
        {/* SECTION BADGE */}
        {data.sectionBadge && (
          <div className="text-center mb-6">
            <span
              style={{ borderRadius: "var(--theme-radius-btn)" }}
              className="inline-block px-3 py-1 text-xs font-medium tracking-wider text-(--theme-muted) uppercase bg-white/5 border border-(--theme-border) font-sub"
            >
              {data.sectionBadge}
            </span>
          </div>
        )}

        {/* NAVIGASI ANCHOR TAB */}
        <div className="flex flex-wrap justify-center gap-3 mb-12 border-b border-(--theme-border)/50 pb-6">
          {data.tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <a
                key={tab.id}
                href={`#${tab.id}`}
                onClick={(e) => handleTabClick(tab.id, e)}
                style={{ borderRadius: "var(--theme-radius-btn)" }}
                className={`px-6 py-2.5 text-xs md:text-sm font-medium transition-all duration-300 font-sub tracking-wider uppercase ${
                  isActive
                    ? "bg-(--theme-text) text-(--theme-bg) shadow-lg scale-105"
                    : "bg-(--theme-surface)/40 text-(--theme-muted) border border-(--theme-border) hover:text-(--theme-text) hover:bg-white/5"
                }`}
              >
                {tab.label}
              </a>
            );
          })}
        </div>

        {/* KONTEN TAB */}
        <div
          style={{
            borderRadius: "var(--theme-radius-box)",
            boxShadow: "var(--theme-shadow)",
          }}
          className="relative p-8 md:p-12 bg-(--theme-surface)/30 border border-(--theme-border) backdrop-blur-xl transition-all duration-500"
        >
          {data.tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <div
                key={tab.id}
                className={`${isActive ? "block animate-fadeIn" : "hidden"}`}
              >
                <div className="max-w-3xl">
                  {/* Tag H2 untuk Judul Tab */}
                  <h2 className="font-heading text-3xl md:text-4xl font-semibold text-(--theme-text) mb-4">
                    {tab.title}
                  </h2>
                  <p className="font-sub text-base md:text-lg text-(--theme-muted) font-light leading-relaxed mb-8">
                    {tab.subtitle}
                  </p>

                  <div className="font-sub text-sm text-(--theme-text)/90 font-light leading-relaxed border-t border-(--theme-border)/50 pt-6 space-y-4">
                    <p>{tab.content}</p>
                  </div>

                  {tab.extraDetails && tab.extraDetails.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-6 border-t border-(--theme-border)/50">
                      {tab.extraDetails.map((item, idx) => (
                        <div
                          key={idx}
                          style={{ borderRadius: "var(--theme-radius-btn)" }}
                          className="p-4 bg-white/5 border border-(--theme-border)"
                        >
                          <span className="font-sub text-[10px] text-(--theme-muted) uppercase tracking-widest block mb-1">
                            {item.label}
                          </span>
                          <span className="font-heading text-sm font-medium text-(--theme-text)">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
