import React from "react";
import Container from "@/components/ui/Container";

type NotificationAction = {
  label: string;
  href: string;
};

type NotificationBannerData = {
  variant?: string;
  badgeText?: string;
  message: string;
  action?: NotificationAction;
};

export default function NotificationBannerBlock({
  data,
  themeLayout,
}: {
  data: NotificationBannerData;
  themeLayout?: string;
}) {
  const variant = data.variant || "banner-top-alert";

  return (
    <section className="w-full py-4">
      <Container containerClass={themeLayout}>
        {/* =========================================================
            VARIAN 1: banner-top-alert (Peringatan Standar dengan Aksen Penuh)
           ========================================================= */}
        {variant === "banner-top-alert" && (
          <div
            style={{
              borderRadius: "var(--theme-radius-box)",
              boxShadow: "var(--theme-shadow)",
            }}
            className="p-4 md:p-5 bg-(--theme-surface)/50 border border-(--theme-border) backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-(--theme-primary)" />
            <div className="flex items-center gap-3 pl-2">
              {data.badgeText && (
                <span className="px-2.5 py-1 text-[10px] font-mono bg-(--theme-primary)/10 text-(--theme-primary) border border-(--theme-primary)/30 rounded uppercase tracking-wider shrink-0">
                  {data.badgeText}
                </span>
              )}
              <p className="font-sub text-xs md:text-sm text-(--theme-text) font-light leading-relaxed">
                {data.message}
              </p>
            </div>
            {data.action && (
              <a
                href={data.action.href}
                style={{ borderRadius: "var(--theme-radius-btn)" }}
                className="text-xs font-mono px-4 py-2 bg-white/5 hover:bg-(--theme-primary) text-(--theme-text) hover:text-(--theme-primary-text) border border-(--theme-border) transition-all shrink-0 ml-auto md:ml-0"
              >
                {data.action.label} →
              </a>
            )}
          </div>
        )}

        {/* =========================================================
            VARIAN 2: banner-floating-pill (Gaya Pil Mengapung Elegan)
           ========================================================= */}
        {variant === "banner-floating-pill" && (
          <div className="max-w-3xl mx-auto">
            <div
              style={{ borderRadius: "var(--theme-radius-btn)" }}
              className="px-6 py-3 bg-(--theme-surface)/80 border border-(--theme-border) backdrop-blur-2xl flex items-center justify-between gap-4 shadow-xl"
            >
              <div className="flex items-center gap-3 truncate">
                {data.badgeText && (
                  <span className="w-2 h-2 rounded-full bg-(--theme-primary) animate-ping shrink-0" />
                )}
                <p className="font-sub text-xs text-(--theme-text) font-light truncate">
                  {data.message}
                </p>
              </div>
              {data.action && (
                <a
                  href={data.action.href}
                  className="font-mono text-xs text-(--theme-primary) hover:underline shrink-0 font-medium"
                >
                  {data.action.label} →
                </a>
              )}
            </div>
          </div>
        )}

        {/* =========================================================
            VARIAN 3: banner-with-icon (Gaya Kotak dengan Panel Ikon Samping)
           ========================================================= */}
        {variant === "banner-with-icon" && (
          <div
            style={{ borderRadius: "var(--theme-radius-box)" }}
            className="p-5 bg-(--theme-surface)/30 border border-(--theme-border) backdrop-blur-xl flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-(--theme-primary)/20 border border-(--theme-primary)/40 flex items-center justify-center font-mono text-xs font-bold text-(--theme-primary) shrink-0 shadow-inner">
                i
              </div>
              <div>
                {data.badgeText && (
                  <span className="font-mono text-[10px] text-(--theme-primary) uppercase tracking-widest block mb-0.5">
                    {data.badgeText}
                  </span>
                )}
                <p className="font-sub text-xs md:text-sm text-(--theme-text) font-light">
                  {data.message}
                </p>
              </div>
            </div>
            {data.action && (
              <a
                href={data.action.href}
                className="font-mono text-xs text-(--theme-primary) hover:underline shrink-0 px-3 py-1 bg-white/5 border border-(--theme-border) rounded"
              >
                {data.action.label}
              </a>
            )}
          </div>
        )}

        {/* =========================================================
            VARIAN 4: banner-action-right (Gaya Tindakan Menonjol di Kanan)
           ========================================================= */}
        {variant === "banner-action-right" && (
          <div
            style={{ borderRadius: "var(--theme-radius-box)" }}
            className="p-5 bg-white/5 border border-(--theme-border) backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="text-center sm:text-left">
              {data.badgeText && (
                <span className="font-mono text-[10px] text-(--theme-muted) uppercase tracking-widest block mb-1">
                  [{data.badgeText}]
                </span>
              )}
              <p className="font-sub text-xs md:text-sm text-(--theme-text) font-light">
                {data.message}
              </p>
            </div>
            {data.action && (
              <a
                href={data.action.href}
                style={{ borderRadius: "var(--theme-radius-btn)" }}
                className="px-5 py-2 text-xs font-medium uppercase tracking-wider bg-(--theme-primary) text-(--theme-primary-text) shrink-0 shadow-md"
              >
                {data.action.label}
              </a>
            )}
          </div>
        )}

        {/* =========================================================
            VARIAN 5: banner-minimal-line (Gaya Garis Minimalis Bersih)
           ========================================================= */}
        {variant === "banner-minimal-line" && (
          <div className="py-3 border-y border-(--theme-border)/60 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {data.badgeText && (
                <span className="font-mono text-[10px] text-(--theme-primary) uppercase">
                  //{data.badgeText}
                </span>
              )}
              <p className="font-sub text-xs text-(--theme-muted) font-light">
                {data.message}
              </p>
            </div>
            {data.action && (
              <a
                href={data.action.href}
                className="font-mono text-xs text-(--theme-text) hover:text-(--theme-primary) transition-colors shrink-0"
              >
                {data.action.label} →
              </a>
            )}
          </div>
        )}
      </Container>
    </section>
  );
}
