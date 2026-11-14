import React from "react";
import Container from "@/components/ui/Container";
import { mediaUrl, mediaSrcSet, type MediaLike } from "@/lib/mediaUrl";

type Logo = {
  name: string;
  logoSrc?: MediaLike; // Mendukung sumber logo gambar opsional
};

type LogoCloudData = {
  variant?: string;
  sectionBadge?: string;
  sectionTitle?: string;
  sectionSubtitle?: string;
  logos: Logo[];
};

export default function LogoCloudBlock({
  data,
  themeLayout,
}: {
  data: LogoCloudData;
  themeLayout?: string;
}) {
  const v = data.variant || "logo-bordered-boxes";

  return (
    <section className="w-full py-16 relative overflow-hidden">
      <Container containerClass={themeLayout}>
        {/* HEADER SECTION */}
        {(data.sectionBadge || data.sectionTitle) && (
          <div className="text-center max-w-3xl mx-auto mb-10">
            {data.sectionBadge && (
              <div
                style={{ borderRadius: "var(--theme-radius-btn)" }}
                className="inline-block px-3 py-1 mb-3 text-xs font-medium tracking-wider text-(--theme-muted) uppercase bg-white/5 border border-(--theme-border) font-sub backdrop-blur-md"
              >
                {data.sectionBadge}
              </div>
            )}
            {data.sectionTitle && (
              <h2 className="font-sub text-xs md:text-sm text-(--theme-muted) uppercase tracking-widest font-light">
                {data.sectionTitle}
              </h2>
            )}
            {data.sectionSubtitle && (
              <p className="font-heading text-lg text-(--theme-text) mt-2 font-medium">
                {data.sectionSubtitle}
              </p>
            )}
          </div>
        )}

        {/* =========================================================
            VARIAN 1: logo-bordered-boxes (Grid Kotak Bergaris Border Rapi)
           ========================================================= */}
        {v === "logo-bordered-boxes" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {data.logos.map((l, i) => (
              <div
                key={i}
                style={{
                  borderRadius: "var(--theme-radius-box)",
                  boxShadow: "var(--theme-shadow)",
                }}
                className="p-6 bg-(--theme-surface)/30 border border-(--theme-border) text-center flex flex-col items-center justify-center backdrop-blur-xl group hover:border-(--theme-primary) transition-all duration-300 min-h-22.5"
              >
                {l.logoSrc ? (
                  <img
                    src={mediaUrl(l.logoSrc, "thumbnail")}
                    srcSet={mediaSrcSet(l.logoSrc, ["thumbnail", "card"])}
                    sizes="200px"
                    alt={l.name}
                    className="max-h-7 max-w-25 object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <span className="font-heading text-xs md:text-sm font-semibold text-(--theme-text) group-hover:text-(--theme-primary) transition-colors">
                    {l.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* =========================================================
            VARIAN 2: logo-grid-monochrome (Gaya Pilar Monokrom Bersih)
           ========================================================= */}
        {v === "logo-grid-monochrome" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {data.logos.map((l, i) => (
              <div
                key={i}
                style={{ borderRadius: "var(--theme-radius-btn)" }}
                className="p-5 bg-white/5 border border-(--theme-border) text-center flex items-center justify-center backdrop-blur-md group hover:bg-white/10 transition-colors"
              >
                {l.logoSrc ? (
                  <img
                    src={mediaUrl(l.logoSrc, "thumbnail")}
                    srcSet={mediaSrcSet(l.logoSrc, ["thumbnail", "card"])}
                    sizes="160px"
                    alt={l.name}
                    className="max-h-6 object-contain filter grayscale opacity-50 group-hover:opacity-100 transition-all"
                  />
                ) : (
                  <span className="font-mono text-xs text-(--theme-muted) group-hover:text-(--theme-text) uppercase tracking-wider">
                    {l.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* =========================================================
            VARIAN 3: logo-minimal-pills (Gaya Pil Mengapung Transparan)
           ========================================================= */}
        {v === "logo-minimal-pills" && (
          <div className="flex flex-wrap items-center justify-center gap-4">
            {data.logos.map((l, i) => (
              <div
                key={i}
                style={{ borderRadius: "var(--theme-radius-btn)" }}
                className="px-6 py-3 bg-(--theme-surface)/20 border border-(--theme-border) backdrop-blur-xl flex items-center gap-2.5 hover:border-(--theme-primary) transition-all"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-(--theme-primary)" />
                <span className="font-heading text-xs font-medium text-(--theme-text)">
                  {l.name}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================
            VARIAN 4: logo-glow-cards (Gaya Kartu Berpendar Futuristik)
           ========================================================= */}
        {v === "logo-glow-cards" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
            {data.logos.map((l, i) => (
              <div
                key={i}
                style={{ borderRadius: "var(--theme-radius-box)" }}
                className="p-6 bg-(--theme-surface)/50 border border-(--theme-border)/80 text-center flex flex-col items-center justify-center backdrop-blur-2xl relative overflow-hidden group hover:border-(--theme-primary) transition-all"
              >
                <div className="absolute inset-0 bg-(--theme-primary)/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="font-mono text-[9px] text-(--theme-primary) uppercase tracking-widest block mb-2 opacity-60">
                  // PARTNER_0{i + 1}
                </span>
                <span className="font-heading text-xs font-bold text-(--theme-text) relative z-10">
                  {l.name}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================
            VARIAN 5: logo-row-clean (Gaya Baris Tunggal Rapi Sebaris)
           ========================================================= */}
        {v === "logo-row-clean" && (
          <div
            className="p-6 bg-(--theme-surface)/20 border border-(--theme-border) backdrop-blur-xl flex flex-wrap items-center justify-between gap-6"
            style={{ borderRadius: "var(--theme-radius-box)" }}
          >
            {data.logos.map((l, i) => (
              <div key={i} className="text-center px-4">
                <span className="font-heading text-sm font-semibold text-(--theme-muted) hover:text-(--theme-text) transition-colors tracking-tight">
                  {l.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
