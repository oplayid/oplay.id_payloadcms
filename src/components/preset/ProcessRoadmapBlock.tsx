import React from "react";
import Container from "@/components/ui/Container";

type Step = {
  stepNumber: string;
  title: string;
  description: string;
};

type ProcessRoadmapData = {
  variant?: string;
  sectionBadge?: string;
  sectionTitle: string;
  sectionSubtitle?: string;
  steps: Step[];
};

export default function ProcessRoadmapBlock({
  data,
  themeLayout,
}: {
  data: ProcessRoadmapData;
  themeLayout?: string;
}) {
  const variant = data.variant || "roadmap-horizontal-cards";

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
            VARIAN 1: roadmap-horizontal-cards (Grid Kartu Horizontal Sejajar)
           ========================================================= */}
        {variant === "roadmap-horizontal-cards" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {data.steps.map((s, i) => (
              <div
                key={i}
                style={{
                  borderRadius: "var(--theme-radius-box)",
                  boxShadow: "var(--theme-shadow)",
                }}
                className="p-8 bg-(--theme-surface)/30 border border-(--theme-border) flex flex-col justify-between backdrop-blur-xl group hover:border-(--theme-primary) transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-(--theme-primary)/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div>
                  <span className="font-mono text-xs px-2.5 py-1 bg-(--theme-primary)/10 text-(--theme-primary) border border-(--theme-primary)/30 rounded font-bold mb-4 inline-block">
                    {s.stepNumber}
                  </span>
                  <h3 className="font-heading text-lg font-semibold text-(--theme-text) mb-3 group-hover:text-(--theme-primary) transition-colors">
                    {s.title}
                  </h3>
                  <p className="font-sub text-xs text-(--theme-muted) font-light leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================
            VARIAN 2: roadmap-vertical-timeline (Garis Waktu Vertikal ke Bawah)
           ========================================================= */}
        {variant === "roadmap-vertical-timeline" && (
          <div className="max-w-3xl mx-auto space-y-6 relative before:absolute before:inset-0 before:left-6 before:w-0.5 before:bg-(--theme-border)">
            {data.steps.map((s, i) => (
              <div
                key={i}
                style={{
                  borderRadius: "var(--theme-radius-box)",
                  boxShadow: "var(--theme-shadow)",
                }}
                className="relative pl-14 p-6 bg-(--theme-surface)/30 border border-(--theme-border) backdrop-blur-xl group hover:border-(--theme-border-hover) transition-all"
              >
                <div className="absolute left-3 -translate-x-1/2 top-6 w-8 h-8 rounded-full bg-(--theme-primary) text-(--theme-primary-text) flex items-center justify-center font-mono text-xs font-bold shadow-md">
                  {s.stepNumber}
                </div>
                <h3 className="font-heading text-lg font-semibold text-(--theme-text) mb-2 group-hover:text-(--theme-primary) transition-colors">
                  {s.title}
                </h3>
                <p className="font-sub text-xs md:text-sm text-(--theme-muted) font-light leading-relaxed">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================
            VARIAN 3: roadmap-numbered-steps (Gaya Nomor Besar Menonjol)
           ========================================================= */}
        {variant === "roadmap-numbered-steps" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {data.steps.map((s, i) => (
              <div
                key={i}
                style={{ borderRadius: "var(--theme-radius-box)" }}
                className="p-8 bg-(--theme-surface)/40 border border-(--theme-border) backdrop-blur-xl relative flex flex-col justify-between group"
              >
                <div>
                  <span className="font-heading text-4xl md:text-5xl font-extrabold text-(--theme-primary)/30 group-hover:text-(--theme-primary) transition-colors block mb-4">
                    {s.stepNumber}
                  </span>
                  <h3 className="font-heading text-base font-semibold text-(--theme-text) mb-2">
                    {s.title}
                  </h3>
                  <p className="font-sub text-xs text-(--theme-muted) font-light leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================
            VARIAN 4: roadmap-interactive-steps (Gaya Kartu Berderet dengan Efek Panel)
           ========================================================= */}
        {variant === "roadmap-interactive-steps" && (
          <div className="max-w-4xl mx-auto space-y-4">
            {data.steps.map((s, i) => (
              <div
                key={i}
                style={{ borderRadius: "var(--theme-radius-box)" }}
                className="p-6 bg-white/5 border border-(--theme-border) backdrop-blur-xl flex items-start gap-6 hover:bg-white/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-(--theme-primary)/20 border border-(--theme-primary)/40 flex items-center justify-center font-mono text-xs font-bold text-(--theme-primary) shrink-0 mt-1">
                  {s.stepNumber}
                </div>
                <div>
                  <h3 className="font-heading text-base font-semibold text-(--theme-text) mb-1">
                    {s.title}
                  </h3>
                  <p className="font-sub text-xs md:text-sm text-(--theme-muted) font-light leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================
            VARian 5: roadmap-compact-pills (Gaya Pil Ringkas Sebaris)
           ========================================================= */}
        {variant === "roadmap-compact-pills" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {data.steps.map((s, i) => (
              <div
                key={i}
                style={{ borderRadius: "var(--theme-radius-box)" }}
                className="p-6 bg-(--theme-surface)/20 border border-(--theme-border) backdrop-blur-md flex flex-col justify-between"
              >
                <div className="font-mono text-[10px] text-(--theme-primary) uppercase tracking-widest mb-2">
                  PHASE // {s.stepNumber}
                </div>
                <h3 className="font-heading text-sm font-semibold text-(--theme-text) mb-1">
                  {s.title}
                </h3>
                <p className="font-sub text-[11px] text-(--theme-muted) font-light line-clamp-3">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
