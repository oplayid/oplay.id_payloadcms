import React from "react";
import Container from "@/components/ui/Container";

type Integration = {
  name: string;
  category: string;
  description: string;
  status?: string;
};

type IntegrationGridData = {
  variant?: string;
  sectionBadge?: string;
  sectionTitle: string;
  sectionSubtitle?: string;
  integrations: Integration[];
};

export default function IntegrationGridBlock({
  data,
  themeLayout,
}: {
  data: IntegrationGridData;
  themeLayout?: string;
}) {
  const v = data.variant || "integration-grid-standard";

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
            VARIAN 1: integration-grid-standard (Grid Kartu Standar Rapi)
           ========================================================= */}
        {v === "integration-grid-standard" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.integrations.map((item, i) => (
              <div
                key={i}
                style={{
                  borderRadius: "var(--theme-radius-box)",
                  boxShadow: "var(--theme-shadow)",
                }}
                className="p-8 bg-(--theme-surface)/30 border border-(--theme-border) flex flex-col justify-between backdrop-blur-xl group hover:border-(--theme-primary) transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-28 h-28 bg-(--theme-primary)/5 rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-mono text-[10px] text-(--theme-primary) uppercase tracking-wider bg-(--theme-primary)/10 px-2.5 py-1 rounded border border-(--theme-primary)/20">
                      {item.category}
                    </span>
                    {item.status && (
                      <span className="font-mono text-[10px] px-2.5 py-1 bg-white/5 border border-(--theme-border) text-(--theme-muted) uppercase rounded">
                        {item.status}
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-(--theme-text) mb-3 group-hover:text-(--theme-primary) transition-colors">
                    {item.name}
                  </h3>
                  <p className="font-sub text-xs text-(--theme-muted) font-light leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================
            VARIAN 2: integration-horizontal-list (Gaya Daftar Baris Melebar)
           ========================================================= */}
        {v === "integration-horizontal-list" && (
          <div className="max-w-4xl mx-auto space-y-4">
            {data.integrations.map((item, i) => (
              <div
                key={i}
                style={{ borderRadius: "var(--theme-radius-box)" }}
                className="p-6 bg-(--theme-surface)/30 border border-(--theme-border) backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-white/5 transition-colors"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-(--theme-primary) uppercase">
                      //{item.category}
                    </span>
                    {item.status && (
                      <span className="font-mono text-[10px] px-2 py-0.5 bg-white/5 border border-(--theme-border) rounded text-(--theme-muted)">
                        {item.status}
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading text-base font-semibold text-(--theme-text)">
                    {item.name}
                  </h3>
                  <p className="font-sub text-xs text-(--theme-muted) font-light">
                    {item.description}
                  </p>
                </div>
                <span className="font-mono text-[10px] text-(--theme-primary) bg-white/5 px-3 py-1.5 border border-(--theme-border) rounded shrink-0">
                  CONNECT →
                </span>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================
            VARIAN 3: integration-category-grouped (Gaya Kelompok Grid Kolom Ganda)
           ========================================================= */}
        {v === "integration-category-grouped" && (
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.integrations.map((item, i) => (
              <div
                key={i}
                style={{ borderRadius: "var(--theme-radius-box)" }}
                className="p-8 bg-(--theme-surface)/40 border border-(--theme-border) backdrop-blur-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-mono text-[10px] uppercase text-(--theme-primary) px-2.5 py-0.5 bg-white/5 border border-(--theme-border) rounded">
                      {item.category}
                    </span>
                    {item.status && (
                      <span className="font-mono text-[10px] text-emerald-400">
                        ● {item.status}
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-(--theme-text) mb-2">
                    {item.name}
                  </h3>
                  <p className="font-sub text-xs md:text-sm text-(--theme-muted) font-light leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================
            VARIAN 4: integration-glow-cards (Gaya Kartu Berpendar Holografik)
           ========================================================= */}
        {v === "integration-glow-cards" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.integrations.map((item, i) => (
              <div
                key={i}
                style={{ borderRadius: "var(--theme-radius-box)" }}
                className="p-8 bg-(--theme-surface)/50 border border-(--theme-primary)/30 backdrop-blur-2xl relative overflow-hidden group hover:border-(--theme-primary) transition-all shadow-xl"
              >
                <div className="absolute inset-0 bg-linear-to-br from-(--theme-primary)/10 via-transparent to-transparent pointer-events-none" />
                <span className="font-mono text-[10px] text-(--theme-primary) uppercase tracking-widest block mb-3">
                  INTEGRATION // 0{i + 1}
                </span>
                <h3 className="font-heading text-lg font-semibold text-(--theme-text) mb-2">
                  {item.name}
                </h3>
                <p className="font-sub text-xs text-(--theme-muted) font-light leading-relaxed mb-6">
                  {item.description}
                </p>
                <div className="flex justify-between items-center border-t border-(--theme-border)/40 pt-4 font-mono text-[10px] text-(--theme-muted)">
                  <span>CAT: {item.category}</span>
                  <span className="text-(--theme-primary)">ACTIVE</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================
            VARIAN 5: integration-minimal-pills (Gaya Pil Transparan Minimalis)
           ========================================================= */}
        {v === "integration-minimal-pills" && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {data.integrations.map((item, i) => (
              <div
                key={i}
                style={{ borderRadius: "var(--theme-radius-box)" }}
                className="p-6 bg-white/5 border border-(--theme-border) backdrop-blur-xl flex flex-col justify-between hover:bg-white/10 transition-colors"
              >
                <div>
                  <span className="font-mono text-[10px] text-(--theme-primary) uppercase block mb-1">
                    {item.category}
                  </span>
                  <h3 className="font-heading text-base font-semibold text-(--theme-text) mb-2">
                    {item.name}
                  </h3>
                  <p className="font-sub text-xs text-(--theme-muted) font-light line-clamp-3">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
