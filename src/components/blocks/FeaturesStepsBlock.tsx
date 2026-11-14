import React from "react";
import Container from "@/components/ui/Container"; // (1) Mengimpor komponen Container terpusat

type StepItem = {
  number: string;
  title: string;
  description: string;
};

type FeatureStepsData = {
  sectionBadge?: string;
  sectionTitle: string;
  steps: StepItem[];
};

// (2) Menerima prop opsional themeLayout untuk kontrol tata letak terpusat dari JSON tema
export default function FeatureStepsBlock({
  data,
  themeLayout,
}: {
  data: FeatureStepsData;
  themeLayout?: string;
}) {
  return (
    <section className="w-full py-16">
      {/* (3) Menggunakan Container universal menggantikan max-w-7xl dan px-6 statis */}
      <Container containerClass={themeLayout}>
        <div className="text-center max-w-3xl mx-auto mb-16">
          {data.sectionBadge && (
            <div
              style={{ borderRadius: "var(--theme-radius-btn)" }}
              className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wider text-(--theme-text) uppercase bg-(--theme-surface)/50 border border-(--theme-border) font-sub"
            >
              {data.sectionBadge}
            </div>
          )}
          {/* Judul Utama menggunakan font-heading */}
          <h2 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight text-(--theme-text)">
            {data.sectionTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.steps.map((step, idx) => (
            <div
              key={idx}
              style={{
                borderRadius: "var(--theme-radius-box)",
                boxShadow: "var(--theme-shadow)",
              }}
              className="bg-(--theme-surface) border border-(--theme-border) relative p-8 flex flex-col justify-between hover:border-(--theme-border-hover) transition-all duration-300 overflow-hidden"
            >
              {/* Nomor Indikator Besar Transparan menggunakan font-heading */}
              <div className="font-heading absolute top-6 right-6 text-5xl font-bold text-(--theme-text)/5 pointer-events-none select-none">
                {step.number}
              </div>

              <div>
                <div className="text-xs font-semibold text-(--theme-muted) mb-4 tracking-widest font-sub">
                  LANGKAH {step.number}
                </div>
                {/* Judul Langkah menggunakan font-heading */}
                <h3 className="font-heading text-lg font-medium text-(--theme-text) mb-3">
                  {step.title}
                </h3>
                {/* Deskripsi menggunakan font-sub */}
                <p className="font-sub text-sm text-(--theme-muted) leading-relaxed font-light">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
