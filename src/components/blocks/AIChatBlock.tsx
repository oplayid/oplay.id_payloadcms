import React from "react";
import Container from "@/components/ui/Container"; // (1) Mengimpor komponen Container terpusat

export default function AIChatBlock({
  data,
  themeLayout,
}: {
  data: any;
  themeLayout?: string;
}) {
  return (
    <section className="w-full py-16">
      {/* (2) Membungkus card menggunakan Container yang membaca konfigurasi layout dari JSON tema */}
      <Container containerClass={themeLayout}>
        <div
          style={{
            borderRadius: "var(--theme-radius-box)",
            boxShadow: "var(--theme-shadow)",
          }}
          className="bg-(--theme-surface) border border-(--theme-border) relative p-6 md:p-8 overflow-hidden group transition-all duration-300 hover:border-(--theme-border-hover)"
        >
          {/* Aksen Garis Laser / Glow Tech di Sudut Atas */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-(--theme-text)/40 to-transparent opacity-60" />

          {/* HEADER CHAT: Bergaya Terminal / Command Center */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-(--theme-border)/60">
            <div className="flex items-center space-x-3">
              <div className="relative flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping absolute" />
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]" />
              </div>
              <div>
                <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest block mb-0.5">
                  // SECURE_AI_SYSTEM
                </span>
                <h3 className="font-heading text-lg font-semibold tracking-tight text-(--theme-text)">
                  {data.title}
                </h3>
              </div>
            </div>

            {/* Badge Model AI berkesan High-Tech */}
            <div
              style={{ borderRadius: "var(--theme-radius-btn)" }}
              className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-white/5 border border-(--theme-border) backdrop-blur-md"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-(--theme-text)/60 animate-pulse" />
              <span className="font-mono text-xs text-(--theme-text) uppercase tracking-wider">
                {data.aiModel || "Oplay Core v4.2"}
              </span>
            </div>
          </div>

          {/* SIMULASI CHAT INTERAKTIF / PROMPT BAR */}
          <div className="relative flex gap-3">
            {/* Input dengan gaya terminal/input terkunci yang elegan */}
            <div className="relative w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-xs text-(--theme-muted)/60 select-none">
                &gt;
              </span>
              <input
                type="text"
                disabled
                placeholder={
                  data.placeholder ||
                  "Masukkan kueri hukum atau analisis dokumen..."
                }
                style={{ borderRadius: "var(--theme-radius-btn)" }}
                className="font-sub w-full bg-(--theme-bg)/60 border border-(--theme-border) pl-8 pr-4 py-3.5 text-sm text-(--theme-muted)/80 cursor-not-allowed focus:outline-none backdrop-blur-sm"
              />
            </div>

            {/* Tombol Kirim ala Command Button */}
            <button
              disabled
              style={{ borderRadius: "var(--theme-radius-btn)" }}
              className="font-sub bg-white/5 text-(--theme-muted) px-6 py-3.5 text-xs uppercase tracking-widest font-semibold cursor-not-allowed border border-(--theme-border) backdrop-blur-sm transition-all flex items-center gap-2 shrink-0"
            >
              <span>Proses</span>
              <span className="font-mono text-[10px] opacity-60">⌘</span>
            </button>
          </div>

          {/* Footer Indikator Enkripsi / Legal Compliance */}
          <div className="mt-4 flex items-center justify-between font-mono text-[10px] text-(--theme-muted)/50 tracking-wider">
            <span>STATUS: ENCRYPTED & SECURE</span>
            <span>CONFIDENTIAL LEGAL ENGINE</span>
          </div>
        </div>
      </Container>
    </section>
  );
}
