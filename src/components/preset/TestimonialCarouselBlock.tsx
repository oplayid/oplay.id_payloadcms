import React from "react";
import Container from "@/components/ui/Container";
import { mediaUrl, type MediaLike } from "@/lib/mediaUrl";

type Testimonial = {
  quote: string;
  authorName: string;
  authorRole: string;
  companyName: string;
  avatarUrl?: MediaLike;
};

type TestimonialData = {
  variant?: string;
  sectionBadge?: string;
  sectionTitle: string;
  sectionSubtitle?: string;
  testimonials: Testimonial[];
};

export default function TestimonialCarouselBlock({
  data,
  themeLayout,
}: {
  data: TestimonialData;
  themeLayout?: string;
}) {
  // Fallback aman jika variant bernilai 'testimonial-cards' atau string lain yang belum terdaftar
  const rawVariant = data.variant || "testimonial-grid";
  const v =
    rawVariant === "testimonial-cards" ? "testimonial-grid" : rawVariant;

  return (
    <section className="w-full py-20 relative overflow-hidden">
      <Container containerClass={themeLayout}>
        {/* HEADER SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          {data.sectionBadge && (
            <div
              style={{ borderRadius: "var(--radius-btn)" }}
              className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wider text-canvas-muted uppercase bg-canvas-surface border border-canvas-border font-sub backdrop-blur-md"
            >
              {data.sectionBadge}
            </div>
          )}
          <h2 className="font-heading text-3xl md:text-5xl font-semibold tracking-tight text-canvas-text mb-4">
            {data.sectionTitle}
          </h2>
          {data.sectionSubtitle && (
            <p className="font-sub text-sm md:text-base text-canvas-muted font-light">
              {data.sectionSubtitle}
            </p>
          )}
        </div>

        {/* =========================================================
            VARIAN 1: testimonial-grid (Grid Kartu Testimoni Rapi)
           ========================================================= */}
        {v === "testimonial-grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {data.testimonials.map((t, i) => (
              <div
                key={i}
                style={{
                  borderRadius: "var(--radius-box)",
                  boxShadow: "var(--shadow-custom)",
                }}
                className="p-8 bg-canvas-surface border border-canvas-border backdrop-blur-xl flex flex-col justify-between group hover:border-primary transition-all duration-300"
              >
                <div>
                  <span className="font-heading text-4xl text-primary/40 block mb-2">
                    “
                  </span>
                  <p className="font-sub text-xs md:text-sm text-canvas-text font-light leading-relaxed mb-6">
                    {t.quote}
                  </p>
                </div>
                <div className="flex items-center gap-4 border-t border-canvas-border/40 pt-4">
                  {t.avatarUrl ? (
                    <img
                      src={mediaUrl(t.avatarUrl, "thumbnail")}
                      alt={t.authorName}
                      className="w-10 h-10 rounded-full object-cover border border-canvas-border"
                    />
                  ) : (
                    <div
                      style={{ borderRadius: "var(--radius-btn)" }}
                      className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-mono text-xs font-bold text-primary"
                    >
                      {t.authorName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-heading text-sm font-semibold text-canvas-text">
                      {t.authorName}
                    </h4>
                    <p className="font-sub text-[11px] text-canvas-muted font-light">
                      {t.authorRole} —{" "}
                      <strong className="text-canvas-text font-medium">
                        {t.companyName}
                      </strong>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================
            VARIAN 2: testimonial-minimal-slider (Gaya Slider Minimalis Elegan)
           ========================================================= */}
        {v === "testimonial-minimal-slider" && (
          <div className="max-w-3xl mx-auto space-y-8">
            {data.testimonials.map((t, i) => (
              <div
                key={i}
                style={{
                  borderRadius: "var(--radius-box)",
                  boxShadow: "var(--shadow-custom)",
                }}
                className="p-8 md:p-12 bg-canvas-surface/50 border border-canvas-border backdrop-blur-2xl text-center relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-primary to-transparent" />
                <p className="font-sub text-sm md:text-lg text-canvas-text font-light italic leading-relaxed mb-8">
                  "{t.quote}"
                </p>
                <div>
                  <h4 className="font-heading text-base font-semibold text-canvas-text mb-1">
                    {t.authorName}
                  </h4>
                  <p className="font-sub text-xs text-canvas-muted font-light">
                    {t.authorRole},{" "}
                    <span className="text-primary font-medium">
                      {t.companyName}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================
            VARIAN 3: testimonial-featured-single (Sorotan Utama Satu Testimoni Besar)
           ========================================================= */}
        {v === "testimonial-featured-single" && data.testimonials[0] && (
          <div
            style={{
              borderRadius: "var(--radius-box)",
              boxShadow: "var(--shadow-custom)",
            }}
            className="max-w-4xl mx-auto p-10 md:p-16 bg-canvas-elevated border border-primary/40 backdrop-blur-2xl relative overflow-hidden text-center shadow-2xl"
          >
            <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
            <span className="font-mono text-[10px] text-primary uppercase tracking-widest block mb-6">
              // VERIFIED_CORPORATE_TESTIMONIAL
            </span>
            <p className="font-sub text-base md:text-xl text-canvas-text font-light leading-relaxed mb-8 relative z-10">
              "{data.testimonials[0].quote}"
            </p>
            <div className="relative z-10">
              <h4 className="font-heading text-lg font-semibold text-canvas-text mb-1">
                {data.testimonials[0].authorName}
              </h4>
              <p className="font-sub text-xs text-canvas-muted">
                {data.testimonials[0].authorRole} —{" "}
                <strong className="text-primary">
                  {data.testimonials[0].companyName}
                </strong>
              </p>
            </div>
          </div>
        )}

        {/* =========================================================
            VARIAN 4: testimonial-masonry (Gaya Asimetris Dinamis)
           ========================================================= */}
        {v === "testimonial-masonry" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {data.testimonials.map((t, i) => (
              <div
                key={i}
                style={{ borderRadius: "var(--radius-box)" }}
                className={`p-6 bg-canvas-surface border border-canvas-border backdrop-blur-xl flex flex-col justify-between ${
                  i % 2 === 0 ? "md:translate-y-4" : ""
                }`}
              >
                <p className="font-sub text-xs text-canvas-text font-light leading-relaxed mb-6">
                  "{t.quote}"
                </p>
                <div className="border-t border-canvas-border/40 pt-4">
                  <h4 className="font-heading text-xs font-semibold text-canvas-text">
                    {t.authorName}
                  </h4>
                  <span className="font-sub text-[10px] text-canvas-muted">
                    {t.companyName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================
            VARIAN 5: testimonial-quote-bubble (Gaya Gelembung Kutipan Modern)
           ========================================================= */}
        {v === "testimonial-quote-bubble" && (
          <div className="max-w-4xl mx-auto space-y-6">
            {data.testimonials.map((t, i) => (
              <div
                key={i}
                style={{ borderRadius: "var(--radius-box)" }}
                className="p-6 md:p-8 bg-canvas-surface border border-canvas-border backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="max-w-xl">
                  <p className="font-sub text-xs md:text-sm text-canvas-text font-light italic">
                    "{t.quote}"
                  </p>
                </div>
                <div className="shrink-0 text-left md:text-right border-t md:border-t-0 md:border-l border-canvas-border/50 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
                  <h4 className="font-heading text-sm font-semibold text-canvas-text">
                    {t.authorName}
                  </h4>
                  <span className="font-sub text-xs text-canvas-muted">
                    {t.companyName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
