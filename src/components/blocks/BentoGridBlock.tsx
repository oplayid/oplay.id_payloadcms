import React from "react";
import Link from "next/link";
import Container from "@/components/ui/Container"; // (1) Mengimpor komponen Container terpusat

type BentoItem = {
  title: string;
  description: string;
  span?: "col-span-1" | "col-span-2" | "md:col-span-2";
  badge?: string;
  icon?: string;
  href?: string;
};

type BentoGridData = {
  sectionTitle?: string;
  sectionSubtitle?: string;
  items: BentoItem[];
};

// (2) Menerima prop opsional themeLayout untuk kontrol tata letak terpusat dari JSON tema
export default function BentoGridBlock({
  data,
  themeLayout,
}: {
  data: BentoGridData;
  themeLayout?: string;
}) {
  return (
    <section className="w-full py-16">
      {/* (3) Mengganti div pembungkus max-w-7xl dan px-6 dengan komponen Container terpusat */}
      <Container containerClass={themeLayout}>
        {/* Header Section Opsional */}
        {(data.sectionTitle || data.sectionSubtitle) && (
          <div className="mb-12 text-center md:text-left">
            {data.sectionTitle && (
              <h2 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight text-(--theme-text) mb-3">
                {data.sectionTitle}
              </h2>
            )}
            {data.sectionSubtitle && (
              <p className="font-sub text-sm md:text-base text-(--theme-muted) font-light max-w-2xl">
                {data.sectionSubtitle}
              </p>
            )}
          </div>
        )}

        {/* Bento Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.items.map((item, idx) => {
            const cardClasses = `group relative p-8 bg-(--theme-surface)/40 border border-(--theme-border) backdrop-blur-xl transition-all duration-300 hover:border-(--theme-border-hover) hover:bg-(--theme-surface)/60 flex flex-col justify-between overflow-hidden ${
              item.span || "col-span-1"
            }`;

            const cardStyle = {
              borderRadius: "var(--theme-radius-box)",
              boxShadow: "var(--theme-shadow)",
            };

            const cardContent = (
              <>
                {/* Efek Garis Cahaya Halus di Sudut saat Hover */}
                <div className="absolute -right-12 -top-12 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-500 pointer-events-none" />

                <div>
                  {item.badge && (
                    <span
                      style={{ borderRadius: "var(--theme-radius-btn)" }}
                      className="inline-block px-3 py-1 mb-4 text-[10px] font-semibold tracking-widest text-(--theme-muted) uppercase bg-white/5 border border-(--theme-border) font-sub"
                    >
                      {item.badge}
                    </span>
                  )}
                  <h3 className="font-heading text-xl font-medium tracking-tight text-(--theme-text) mb-3 group-hover:text-(--theme-text) transition-colors">
                    {item.title}
                  </h3>
                  <p className="font-sub text-sm text-(--theme-muted) leading-relaxed font-light">
                    {item.description}
                  </p>
                </div>

                {item.href && (
                  <div className="mt-6 flex items-center text-xs font-medium text-(--theme-text) tracking-wider uppercase font-sub">
                    <span>Eksplorasi</span>
                    <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                )}
              </>
            );

            if (item.href) {
              return (
                <Link
                  key={idx}
                  href={item.href}
                  style={cardStyle}
                  className={cardClasses}
                >
                  {cardContent}
                </Link>
              );
            }

            return (
              <div key={idx} style={cardStyle} className={cardClasses}>
                {cardContent}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
