"use client";

import React, { useState } from "react";
import Container from "@/components/ui/Container";
import { COMPONENT_REGISTRY } from "./componentRegistry"; // Mengambil langsung dari file pusat!

export default function VariantReferenceHub({
  themeLayout,
}: {
  themeLayout?: string;
}) {
  const [selectedComp, setSelectedComp] = useState(COMPONENT_REGISTRY[0]);
  const [copiedVariant, setCopiedVariant] = useState<string | null>(null);

  const handleCopy = (variantName: string) => {
    navigator.clipboard.writeText(variantName);
    setCopiedVariant(variantName);
    setTimeout(() => setCopiedVariant(null), 1500);
  };

  return (
    <section className="w-full py-16">
      <Container containerClass={themeLayout}>
        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span
            style={{ borderRadius: "var(--theme-radius-btn)" }}
            className="inline-block px-3 py-1 mb-3 text-xs font-medium tracking-wider text-(--theme-muted) uppercase bg-white/5 border border-(--theme-border) font-sub"
          >
            Pusat Referensi Varian // Skala Otomatis (
            {COMPONENT_REGISTRY.length} Modul Aktif)
          </span>
          <h2 className="font-heading text-2xl md:text-4xl font-semibold tracking-tight text-(--theme-text) mb-3">
            Pilih & Salin Varian JSON
          </h2>
          <p className="font-sub text-xs md:text-sm text-(--theme-muted) font-light">
            Daftar komponen dan varian di bawah ini terhubung secara otomatis
            dari sistem registry pusat.
          </p>
        </div>

        {/* KONTROL UTAMA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sisi Kiri: Daftar Komponen Dinamis */}
          <div
            style={{
              borderRadius: "var(--theme-radius-box)",
              boxShadow: "var(--theme-shadow)",
            }}
            className="p-4 bg-(--theme-surface)/30 border border-(--theme-border) backdrop-blur-xl flex flex-col gap-2 max-h-150 overflow-y-auto"
          >
            <div className="px-3 py-2 text-[10px] font-mono text-(--theme-muted) uppercase tracking-widest border-b border-(--theme-border)/50 mb-1 flex justify-between items-center">
              <span>Total Modul</span>
              <span className="font-bold text-(--theme-text)">
                {COMPONENT_REGISTRY.length}
              </span>
            </div>
            {COMPONENT_REGISTRY.map((comp, idx) => {
              const isSelected = selectedComp.type === comp.type;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedComp(comp)}
                  className={`w-full text-left px-4 py-3 transition-all flex items-center justify-between font-sub cursor-pointer ${
                    isSelected
                      ? "bg-(--theme-primary) text-(--theme-primary-text) font-medium shadow-md"
                      : "bg-white/5 hover:bg-white/10 text-(--theme-text) border border-(--theme-border)/40"
                  }`}
                  style={{ borderRadius: "var(--theme-radius-btn)" }}
                >
                  <div className="truncate pr-2">
                    <span className="text-xs block font-heading font-semibold">
                      {comp.type}
                    </span>
                    <span
                      className={`text-[10px] ${isSelected ? "text-white/80" : "text-(--theme-muted)"}`}
                    >
                      {comp.category}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${
                      isSelected
                        ? "bg-white/20 text-white border-white/30"
                        : "bg-white/5 text-(--theme-muted) border-(--theme-border)"
                    }`}
                  >
                    {comp.variants.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sisi Kanan: Detail Varian */}
          <div
            style={{
              borderRadius: "var(--theme-radius-box)",
              boxShadow: "var(--theme-shadow)",
            }}
            className="lg:col-span-2 p-8 bg-(--theme-surface)/40 border border-(--theme-border) backdrop-blur-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-(--theme-border)/50 mb-8">
                <div>
                  <span className="font-mono text-[10px] text-(--theme-primary) uppercase tracking-widest block mb-1">
                    {selectedComp.category}
                  </span>
                  <h3 className="font-heading text-2xl font-semibold text-(--theme-text)">
                    {selectedComp.type}
                  </h3>
                </div>
                <div
                  style={{ borderRadius: "var(--theme-radius-btn)" }}
                  className="px-3 py-1 bg-white/5 border border-(--theme-border) text-xs font-mono text-(--theme-muted) w-fit"
                >
                  Varian Tersedia:{" "}
                  <strong className="text-(--theme-text)">
                    {selectedComp.variants.length}
                  </strong>
                </div>
              </div>

              {/* Grid Tombol Pilihan Varian */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedComp.variants.map((variantName, vIdx) => {
                  const isCopied = copiedVariant === variantName;
                  return (
                    <button
                      key={vIdx}
                      onClick={() => handleCopy(variantName)}
                      style={{ borderRadius: "var(--theme-radius-box)" }}
                      className={`p-4 text-left border transition-all flex items-center justify-between group cursor-pointer ${
                        isCopied
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                          : "bg-white/5 hover:bg-white/10 border-(--theme-border) text-(--theme-text) hover:border-(--theme-border-hover)"
                      }`}
                    >
                      <div className="truncate pr-2">
                        <span className="font-mono text-xs font-semibold block group-hover:text-(--theme-primary) transition-colors truncate">
                          {variantName}
                        </span>
                        <span className="font-sub text-[10px] text-(--theme-muted) mt-0.5 block">
                          Varian #{vIdx + 1}
                        </span>
                      </div>
                      <span className="font-mono text-xs opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
                        {isCopied ? "✓ Disalin" : "Salin 📋"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Catatan Bawah */}
            <div className="mt-8 pt-6 border-t border-(--theme-border)/40 text-[10px] font-mono text-(--theme-muted)/70 uppercase tracking-widest flex items-center justify-between">
              <span>// CENTRAL_REGISTRY_SYNCED</span>
              <span>READY_TO_USE</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
