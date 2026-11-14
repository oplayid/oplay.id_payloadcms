"use client";

import React, { useState } from "react";
import Container from "@/components/ui/Container";

type NewsletterCtaData = {
  variant?: string;
  sectionBadge?: string;
  sectionTitle: string;
  sectionSubtitle: string;
  placeholderText?: string;
  buttonText?: string;
  successMessage?: string;
};

export default function NewsletterCtaBlock({
  data,
  themeLayout,
}: {
  data: NewsletterCtaData;
  themeLayout?: string;
}) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const variant = data.variant || "newsletter-centered-box";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setDone(true);
  };

  return (
    <section className="w-full py-20 relative overflow-hidden">
      <Container containerClass={themeLayout}>
        {/* =========================================================
            VARIAN 1: newsletter-centered-box (Kotak Terpusat Standar)
           ========================================================= */}
        {variant === "newsletter-centered-box" && (
          <div
            style={{
              borderRadius: "var(--theme-radius-box)",
              boxShadow: "var(--theme-shadow)",
            }}
            className="p-10 md:p-14 bg-(--theme-surface)/30 border border-(--theme-border) text-center max-w-2xl mx-auto backdrop-blur-xl relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-(--theme-primary)/50 to-transparent" />
            {data.sectionBadge && (
              <span
                style={{ borderRadius: "var(--theme-radius-btn)" }}
                className="px-3 py-1 text-xs uppercase bg-white/5 border border-(--theme-border) text-(--theme-muted) mb-4 inline-block font-sub"
              >
                {data.sectionBadge}
              </span>
            )}
            <h2 className="font-heading text-2xl md:text-4xl font-semibold text-(--theme-text) mb-3 tracking-tight">
              {data.sectionTitle}
            </h2>
            <p className="font-sub text-xs md:text-sm text-(--theme-muted) font-light mb-8 leading-relaxed max-w-lg mx-auto">
              {data.sectionSubtitle}
            </p>

            {done ? (
              <div
                style={{ borderRadius: "var(--theme-radius-btn)" }}
                className="p-4 bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/30 max-w-md mx-auto"
              >
                ✓{" "}
                {data.successMessage || "Berhasil terdaftar ke sistem buletin!"}
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    data.placeholderText || "Masukkan alamat email..."
                  }
                  style={{ borderRadius: "var(--theme-radius-btn)" }}
                  className="flex-1 px-4 py-3 bg-white/5 border border-(--theme-border) text-xs text-(--theme-text) focus:outline-none focus:border-(--theme-primary) transition-colors"
                />
                <button
                  type="submit"
                  style={{ borderRadius: "var(--theme-radius-btn)" }}
                  className="px-6 py-3 text-xs font-medium uppercase tracking-wider bg-(--theme-primary) text-(--theme-primary-text) cursor-pointer shrink-0 shadow-md hover:opacity-90 transition-opacity"
                >
                  {data.buttonText || "Berlangganan"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* =========================================================
            VARIAN 2: newsletter-terminal-glow (Gaya Panel Terminal Futuristik)
           ========================================================= */}
        {variant === "newsletter-terminal-glow" && (
          <div
            style={{ borderRadius: "var(--theme-radius-box)" }}
            className="p-8 md:p-12 bg-(--theme-surface)/50 border border-(--theme-primary)/40 max-w-3xl mx-auto backdrop-blur-2xl relative shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6 border-b border-(--theme-border)/50 pb-4">
              <span className="font-mono text-[10px] text-(--theme-primary) uppercase tracking-widest">
                // SECURE_NEWSLETTER_GATEWAY
              </span>
              {data.sectionBadge && (
                <span className="font-mono text-[10px] px-2 py-0.5 bg-white/5 border border-(--theme-border) text-(--theme-muted) rounded">
                  {data.sectionBadge}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="font-heading text-2xl font-semibold text-(--theme-text) mb-2">
                  {data.sectionTitle}
                </h3>
                <p className="font-sub text-xs text-(--theme-muted) font-light leading-relaxed">
                  {data.sectionSubtitle}
                </p>
              </div>
              <div>
                {done ? (
                  <div className="p-4 bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/30">
                    ✓ {data.successMessage || "Berhasil terdaftar!"}
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        data.placeholderText || "Email profesional..."
                      }
                      style={{ borderRadius: "var(--theme-radius-btn)" }}
                      className="w-full px-4 py-3 bg-white/5 border border-(--theme-border) text-xs text-(--theme-text) focus:outline-none"
                    />
                    <button
                      type="submit"
                      style={{ borderRadius: "var(--theme-radius-btn)" }}
                      className="w-full py-3 text-xs font-medium uppercase tracking-wider bg-(--theme-primary) text-(--theme-primary-text) cursor-pointer"
                    >
                      {data.buttonText || "Daftar Sekarang"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            VARIAN 3: newsletter-split-banner (Tata Letak Sebaris Melebar)
           ========================================================= */}
        {variant === "newsletter-split-banner" && (
          <div
            style={{ borderRadius: "var(--theme-radius-box)" }}
            className="p-8 md:p-10 bg-(--theme-surface)/30 border border-(--theme-border) max-w-4xl mx-auto backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div className="max-w-xl text-center md:text-left">
              {data.sectionBadge && (
                <span className="font-mono text-[10px] text-(--theme-primary) uppercase tracking-widest block mb-2">
                  //{data.sectionBadge}
                </span>
              )}
              <h2 className="font-heading text-xl md:text-2xl font-semibold text-(--theme-text) mb-2">
                {data.sectionTitle}
              </h2>
              <p className="font-sub text-xs text-(--theme-muted) font-light">
                {data.sectionSubtitle}
              </p>
            </div>
            <div className="w-full md:w-auto shrink-0">
              {done ? (
                <div className="p-3 bg-emerald-500/10 text-emerald-400 text-xs font-mono">
                  ✓ Berhasil!
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={data.placeholderText || "Email..."}
                    style={{ borderRadius: "var(--theme-radius-btn)" }}
                    className="px-4 py-2.5 bg-white/5 border border-(--theme-border) text-xs text-(--theme-text) focus:outline-none"
                  />
                  <button
                    type="submit"
                    style={{ borderRadius: "var(--theme-radius-btn)" }}
                    className="px-4 py-2.5 text-xs bg-(--theme-primary) text-(--theme-primary-text) cursor-pointer"
                  >
                    {data.buttonText || "Kirim"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* =========================================================
            VARIAN 4: newsletter-minimal-card (Gaya Kartu Minimalis Bersih)
           ========================================================= */}
        {variant === "newsletter-minimal-card" && (
          <div
            style={{ borderRadius: "var(--theme-radius-box)" }}
            className="p-8 bg-white/5 border border-(--theme-border) max-w-2xl mx-auto text-center backdrop-blur-xl"
          >
            <h3 className="font-heading text-lg font-semibold text-(--theme-text) mb-1">
              {data.sectionTitle}
            </h3>
            <p className="font-sub text-xs text-(--theme-muted) font-light mb-6">
              {data.sectionSubtitle}
            </p>
            {done ? (
              <div className="text-emerald-400 text-xs font-mono">
                Terima kasih telah mendaftar.
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex gap-2 max-w-sm mx-auto"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={data.placeholderText || "Email Anda..."}
                  style={{ borderRadius: "var(--theme-radius-btn)" }}
                  className="flex-1 px-3 py-2 bg-white/5 border border-(--theme-border) text-xs text-(--theme-text)"
                />
                <button
                  type="submit"
                  style={{ borderRadius: "var(--theme-radius-btn)" }}
                  className="px-4 py-2 text-xs bg-(--theme-primary) text-(--theme-primary-text)"
                >
                  {data.buttonText || "Gabung"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* =========================================================
            VARIAN 5: newsletter-floating-bar (Gaya Bar Mengapung Bawah)
           ========================================================= */}
        {variant === "newsletter-floating-bar" && (
          <div
            style={{ borderRadius: "var(--theme-radius-box)" }}
            className="p-6 bg-(--theme-surface)/60 border border-(--theme-border) max-w-3xl mx-auto backdrop-blur-2xl text-center"
          >
            <span className="font-mono text-[10px] text-(--theme-primary) uppercase tracking-widest block mb-1">
              // STAYS_UPDATED
            </span>
            <h3 className="font-heading text-xl font-semibold text-(--theme-text) mb-2">
              {data.sectionTitle}
            </h3>
            <p className="font-sub text-xs text-(--theme-muted) font-light mb-6">
              {data.sectionSubtitle}
            </p>
            {done ? (
              <div className="text-emerald-400 text-xs font-mono">
                ✓ Berhasil terdaftar!
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex gap-2 max-w-md mx-auto"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={data.placeholderText || "Email..."}
                  style={{ borderRadius: "var(--theme-radius-btn)" }}
                  className="flex-1 px-4 py-2.5 bg-white/5 border border-(--theme-border) text-xs text-(--theme-text)"
                />
                <button
                  type="submit"
                  style={{ borderRadius: "var(--theme-radius-btn)" }}
                  className="px-5 py-2.5 text-xs bg-(--theme-primary) text-(--theme-primary-text)"
                >
                  {data.buttonText || "Kirim"}
                </button>
              </form>
            )}
          </div>
        )}
      </Container>
    </section>
  );
}
