import React from "react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container"; // (1) Mengimpor komponen Container terpusat

type EnterpriseCalloutData = {
  badge?: string;
  title: string;
  description: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
};

// (2) Menerima prop opsional themeLayout untuk kontrol tata letak terpusat dari JSON tema
export default function EnterpriseCalloutBlock({
  data,
  themeLayout,
}: {
  data: EnterpriseCalloutData;
  themeLayout?: string;
}) {
  return (
    <section className="w-full py-20">
      {/* (3) Menggunakan Container universal menggantikan max-w-5xl dan px-6 statis */}
      <Container containerClass={themeLayout}>
        <div
          style={{
            borderRadius: "var(--theme-radius-box)",
            boxShadow: "var(--theme-shadow)",
          }}
          className="bg-(--theme-surface) border border-(--theme-border) relative overflow-hidden p-10 md:p-16 text-center transition-all duration-300 hover:border-(--theme-border-hover)"
        >
          {/* Efek Cahaya Latar Belakang Lingkaran */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto">
            {data.badge && (
              <span
                style={{ borderRadius: "var(--theme-radius-btn)" }}
                className="inline-block px-3 py-1 mb-6 text-xs font-medium tracking-wider text-(--theme-muted) uppercase bg-white/5 border border-(--theme-border)"
              >
                {data.badge}
              </span>
            )}

            <h2 className="font-heading text-3xl md:text-5xl font-semibold tracking-tight text-(--theme-text) mb-6">
              {data.title}
            </h2>

            <p className="font-sub text-base text-(--theme-muted) leading-relaxed font-light mb-8">
              {data.description}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
              {/* Tombol Utama */}
              <Button
                href={data.primaryCta.href}
                variant="primary"
                className="w-full sm:w-auto px-8 py-3 shadow-lg"
              >
                {data.primaryCta.label}
              </Button>

              {/* Tombol Sekunder */}
              {data.secondaryCta && (
                <Button
                  href={data.secondaryCta.href}
                  variant="secondary"
                  className="w-full sm:w-auto px-8 py-3"
                >
                  {data.secondaryCta.label}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
