import React from "react";
import Container from "@/components/ui/Container";

type Item = { text: string };
type Data = {
  variant?: string;
  sectionBadge?: string;
  sectionTitle: string;
  sectionSubtitle?: string;
  beforeTitle: string;
  beforeItems: Item[];
  afterTitle: string;
  afterItems: Item[];
};

export default function ComparisonSplitBlock({
  data,
  themeLayout,
}: {
  data: Data;
  themeLayout?: string;
}) {
  const v = data.variant || "comparison-two-columns";

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
            1. comparison-two-columns (Dua Kolom Sejajar Standar)
           ========================================================= */}
        {v === "comparison-two-columns" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div
              style={{
                borderRadius: "var(--theme-radius-box)",
                boxShadow: "var(--theme-shadow)",
              }}
              className="p-8 md:p-10 bg-(--theme-surface)/30 border border-(--theme-border) backdrop-blur-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-(--theme-border)">
                  <span className="w-2.5 h-2.5 rounded-full bg-(--theme-danger)/80" />
                  <h3 className="font-heading text-lg font-medium text-(--theme-muted)">
                    {data.beforeTitle}
                  </h3>
                </div>
                <ul className="space-y-4">
                  {data.beforeItems.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-xs md:text-sm text-(--theme-muted) font-light leading-relaxed"
                    >
                      <span className="text-(--theme-danger) font-mono font-bold mt-0.5">
                        ✕
                      </span>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div
              style={{
                borderRadius: "var(--theme-radius-box)",
                boxShadow: "var(--theme-shadow)",
              }}
              className="p-8 md:p-10 bg-(--theme-surface)/40 border border-(--theme-primary)/40 backdrop-blur-xl flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-(--theme-primary)/40 to-transparent" />
              <div>
                <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-(--theme-border)">
                  <span className="w-2.5 h-2.5 rounded-full bg-(--theme-success) animate-pulse" />
                  <h3 className="font-heading text-lg font-medium text-(--theme-text)">
                    {data.afterTitle}
                  </h3>
                </div>
                <ul className="space-y-4">
                  {data.afterItems.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-xs md:text-sm text-(--theme-text) font-light leading-relaxed"
                    >
                      <span className="text-(--theme-success) font-mono font-bold mt-0.5">
                        ✓
                      </span>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            2. comparison-vs-badge (Komparasi dengan Lencana VS di Tengah)
           ========================================================= */}
        {v === "comparison-vs-badge" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-5xl mx-auto items-center">
            <div
              style={{ borderRadius: "var(--theme-radius-box)" }}
              className="md:col-span-5 p-8 bg-(--theme-surface)/30 border border-(--theme-border) backdrop-blur-xl"
            >
              <h3 className="font-heading text-lg font-medium text-(--theme-muted) mb-6">
                {data.beforeTitle}
              </h3>
              <ul className="space-y-3">
                {data.beforeItems.map((item, i) => (
                  <li
                    key={i}
                    className="text-xs md:text-sm text-(--theme-muted) font-light flex items-center gap-2"
                  >
                    <span className="text-(--theme-danger)">✕</span> {item.text}
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-2 flex justify-center my-4 md:my-0">
              <div
                style={{ borderRadius: "var(--theme-radius-btn)" }}
                className="w-12 h-12 bg-(--theme-primary) text-(--theme-primary-text) font-heading text-xs font-bold flex items-center justify-center shadow-md border border-(--theme-border)"
              >
                VS
              </div>
            </div>

            <div
              style={{
                borderRadius: "var(--theme-radius-box)",
                boxShadow: "var(--theme-shadow)",
              }}
              className="md:col-span-5 p-8 bg-(--theme-surface)/40 border border-(--theme-primary)/50 backdrop-blur-xl"
            >
              <h3 className="font-heading text-lg font-medium text-(--theme-text) mb-6">
                {data.afterTitle}
              </h3>
              <ul className="space-y-3">
                {data.afterItems.map((item, i) => (
                  <li
                    key={i}
                    className="text-xs md:text-sm text-(--theme-text) font-light flex items-center gap-2"
                  >
                    <span className="text-(--theme-success)">✓</span>{" "}
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* =========================================================
            3. comparison-table-format (Format Tabel Komparasi Bergaris)
           ========================================================= */}
        {v === "comparison-table-format" && (
          <div
            style={{
              borderRadius: "var(--theme-radius-box)",
              boxShadow: "var(--theme-shadow)",
            }}
            className="max-w-4xl mx-auto bg-(--theme-surface)/30 border border-(--theme-border) overflow-hidden backdrop-blur-xl"
          >
            <div className="grid grid-cols-2 border-b border-(--theme-border) bg-white/5 font-heading text-xs uppercase tracking-wider">
              <div className="p-4 text-(--theme-muted)">{data.beforeTitle}</div>
              <div className="p-4 text-(--theme-primary) border-l border-(--theme-border)">
                {data.afterTitle}
              </div>
            </div>
            <div className="divide-y divide-(--theme-border)/50">
              {Array.from({
                length: Math.max(
                  data.beforeItems.length,
                  data.afterItems.length,
                ),
              }).map((_, i) => (
                <div key={i} className="grid grid-cols-2 text-xs md:text-sm">
                  <div className="p-4 text-(--theme-muted) font-light flex items-start gap-2">
                    <span className="text-(--theme-danger)">✕</span>{" "}
                    {data.beforeItems[i]?.text || "-"}
                  </div>
                  <div className="p-4 text-(--theme-text) font-light border-l border-(--theme-border) flex items-start gap-2 bg-(--theme-primary)/5">
                    <span className="text-(--theme-success)">✓</span>{" "}
                    {data.afterItems[i]?.text || "-"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================
            4. comparison-cards-stacked (Kartu Bertumpuk Vertikal)
           ========================================================= */}
        {v === "comparison-cards-stacked" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div
              style={{ borderRadius: "var(--theme-radius-box)" }}
              className="p-6 bg-(--theme-surface)/30 border border-(--theme-border) backdrop-blur-xl"
            >
              <h3 className="font-heading text-base font-semibold text-(--theme-muted) mb-4">
                ✕ {data.beforeTitle}
              </h3>
              <div className="space-y-2">
                {data.beforeItems.map((item, i) => (
                  <div
                    key={i}
                    style={{ borderRadius: "var(--theme-radius-btn)" }}
                    className="p-3 bg-white/5 border border-(--theme-border) text-xs text-(--theme-muted) font-light"
                  >
                    {item.text}
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{ borderRadius: "var(--theme-radius-box)" }}
              className="p-6 bg-(--theme-surface)/40 border border-(--theme-primary)/40 backdrop-blur-xl"
            >
              <h3 className="font-heading text-base font-semibold text-(--theme-text) mb-4">
                ✓ {data.afterTitle}
              </h3>
              <div className="space-y-2">
                {data.afterItems.map((item, i) => (
                  <div
                    key={i}
                    style={{ borderRadius: "var(--theme-radius-btn)" }}
                    className="p-3 bg-(--theme-primary)/10 border border-(--theme-primary)/30 text-xs text-(--theme-text) font-light"
                  >
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            5. comparison-highlight-after (Sorotan Utama Sisi Sesudah)
           ========================================================= */}
        {v === "comparison-highlight-after" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
            <div
              style={{ borderRadius: "var(--theme-radius-box)" }}
              className="md:col-span-1 p-6 bg-(--theme-surface)/30 border border-(--theme-border) flex flex-col justify-between opacity-80 backdrop-blur-xl"
            >
              <div>
                <h4 className="font-heading text-sm font-semibold text-(--theme-muted) mb-4">
                  {data.beforeTitle}
                </h4>
                <ul className="space-y-3">
                  {data.beforeItems.map((item, i) => (
                    <li
                      key={i}
                      className="text-xs text-(--theme-muted) font-light flex gap-2"
                    >
                      <span>✕</span> {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div
              style={{
                borderRadius: "var(--theme-radius-box)",
                boxShadow: "var(--theme-shadow)",
              }}
              className="md:col-span-2 p-8 bg-(--theme-surface)/50 border border-(--theme-primary) relative overflow-hidden flex flex-col justify-between backdrop-blur-2xl"
            >
              <div
                style={{ borderRadius: "var(--theme-radius-btn)" }}
                className="absolute top-0 right-0 bg-(--theme-primary) text-(--theme-primary-text) font-mono text-[10px] px-3 py-1 m-4"
              >
                RECOMMENDED
              </div>
              <div>
                <h4 className="font-heading text-lg font-semibold text-(--theme-text) mb-4">
                  {data.afterTitle}
                </h4>
                <ul className="space-y-4">
                  {data.afterItems.map((item, i) => (
                    <li
                      key={i}
                      className="text-xs md:text-sm text-(--theme-text) font-light flex items-center gap-3"
                    >
                      <span className="w-2 h-2 rounded-full bg-(--theme-success) shrink-0" />
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
