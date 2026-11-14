import React from "react";
import Container from "@/components/ui/Container";

type Service = {
  serviceName: string;
  uptimePercentage: string;
  statusText: string;
  latency?: string;
};

type LiveStatusData = {
  variant?: string;
  sectionBadge?: string;
  sectionTitle: string;
  sectionSubtitle?: string;
  overallStatusText?: string;
  services: Service[];
};

export default function LiveStatusBlock({
  data,
  themeLayout,
}: {
  data: LiveStatusData;
  themeLayout?: string;
}) {
  const v = data.variant || "status-list-standard";

  return (
    <section className="w-full py-20 relative overflow-hidden">
      <Container containerClass={themeLayout}>
        {/* HEADER SECTION */}
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
            VARIAN 1: status-list-standard (Panel Papan Pemantauan Standar)
           ========================================================= */}
        {v === "status-list-standard" && (
          <div
            style={{
              borderRadius: "var(--theme-radius-box)",
              boxShadow: "var(--theme-shadow)",
            }}
            className="max-w-4xl mx-auto bg-(--theme-surface)/30 border border-(--theme-border) backdrop-blur-xl overflow-hidden"
          >
            <div className="p-6 bg-white/5 border-b border-(--theme-border) flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-heading text-xs md:text-sm font-semibold text-(--theme-text)">
                  {data.overallStatusText ||
                    "Seluruh Layanan Beroperasi Normal"}
                </span>
              </div>
              <span className="font-mono text-[10px] uppercase text-(--theme-muted) bg-white/5 px-2.5 py-1 border border-(--theme-border) rounded">
                SYSTEM_LIVE_UPTIME
              </span>
            </div>
            <div className="divide-y divide-(--theme-border)/50">
              {data.services.map((s, i) => (
                <div
                  key={i}
                  className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <div>
                      <span className="font-heading text-sm font-medium text-(--theme-text) block">
                        {s.serviceName}
                      </span>
                      <span className="font-mono text-[10px] text-(--theme-muted) uppercase">
                        {s.statusText || "Operational"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    {s.latency && (
                      <span className="font-mono text-[10px] text-(--theme-muted)">
                        {s.latency}
                      </span>
                    )}
                    <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {s.uptimePercentage}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================
            VARIAN 2: status-card-grid (Grid Kartu Terpisah per Layanan)
           ========================================================= */}
        {v === "status-card-grid" && (
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.services.map((s, i) => (
              <div
                key={i}
                style={{
                  borderRadius: "var(--theme-radius-box)",
                  boxShadow: "var(--theme-shadow)",
                }}
                className="p-6 bg-(--theme-surface)/30 border border-(--theme-border) backdrop-blur-xl flex flex-col justify-between group hover:border-(--theme-primary) transition-all"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="font-mono text-[10px] text-(--theme-primary) uppercase tracking-widest block mb-1">
                      // NODE_0{i + 1}
                    </span>
                    <h3 className="font-heading text-base font-semibold text-(--theme-text)">
                      {s.serviceName}
                    </h3>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                </div>
                <div className="border-t border-(--theme-border)/40 pt-4 flex items-center justify-between">
                  <span className="font-mono text-xs text-(--theme-muted)">
                    Status:{" "}
                    <strong className="text-(--theme-text)">
                      {s.statusText}
                    </strong>
                  </span>
                  <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {s.uptimePercentage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================
            VARIAN 3: status-minimal-line (Gaya Garis Minimalis Bersih)
           ========================================================= */}
        {v === "status-minimal-line" && (
          <div className="max-w-3xl mx-auto space-y-4">
            {data.services.map((s, i) => (
              <div
                key={i}
                style={{ borderRadius: "var(--theme-radius-btn)" }}
                className="p-4 bg-white/5 border border-(--theme-border) backdrop-blur-xl flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-heading text-xs md:text-sm font-medium text-(--theme-text)">
                    {s.serviceName}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-(--theme-muted)">
                    {s.statusText}
                  </span>
                  <span className="font-mono text-xs text-emerald-400">
                    {s.uptimePercentage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================
            VARIAN 4: status-terminal-panel (Panel Gaya Terminal Konsol)
           ========================================================= */}
        {v === "status-terminal-panel" && (
          <div
            style={{ borderRadius: "var(--theme-radius-box)" }}
            className="max-w-4xl mx-auto p-8 bg-(--theme-surface)/50 border border-(--theme-primary)/30 backdrop-blur-2xl relative shadow-2xl font-mono text-xs"
          >
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-(--theme-border)/60 text-(--theme-muted)">
              <span>$ systemctl status oplay-infra</span>
              <span className="text-emerald-400">STATUS: ALL_GREEN</span>
            </div>
            <div className="space-y-4">
              {data.services.map((s, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-2 border-b border-(--theme-border)/20"
                >
                  <span className="text-(--theme-text)">[{s.serviceName}]</span>
                  <div className="flex gap-4">
                    <span className="text-(--theme-muted)">{s.statusText}</span>
                    <span className="text-emerald-400 font-bold">
                      {s.uptimePercentage}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================
            VARIAN 5: status-compact-badge (Gaya Lencana Baris Ringkas)
           ========================================================= */}
        {v === "status-compact-badge" && (
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-4">
            {data.services.map((s, i) => (
              <div
                key={i}
                style={{ borderRadius: "var(--theme-radius-btn)" }}
                className="px-5 py-3 bg-(--theme-surface)/30 border border-(--theme-border) backdrop-blur-xl flex items-center gap-3"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-heading text-xs font-semibold text-(--theme-text)">
                  {s.serviceName}:
                </span>
                <span className="font-mono text-xs text-emerald-400">
                  {s.uptimePercentage}
                </span>
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
