"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type FooterLink = {
  label: string;
  href: string;
};

type FooterColumn = {
  title: string;
  links: FooterLink[];
};

type FooterBlockData = {
  variant?: string;
  year?: number;
  companyName?: string;
  tagline?: string;
  navigationColumns?: FooterColumn[];
};

export default function FooterBlock({ data }: { data: FooterBlockData }) {
  const pathname = usePathname();

  const v = data.variant || "footer-standard";
  const currentYear = data.year || new Date().getFullYear();
  const company = data.companyName || "oplay.id";
  const tagline = data.tagline || "Autonomous Legal Tech & AI Ecosystem.";

  // Mendeteksi kode bahasa aktif dari URL (misal: /id/..., /en/...)
  const supportedLangCodes = ["id", "en"];
  const pathSegments = pathname.split("/");
  const currentLang = supportedLangCodes.includes(pathSegments[1])
    ? pathSegments[1]
    : supportedLangCodes[0] || "id";

  const getSmartHref = (href: string) => {
    if (!href) return `/${currentLang}`;

    if (
      href.startsWith("http") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    ) {
      return href;
    }

    if (href.startsWith("#")) {
      return `${pathname}${href}`;
    }

    const cleanHref = href.startsWith("/") ? href : `/${href}`;
    const langRegex = new RegExp(`^\\/(${supportedLangCodes.join("|")})\\/`);
    if (langRegex.test(cleanHref)) {
      return cleanHref.replace(langRegex, `/${currentLang}/`);
    }

    return `/${currentLang}${cleanHref}`;
  };

  const defaultColumns: FooterColumn[] = [
    {
      title: "Eksplorasi",
      links: [
        { label: "Beranda", href: `#` },
        { label: "Solusi Enterprise", href: `#block-pricing` },
        { label: "Keamanan & Kepatuhan", href: `#block-compliance` },
      ],
    },
    {
      title: "Enterprise & Security",
      links: [
        { label: "ISO 27001 Certified", href: "#" },
        { label: "AES-256 Encryption", href: "#" },
        { label: "Client Data Isolation", href: "#" },
      ],
    },
    {
      title: "Legal & Compliance",
      links: [
        { label: "Kebijakan Privasi", href: "/company" },
        { label: "Ketentuan Layanan", href: "/company" },
        { label: "SLA 99.99%", href: "#" },
      ],
    },
  ];

  const columns = data.navigationColumns || defaultColumns;

  return (
    <>
      {/* =========================================================
          VARIAN 1: footer-standard (Gaya Asli Anda - Standar Rapi Legal Tech)
         ========================================================= */}
      {v === "footer-standard" && (
        <footer className="relative w-screen left-1/2 -translate-x-1/2 border-t border-(--theme-border)/40 bg-(--theme-surface)/20 backdrop-blur-2xl text-(--theme-muted) pt-16 pb-12 overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 md:px-12">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-12 pb-16 border-b border-(--theme-border)/40">
              <div className="md:col-span-2 space-y-4">
                <Link
                  href={`/${currentLang}`}
                  className="inline-flex items-center gap-2"
                >
                  <span className="font-heading text-lg font-semibold tracking-tight text-(--theme-text)">
                    {company}
                  </span>
                  <span className="font-sub px-2 py-0.5 text-[10px] uppercase bg-white/5 border border-(--theme-border) rounded-full text-(--theme-muted)">
                    v4.2
                  </span>
                </Link>
                <p className="font-sub text-xs text-(--theme-muted) font-light leading-relaxed max-w-sm">
                  {tagline}
                </p>

                <div
                  style={{ borderRadius: "var(--theme-radius-btn)" }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-(--theme-surface)/50 border border-(--theme-border) text-xs text-(--theme-text)"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-600 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                  </span>
                  <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                    All Systems Operational
                  </span>
                </div>
              </div>

              <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8">
                {columns.map((col, idx) => (
                  <div key={idx} className="space-y-4">
                    <h4 className="font-heading text-xs font-semibold uppercase tracking-widest text-(--theme-text)">
                      {col.title}
                    </h4>
                    <ul className="space-y-2.5">
                      {col.links.map((link: FooterLink, lIdx: number) => {
                        const smartHref = getSmartHref(link.href);
                        return (
                          <li key={lIdx}>
                            <Link
                              href={smartHref}
                              className="font-sub text-xs font-light hover:text-(--theme-text) transition-colors duration-200"
                            >
                              {link.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-light font-sub">
              <p>
                © {currentYear} {company}. All rights reserved.
              </p>
              <div className="flex items-center space-x-6">
                <span className="text-(--theme-muted)/70 font-mono text-[11px]">
                  Secure Enterprise Node
                </span>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* =========================================================
          VARIAN 2: footer-terminal (Gaya Konsol Terminal Hacker / Cyberpunk Legal Tech)
         ========================================================= */}
      {v === "footer-terminal" && (
        <footer className="relative w-screen left-1/2 -translate-x-1/2 border-t border-(--theme-primary)/30 bg-black/80 backdrop-blur-3xl text-(--theme-muted) py-16 overflow-hidden font-mono">
          <div className="mx-auto max-w-7xl px-6 md:px-12 space-y-12">
            <div className="p-6 bg-(--theme-surface)/10 border border-(--theme-border)/60 rounded-xl relative">
              <div className="absolute top-3 right-4 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
              </div>
              <p className="text-[11px] text-(--theme-primary) mb-2">
                root@{company.toLowerCase()}-core:~# init-secure-session
                --autonomous
              </p>
              <p className="text-xs text-(--theme-text) font-light">
                &gt; {tagline} Encrypted via AES-256 Protocol. Zero-Trust
                Architecture Enabled.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {columns.map((col, idx) => (
                <div key={idx} className="space-y-3">
                  <h4 className="text-xs font-bold text-(--theme-primary) uppercase tracking-widest">
                    // {col.title}
                  </h4>
                  <ul className="space-y-2">
                    {col.links.map((link: FooterLink, lIdx: number) => {
                      const smartHref = getSmartHref(link.href);
                      return (
                        <li key={lIdx}>
                          <Link
                            href={smartHref}
                            className="text-xs text-(--theme-muted) hover:text-(--theme-primary) transition-colors flex items-center gap-1.5"
                          >
                            <span className="text-(--theme-primary)/60">
                              &gt;
                            </span>{" "}
                            {link.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-(--theme-primary) uppercase tracking-widest">
                  // NODE_STATUS
                </h4>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                  [ACTIVE] SECURE_NODE_ID_8842
                </p>
                <p className="text-[10px] text-(--theme-muted)/70">
                  LATENCY: 12ms | REGION: ID-CENTRAL
                </p>
              </div>
            </div>

            <div className="pt-8 border-t border-(--theme-border)/30 flex flex-col sm:flex-row items-center justify-between text-[11px]">
              <p>
                © {currentYear} {company} // ALL RIGHTS RESERVED.
              </p>
              <p className="text-(--theme-primary)">
                SECURE AUTONOMOUS PROTOCOL v4.2
              </p>
            </div>
          </div>
        </footer>
      )}

      {/* =========================================================
          VARIAN 3: footer-massive-grid (Gaya Grid Kolom Masif Bergaris Kartu Holografik)
         ========================================================= */}
      {v === "footer-massive-grid" && (
        <footer className="relative w-screen left-1/2 -translate-x-1/2 border-t border-(--theme-border) bg-(--theme-surface)/40 backdrop-blur-2xl text-(--theme-muted) py-20 overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 md:px-12 space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div
                style={{ borderRadius: "var(--theme-radius-box)" }}
                className="p-8 bg-(--theme-surface)/60 border border-(--theme-border) backdrop-blur-xl flex flex-col justify-between space-y-6 md:col-span-1"
              >
                <div>
                  <h3 className="font-heading text-xl font-bold text-(--theme-text) mb-2">
                    {company}
                  </h3>
                  <p className="font-sub text-xs text-(--theme-muted) font-light leading-relaxed">
                    {tagline}
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[11px] text-emerald-700 dark:text-emerald-400 font-medium w-fit">
                  ● SYSTEM SECURE
                </div>
              </div>

              {columns.map((col, idx) => (
                <div
                  key={idx}
                  style={{ borderRadius: "var(--theme-radius-box)" }}
                  className="p-8 bg-(--theme-surface)/30 border border-(--theme-border) backdrop-blur-xl space-y-4"
                >
                  <h4 className="font-heading text-xs font-semibold uppercase tracking-widest text-(--theme-text)">
                    {col.title}
                  </h4>
                  <ul className="space-y-3">
                    {col.links.map((link: FooterLink, lIdx: number) => {
                      const smartHref = getSmartHref(link.href);
                      return (
                        <li key={lIdx}>
                          <Link
                            href={smartHref}
                            className="font-sub text-xs font-light text-(--theme-muted) hover:text-(--theme-primary) transition-colors"
                          >
                            {link.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>

            <div className="pt-8 border-t border-(--theme-border)/40 flex flex-col md:flex-row items-center justify-between text-xs font-sub">
              <p>
                © {currentYear} {company}. Enterprise Autonomous Infrastructure.
              </p>
              <div className="flex items-center space-x-6 text-[11px] font-mono text-(--theme-muted)/70">
                <span>ISO 27001 COMPLIANT</span>
                <span>•</span>
                <span>SOC2 TYPE II</span>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* =========================================================
          VARIAN 4: footer-minimal-center (Gaya Minimalis Elegan Terpusat)
         ========================================================= */}
      {v === "footer-minimal-center" && (
        <footer className="relative w-screen left-1/2 -translate-x-1/2 border-t border-(--theme-border)/40 bg-(--theme-surface)/10 backdrop-blur-xl text-(--theme-muted) py-20 overflow-hidden text-center">
          <div className="mx-auto max-w-4xl px-6 space-y-10">
            <div className="space-y-3">
              <Link
                href={`/${currentLang}`}
                className="font-heading text-2xl font-bold tracking-tight text-(--theme-text)"
              >
                {company}
              </Link>
              <p className="font-sub text-xs text-(--theme-muted) font-light max-w-md mx-auto">
                {tagline}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-8 md:gap-12">
              {columns
                .flatMap((col) => col.links)
                .map((link, idx) => {
                  const smartHref = getSmartHref(link.href);
                  return (
                    <Link
                      key={idx}
                      href={smartHref}
                      className="font-sub text-xs text-(--theme-muted) hover:text-(--theme-primary) transition-colors font-medium tracking-wide uppercase"
                    >
                      {link.label}
                    </Link>
                  );
                })}
            </div>

            <div className="pt-8 border-t border-(--theme-border)/30 flex flex-col items-center justify-center space-y-3 text-xs font-sub">
              <p className="text-(--theme-muted)/70">
                © {currentYear} {company}. All rights reserved. Powered by
                Autonomous Engine.
              </p>
            </div>
          </div>
        </footer>
      )}

      {/* =========================================================
          VARIAN 5: footer-status-bar (Gaya Bilah Status Node & Navigasi Horisontal Korporat)
         ========================================================= */}
      {v === "footer-status-bar" && (
        <footer className="relative w-screen left-1/2 -translate-x-1/2 border-t border-(--theme-border) bg-(--theme-surface)/30 backdrop-blur-2xl text-(--theme-muted) py-12 overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 md:px-12 space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-(--theme-border)/40">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-heading text-base font-bold text-(--theme-text)">
                    {company}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-(--theme-primary)/10 text-(--theme-primary) border border-(--theme-primary)/20 rounded">
                    ENTERPRISE NODE
                  </span>
                </div>
                <p className="font-sub text-xs text-(--theme-muted) font-light">
                  {tagline}
                </p>
              </div>

              <div className="flex items-center gap-4 bg-(--theme-surface)/60 px-4 py-2 border border-(--theme-border) rounded-lg">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-600 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                <span className="font-mono text-xs text-(--theme-text)">
                  SYSTEM_HEALTH: 99.99% UPTIME
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {columns.map((col, idx) => (
                <div key={idx} className="space-y-3">
                  <h4 className="font-heading text-xs font-semibold uppercase tracking-widest text-(--theme-text)">
                    {col.title}
                  </h4>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {col.links.map((link: FooterLink, lIdx: number) => {
                      const smartHref = getSmartHref(link.href);
                      return (
                        <Link
                          key={lIdx}
                          href={smartHref}
                          className="font-sub text-xs text-(--theme-muted) hover:text-(--theme-primary) transition-colors"
                        >
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-(--theme-border)/30 flex flex-col sm:flex-row items-center justify-between text-xs font-sub">
              <p>
                © {currentYear} {company}. All rights reserved.
              </p>
              <p className="font-mono text-[11px] text-(--theme-muted)/70">
                SECURE_CLUSTER_ID: #8809-YLBH
              </p>
            </div>
          </div>
        </footer>
      )}
    </>
  );
}
