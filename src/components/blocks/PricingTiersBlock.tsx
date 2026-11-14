import React from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";

type PricingPlan = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  ctaLabel: string;
  ctaHref: string;
};

type PricingTiersData = {
  sectionBadge?: string;
  sectionTitle: string;
  sectionSubtitle?: string;
  plans: PricingPlan[];
};

export default function PricingTiersBlock({
  data,
  themeLayout,
}: {
  data: PricingTiersData;
  themeLayout?: string;
}) {
  return (
    /* Section luar bersifat full-width (mengambil lebar penuh layar secara megah) */
    <section className="w-full py-20">
      {/* Container di dalam mengatur batas maksimal lebar & padding aman kiri-kanan */}
      <Container containerClass={themeLayout}>
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          {data.sectionBadge && (
            <div
              style={{ borderRadius: "var(--theme-radius-btn)" }}
              className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wider text-(--theme-muted) uppercase bg-white/5 border border-(--theme-border) font-sub"
            >
              {data.sectionBadge}
            </div>
          )}
          {/* Judul Utama menggunakan font-heading & tag h2 untuk SEO */}
          <h2 className="font-heading text-3xl md:text-5xl font-semibold tracking-tight text-(--theme-text) mb-4">
            {data.sectionTitle}
          </h2>
          {data.sectionSubtitle && (
            /* Subjudul menggunakan font-sub */
            <p className="font-sub text-sm md:text-base text-(--theme-muted) font-light">
              {data.sectionSubtitle}
            </p>
          )}
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
          {data.plans.map((plan, idx) => (
            <div
              key={idx}
              style={{
                borderRadius: "var(--theme-radius-box)",
                boxShadow: "var(--theme-shadow)",
              }}
              className={`bg-(--theme-surface) border relative p-8 flex flex-col justify-between transition-all duration-300 ${
                plan.isPopular
                  ? "border-(--theme-primary) lg:scale-105 z-10 shadow-2xl"
                  : "border-(--theme-border) hover:border-(--theme-border-hover)"
              }`}
            >
              {/* Badge Pilihan Utama */}
              {plan.isPopular && (
                <div
                  style={{ borderRadius: "var(--theme-radius-btn)" }}
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-(--theme-primary) text-(--theme-primary-text) text-[10px] font-bold uppercase tracking-widest shadow-md font-sub whitespace-nowrap"
                >
                  Paling Diminati Enterprise
                </div>
              )}

              <div>
                {/* Nama Paket */}
                <h3 className="font-heading text-xl font-medium text-(--theme-text) mb-2">
                  {plan.name}
                </h3>
                {/* Deskripsi Paket */}
                <p className="font-sub text-xs text-(--theme-muted) font-light mb-6">
                  {plan.description}
                </p>

                {/* Harga dan Periode */}
                <div className="flex items-baseline gap-1 mb-8 pb-6 border-b border-(--theme-border)/50">
                  <span className="font-heading text-3xl xl:text-4xl font-semibold text-(--theme-text)">
                    {plan.price}
                  </span>
                  <span className="font-sub text-[11px] text-(--theme-muted) uppercase tracking-wider">
                    / {plan.period}
                  </span>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="font-sub text-[10px] font-semibold text-(--theme-muted) uppercase tracking-widest mb-2">
                    Fasilitas Termasuk:
                  </div>
                  {plan.features.map((feat, fIdx) => (
                    <div
                      key={fIdx}
                      className="flex items-start gap-3 font-sub text-xs text-(--theme-muted) font-light"
                    >
                      <span className="text-(--theme-primary) font-bold">
                        ✓
                      </span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tombol CTA */}
              <Link
                href={plan.ctaHref}
                style={{ borderRadius: "var(--theme-radius-btn)" }}
                className={`w-full py-3 px-6 text-center text-xs font-medium uppercase tracking-wider transition-all font-sub inline-block ${
                  plan.isPopular
                    ? "bg-(--theme-primary) text-(--theme-primary-text) hover:opacity-90 shadow-lg"
                    : "bg-(--theme-surface)/60 text-(--theme-text) border border-(--theme-border) hover:bg-(--theme-surface)"
                }`}
              >
                {plan.ctaLabel}
              </Link>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
