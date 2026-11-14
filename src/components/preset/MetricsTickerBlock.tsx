import React from "react";
import Container from "@/components/ui/Container";

type Metric = {
  label: string;
  value: string;
  trend?: string;
};

type MetricsTickerData = {
  variant?: string;
  sectionBadge?: string;
  sectionTitle?: string;
  sectionSubtitle?: string;
  metrics: Metric[];
};

export default function MetricsTickerBlock({
  data,
  themeLayout,
}: {
  data: MetricsTickerData;
  themeLayout?: string;
}) {
  const v = data.variant || "ticker-card";

  return (
    <section className="w-full py-16 relative overflow-hidden">
      <Container containerClass={themeLayout}>
        {/* HEADER SECTION (Opsional jika disediakan dari data) */}
        {(data.sectionBadge || data.sectionTitle) && (
          <div className="text-center max-w-3xl mx-auto mb-12">
            {data.sectionBadge && (
              <div
                style={{ borderRadius: "var(--theme-radius-btn)" }}
                className="inline-block px-3 py-1 mb-3 text-xs font-medium tracking-wider text-(--theme-muted) uppercase bg-white/5 border border-(--theme-border) font-sub backdrop-blur-md"
              >
                {data.sectionBadge}
              </div>
            )}
            {data.sectionTitle && (
              <h2 className="font-heading text-2xl md:text-4xl font-semibold tracking-tight text-(--theme-text) mb-2">
                {data.sectionTitle}
              </h2>
            )}
            {data.sectionSubtitle && (
              <p className="font-sub text-xs md:text-sm text-(--theme-muted) font-light">
                {data.sectionSubtitle}
              </p>
            )}
          </div>
        )}

        {/* =========================================================
            VARIAN 1: ticker-minimal (Gaya Garis Pemisah Minimalis)
           ========================================================= */}
        {v === "ticker-minimal" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-(--theme-border) py-8">
            {data.metrics.map((m, i) => (
              <div key={i} className="text-center group">
                <div className="font-heading text-3xl md:text-4xl font-semibold text-(--theme-text) group-hover:text-(--theme-primary) transition-colors">
                  {m.value}
                </div>
                <div className="font-sub text-xs text-(--theme-muted) uppercase tracking-wider mt-2">
                  {m.label}
                </div>
                {m.trend && (
                  <span className="font-mono text-[10px] text-emerald-400 mt-1 block">
                    {m.trend}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* =========================================================
            VARIAN 2: ticker-card (Gaya Kartu Grid Terkotak Standar)
           ========================================================= */}
        {v === "ticker-card" && (
          <div
            style={{
              borderRadius: "var(--theme-radius-box)",
              boxShadow: "var(--theme-shadow)",
            }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-(--theme-surface)/30 border border-(--theme-border) backdrop-blur-xl"
          >
            {data.metrics.map((m, i) => (
              <div
                key={i}
                className="flex flex-col justify-between p-4 bg-white/5 border border-(--theme-border)/50 rounded-xl group hover:border-(--theme-primary) transition-all"
                style={{ borderRadius: "var(--theme-radius-btn)" }}
              >
                <div className="font-heading text-3xl md:text-4xl font-bold text-(--theme-text) mb-3 group-hover:text-(--theme-primary) transition-colors">
                  {m.value}
                </div>
                <div className="font-sub text-xs text-(--theme-muted) uppercase border-t border-(--theme-border)/40 pt-3 flex justify-between items-center">
                  <span>{m.label}</span>
                  {m.trend && (
                    <span className="text-emerald-400 font-mono text-[10px] px-2 py-0.5 bg-emerald-500/10 rounded">
                      {m.trend}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================
            VARIAN 3: ticker-glow (Gaya Panel Efek Cahaya Futuristik)
           ========================================================= */}
        {v === "ticker-glow" && (
          <div
            style={{
              borderRadius: "var(--theme-radius-box)",
              boxShadow: "var(--theme-shadow)",
            }}
            className="relative p-8 md:p-12 bg-(--theme-surface)/40 border border-(--theme-primary)/30 overflow-hidden backdrop-blur-2xl"
          >
            <div className="absolute inset-0 bg-linear-to-r from-(--theme-primary)/10 via-transparent to-transparent pointer-events-none" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
              {data.metrics.map((m, i) => (
                <div key={i} className="flex flex-col">
                  <div className="font-heading text-4xl md:text-5xl font-bold text-(--theme-primary) mb-2">
                    {m.value}
                  </div>
                  <div className="font-sub text-xs text-(--theme-text) font-medium uppercase tracking-wide">
                    {m.label}
                  </div>
                  {m.trend && (
                    <span className="font-mono text-[10px] text-emerald-400 mt-2">
                      ↑ {m.trend}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================
            VARIAN 4: ticker-vertical (Gaya Daftar Tumpuk Vertikal Sempit)
           ========================================================= */}
        {v === "ticker-vertical" && (
          <div
            style={{
              borderRadius: "var(--theme-radius-box)",
              boxShadow: "var(--theme-shadow)",
            }}
            className="max-w-md mx-auto divide-y divide-(--theme-border) bg-(--theme-surface)/30 border border-(--theme-border) p-6 backdrop-blur-xl"
          >
            {data.metrics.map((m, i) => (
              <div
                key={i}
                className="py-4 flex items-center justify-between first:pt-0 last:pb-0"
              >
                <div>
                  <span className="font-sub text-xs text-(--theme-muted) uppercase tracking-wider block">
                    {m.label}
                  </span>
                  {m.trend && (
                    <span className="font-mono text-[10px] text-emerald-400">
                      {m.trend}
                    </span>
                  )}
                </div>
                <span className="font-heading text-2xl font-semibold text-(--theme-text)">
                  {m.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================
            VARIAN 5: ticker-compact (Gaya Bar Sebaris Kompak)
           ========================================================= */}
        {v === "ticker-compact" && (
          <div
            style={{ borderRadius: "var(--theme-radius-btn)" }}
            className="p-6 bg-white/5 border border-(--theme-border) backdrop-blur-xl flex flex-wrap items-center justify-around gap-6 text-center"
          >
            {data.metrics.map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="font-heading text-xl font-bold text-(--theme-primary)">
                  {m.value}
                </span>
                <span className="font-sub text-xs text-(--theme-muted) uppercase">
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
