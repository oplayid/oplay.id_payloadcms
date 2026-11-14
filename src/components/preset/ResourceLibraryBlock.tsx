import React from "react";
import Container from "@/components/ui/Container";

type Resource = {
  title: string;
  category: string;
  description: string;
  fileType: string;
  fileSize: string;
  downloadHref: string;
};

type ResourceLibraryData = {
  variant?: string;
  sectionBadge?: string;
  sectionTitle: string;
  sectionSubtitle?: string;
  resources: Resource[];
};

export default function ResourceLibraryBlock({
  data,
  themeLayout,
}: {
  data: ResourceLibraryData;
  themeLayout?: string;
}) {
  const variant = data.variant || "resource-card-grid";

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
            VARIAN 1: resource-card-grid (Grid Kartu Standar Interaktif)
           ========================================================= */}
        {variant === "resource-card-grid" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.resources.map((r, i) => (
              <div
                key={i}
                style={{
                  borderRadius: "var(--theme-radius-box)",
                  boxShadow: "var(--theme-shadow)",
                }}
                className="p-8 bg-(--theme-surface)/30 border border-(--theme-border) flex flex-col justify-between backdrop-blur-xl group hover:border-(--theme-primary) transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-(--theme-primary)/5 rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-mono text-[10px] px-2.5 py-1 bg-white/5 border border-(--theme-border) text-(--theme-primary) uppercase tracking-wider rounded">
                      {r.fileType}
                    </span>
                    <span className="font-mono text-xs text-(--theme-muted)">
                      {r.fileSize}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-(--theme-muted) uppercase tracking-wider block mb-1">
                    {r.category}
                  </span>
                  <h3 className="font-heading text-lg font-semibold text-(--theme-text) mb-3 group-hover:text-(--theme-primary) transition-colors">
                    {r.title}
                  </h3>
                  <p className="font-sub text-xs text-(--theme-muted) font-light mb-8 leading-relaxed">
                    {r.description}
                  </p>
                </div>
                <a
                  href={r.downloadHref}
                  style={{ borderRadius: "var(--theme-radius-btn)" }}
                  className="w-full py-3 text-center text-xs font-medium uppercase tracking-wider bg-white/5 group-hover:bg-(--theme-primary) text-(--theme-text) group-hover:text-(--theme-primary-text) border border-(--theme-border) group-hover:border-transparent transition-all block shadow-sm"
                >
                  Unduh Dokumen ↓
                </a>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================
            VARIAN 2: resource-table-list (Gaya Daftar Baris Tabel Minimalis)
           ========================================================= */}
        {variant === "resource-table-list" && (
          <div
            style={{
              borderRadius: "var(--theme-radius-box)",
              boxShadow: "var(--theme-shadow)",
            }}
            className="max-w-4xl mx-auto bg-(--theme-surface)/30 border border-(--theme-border) backdrop-blur-xl overflow-hidden divide-y divide-(--theme-border)/50"
          >
            {data.resources.map((r, i) => (
              <div
                key={i}
                className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-white/5 transition-colors group"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] px-2 py-0.5 bg-white/5 border border-(--theme-border) text-(--theme-primary) rounded">
                      {r.fileType}
                    </span>
                    <span className="font-mono text-[10px] text-(--theme-muted) uppercase">
                      {r.category}
                    </span>
                  </div>
                  <h3 className="font-heading text-base font-semibold text-(--theme-text) group-hover:text-(--theme-primary) transition-colors">
                    {r.title}
                  </h3>
                  <p className="font-sub text-xs text-(--theme-muted) font-light">
                    {r.description}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end">
                  <span className="font-mono text-xs text-(--theme-muted)">
                    {r.fileSize}
                  </span>
                  <a
                    href={r.downloadHref}
                    style={{ borderRadius: "var(--theme-radius-btn)" }}
                    className="px-4 py-2 text-xs font-medium bg-(--theme-primary) text-(--theme-primary-text) uppercase"
                  >
                    Unduh
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================
            VARIAN 3: resource-featured-download (Sorotan Utama Dokumen Khusus)
           ========================================================= */}
        {variant === "resource-featured-download" && data.resources[0] && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div
              style={{
                borderRadius: "var(--theme-radius-box)",
                boxShadow: "var(--theme-shadow)",
              }}
              className="p-8 md:p-12 bg-(--theme-surface)/50 border border-(--theme-border) backdrop-blur-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-(--theme-primary) to-transparent" />
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div className="space-y-3">
                  <span className="font-mono text-[10px] px-3 py-1 bg-white/5 border border-(--theme-border) text-(--theme-primary) uppercase tracking-widest inline-block rounded">
                    FEATURED_DOCUMENT // {data.resources[0].fileType}
                  </span>
                  <h3 className="font-heading text-2xl md:text-3xl font-semibold text-(--theme-text)">
                    {data.resources[0].title}
                  </h3>
                  <p className="font-sub text-xs md:text-sm text-(--theme-muted) font-light max-w-xl leading-relaxed">
                    {data.resources[0].description}
                  </p>
                  <div className="font-mono text-xs text-(--theme-muted)">
                    Ukuran Berkas:{" "}
                    <strong className="text-(--theme-text)">
                      {data.resources[0].fileSize}
                    </strong>
                  </div>
                </div>
                <a
                  href={data.resources[0].downloadHref}
                  style={{ borderRadius: "var(--theme-radius-btn)" }}
                  className="px-6 py-3.5 text-xs font-medium uppercase tracking-wider bg-(--theme-primary) text-(--theme-primary-text) shrink-0 shadow-lg"
                >
                  Unduh Berkas Utama →
                </a>
              </div>
            </div>

            {/* Dokumen Tambahan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.resources.slice(1).map((r, i) => (
                <div
                  key={i}
                  style={{ borderRadius: "var(--theme-radius-box)" }}
                  className="p-6 bg-(--theme-surface)/30 border border-(--theme-border) backdrop-blur-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between mb-3">
                      <span className="font-mono text-[10px] px-2 py-0.5 bg-white/5 border border-(--theme-border) text-(--theme-primary)">
                        {r.fileType}
                      </span>
                      <span className="font-mono text-xs text-(--theme-muted)">
                        {r.fileSize}
                      </span>
                    </div>
                    <h4 className="font-heading text-base font-semibold text-(--theme-text) mb-2">
                      {r.title}
                    </h4>
                    <p className="font-sub text-xs text-(--theme-muted) font-light mb-4">
                      {r.description}
                    </p>
                  </div>
                  <a
                    href={r.downloadHref}
                    className="font-mono text-xs text-(--theme-primary) hover:underline"
                  >
                    Unduh Dokumen →
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================
            VARIAN 4: resource-category-tabs (Gaya Kategori Terkelompok)
           ========================================================= */}
        {variant === "resource-category-tabs" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.resources.map((r, i) => (
              <div
                key={i}
                style={{ borderRadius: "var(--theme-radius-box)" }}
                className="p-6 bg-(--theme-surface)/40 border border-(--theme-border) backdrop-blur-xl flex flex-col justify-between relative"
              >
                <div>
                  <div className="absolute top-6 right-6 font-mono text-[10px] text-(--theme-muted)">
                    [0{i + 1}]
                  </div>
                  <span className="font-mono text-[10px] uppercase text-(--theme-primary) block mb-2">
                    {r.category}
                  </span>
                  <h3 className="font-heading text-lg font-medium text-(--theme-text) mb-2">
                    {r.title}
                  </h3>
                  <p className="font-sub text-xs text-(--theme-muted) font-light mb-6">
                    {r.description}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-(--theme-border)/40 pt-4">
                  <span className="font-mono text-xs text-(--theme-muted)">
                    {r.fileType} ({r.fileSize})
                  </span>
                  <a
                    href={r.downloadHref}
                    style={{ borderRadius: "var(--theme-radius-btn)" }}
                    className="px-3 py-1.5 text-xs bg-white/5 hover:bg-(--theme-primary) text-(--theme-text) hover:text-(--theme-primary-text) border border-(--theme-border)"
                  >
                    Unduh
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================
            VARIAN 5: resource-minimal-card (Gaya Kartu Minimalis Bersih)
           ========================================================= */}
        {variant === "resource-minimal-card" && (
          <div className="max-w-3xl mx-auto space-y-4">
            {data.resources.map((r, i) => (
              <div
                key={i}
                style={{ borderRadius: "var(--theme-radius-box)" }}
                className="p-6 bg-white/5 border border-(--theme-border) backdrop-blur-xl flex items-center justify-between gap-6 hover:bg-white/10 transition-colors"
              >
                <div>
                  <h3 className="font-heading text-base font-semibold text-(--theme-text) mb-1">
                    {r.title}
                  </h3>
                  <p className="font-sub text-xs text-(--theme-muted) font-light">
                    {r.description}
                  </p>
                </div>
                <a
                  href={r.downloadHref}
                  className="font-mono text-xs px-3 py-1.5 rounded bg-(--theme-primary)/20 text-(--theme-primary) border border-(--theme-primary)/30 shrink-0"
                >
                  {r.fileType}
                </a>
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
