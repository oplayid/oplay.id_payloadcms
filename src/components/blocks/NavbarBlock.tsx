"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSite } from "@/components/SiteProvider";
import { mediaUrl, mediaSrcSet } from "@/lib/mediaUrl";

type NavbarBlockData = {
  variant?: string;
  brandName?: string;
  categories?: any[];
  languages?: any[];
  loginCta?: { label: string; href: string };
};

export default function NavbarBlock({ data }: { data: NavbarBlockData }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // State khusus untuk efek interaktif Dynamic Island
  const [isIslandExpanded, setIsIslandExpanded] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const site = useSite();

  const v = data.variant || "navbar-standard";
  const brandName = data.brandName || "oplay.id";
  const categories = data.categories || [];
  const languages = data.languages || [
    { code: "id", label: "ID", name: "Indonesia", flag: "🇮🇩" },
    { code: "en", label: "EN", name: "English", flag: "🇬🇧" },
  ];
  const loginCta = data.loginCta || { label: "Login", href: "/login" };

  const supportedLangCodes = languages.map((lang: any) => lang.code);
  const currentLang = site.locale;

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getSmartHref = (href: string) => {
    if (href?.startsWith("#")) {
      return `${pathname}${href}`;
    }

    return site.href(href);
  };

  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (href.includes("#")) {
      const [path, hash] = href.split("#");
      const targetBasePath = path.split("?")[0];
      const currentBasePath = pathname.split("?")[0];
      if (!hash) return;

      const scrollToElement = (targetHash: string) => {
        const element = document.getElementById(targetHash);
        if (element) {
          const navHeight = 60;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - navHeight;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
          window.history.pushState(null, "", `#${targetHash}`);
        }
      };

      if (!path || targetBasePath === currentBasePath) {
        e.preventDefault();
        scrollToElement(hash);
      } else {
        setTimeout(() => scrollToElement(hash), 200);
      }
    }
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
    setIsIslandExpanded(false);
  };

  const switchLanguage = (targetLang: string) => {
    if (targetLang === currentLang) return;

    const segments = pathname.split("/");
    const hasLangPrefix = supportedLangCodes.includes(segments[1]);

    if (targetLang === "id") {
      if (hasLangPrefix) {
        segments.splice(1, 1);
      }
    } else {
      if (hasLangPrefix) {
        segments[1] = targetLang;
      } else {
        segments.splice(1, 0, targetLang);
      }
    }

    let newPath = segments.join("/");
    if (newPath === "") newPath = "/";

    router.push(newPath, { scroll: false });
    setIsLangDropdownOpen(false);
    setIsMobileMenuOpen(false);
    setIsIslandExpanded(false);
  };

  const renderFullWidthMegaMenu = (cat: any) => {
    const hasSubItems = cat.items && cat.items.length > 0;
    if (!hasSubItems || activeDropdown !== cat.label) return null;

    return (
      <div
        style={{ boxShadow: "var(--theme-shadow)" }}
        className="absolute top-full left-0 w-full bg-(--theme-surface)/95 border-b border-(--theme-border) py-10 px-6 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-50 text-left"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cat.items
                .filter((item: any) => !item.isFeatured)
                .map((subItem: any, subIdx: number) => {
                  const subSmartHref = getSmartHref(subItem.href);
                  return (
                    <Link
                      key={subIdx}
                      href={subSmartHref}
                      scroll={false}
                      onClick={(e) => {
                        handleAnchorClick(e, subSmartHref);
                        setActiveDropdown(null);
                      }}
                      style={{ borderRadius: "var(--theme-radius-btn)" }}
                      className="p-4 bg-(--theme-surface)/30 hover:bg-white/5 transition-all group/item border border-transparent hover:border-(--theme-border-hover) flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-xs uppercase font-medium tracking-wider text-(--theme-text) block mb-1">
                          {subItem.label}
                        </span>
                        {subItem.description && (
                          <span className="text-[11px] text-(--theme-text)/80 font-light normal-case line-clamp-2">
                            {subItem.description}
                          </span>
                        )}
                      </div>
                      <span className="mt-3 text-[10px] font-mono tracking-widest text-(--theme-text)/70 group-hover/item:text-(--theme-text) transition-colors">
                        EKSPLORASI →
                      </span>
                    </Link>
                  );
                })}
            </div>

            <div className="md:col-span-5 border-t md:border-t-0 md:border-l border-(--theme-border) pt-6 md:pt-0 md:pl-8">
              {cat.items
                .filter((item: any) => item.isFeatured)
                .map((featured: any, fIdx: number) => {
                  const featSmartHref = getSmartHref(featured.href);
                  return (
                    <Link
                      key={fIdx}
                      href={featSmartHref}
                      scroll={false}
                      onClick={(e) => {
                        handleAnchorClick(e, featSmartHref);
                        setActiveDropdown(null);
                      }}
                      style={{ borderRadius: "var(--theme-radius-box)" }}
                      className="group/card relative border border-(--theme-border) bg-(--theme-surface)/40 block p-5 transition-all hover:border-(--theme-border-hover)"
                    >
                      {featured.image && (
                        <div
                          style={{ borderRadius: "var(--theme-radius-btn)" }}
                          className="relative w-full h-36 overflow-hidden mb-4"
                        >
                          <img
                            src={mediaUrl(featured.image, "card")}
                            srcSet={mediaSrcSet(featured.image)}
                            sizes="(max-width: 768px) 50vw, 280px"
                            alt={featured.label}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-(--theme-bg)/60 to-transparent" />
                          <span className="absolute bottom-2 left-3 font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 bg-white/10 backdrop-blur-md rounded-md text-(--theme-text)">
                            Unggulan
                          </span>
                        </div>
                      )}
                      <span className="text-xs uppercase font-semibold tracking-wider text-(--theme-text) block mb-1">
                        {featured.label}
                      </span>
                      <p className="text-xs text-(--theme-text)/80 font-light normal-case leading-relaxed">
                        {featured.description}
                      </p>
                    </Link>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderHamburgerButton = () => (
    <div className="md:hidden fixed top-3 right-4 z-99999 pointer-events-auto">
      <button
        type="button"
        style={{ borderRadius: "var(--theme-radius-box)" }}
        className="flex items-center justify-center w-12 h-12 bg-(--theme-surface) border border-(--theme-border) text-(--theme-text) shadow-2xl cursor-pointer select-none touch-manipulation active:scale-95 transition-all group"
        onClick={() => {
          setIsMobileMenuOpen((prev) => !prev);
        }}
        aria-label="Toggle Mobile Menu"
      >
        <div className="relative w-5 h-4 flex flex-col justify-between items-center overflow-hidden">
          <span
            className={`w-full h-0.5 bg-(--theme-text) rounded-full transition-all duration-300 transform origin-left ${
              isMobileMenuOpen
                ? "rotate-45 translate-x-0.5 translate-y-0.5"
                : ""
            }`}
          />
          <span
            className={`w-full h-0.5 bg-(--theme-text) rounded-full transition-all duration-300 ${
              isMobileMenuOpen ? "opacity-0 translate-x-3" : "opacity-100"
            }`}
          />
          <span
            className={`w-full h-0.5 bg-(--theme-text) rounded-full transition-all duration-300 transform origin-left ${
              isMobileMenuOpen
                ? "-rotate-45 translate-x-0.5 -translate-y-0.5"
                : ""
            }`}
          />
        </div>
      </button>
    </div>
  );

  const homeHref = site.href("/");
  const editorialSplit = Math.ceil(categories.length / 2);

  const renderEditorialCategory = (cat: any, idx: number) => {
    const hasSubItems = cat.items && cat.items.length > 0;
    const catHref = cat.href ? getSmartHref(cat.href) : null;
    const labelClass =
      "relative uppercase tracking-[0.18em] text-[11px] font-medium text-(--theme-text)/80 hover:text-(--theme-text) transition-colors py-3";

    return (
      <div
        key={`${cat.label}-${idx}`}
        className="static flex items-center"
        onMouseEnter={() => hasSubItems && setActiveDropdown(cat.label)}
        onMouseLeave={() => setActiveDropdown(null)}
      >
        {hasSubItems ? (
          <button
            type="button"
            onClick={() =>
              setActiveDropdown(activeDropdown === cat.label ? null : cat.label)
            }
            className={`${labelClass} flex items-center gap-1 cursor-pointer`}
          >
            <span>{cat.label}</span>
            <span
              className={`text-[9px] transition-transform duration-200 ${
                activeDropdown === cat.label ? "rotate-180" : ""
              }`}
            >
              ▼
            </span>
          </button>
        ) : catHref ? (
          <Link
            href={catHref}
            scroll={false}
            onClick={(e) => handleAnchorClick(e, catHref)}
            className={labelClass}
          >
            {cat.label}
          </Link>
        ) : (
          <span className="uppercase tracking-[0.18em] text-[11px] font-medium text-(--theme-text)/50 py-3">
            {cat.label}
          </span>
        )}
        {hasSubItems && renderFullWidthMegaMenu(cat)}
      </div>
    );
  };

  return (
    <>
      {/* =========================================================
          VARIAN 1: navbar-standard
         ========================================================= */}
      {v === "navbar-standard" && (
        <nav
          style={{ zIndex: 99999 }}
          className={`fixed top-0 left-0 w-full transition-all duration-300 ${
            isScrolled
              ? "bg-(--theme-surface) border-b border-(--theme-border) shadow-xl backdrop-blur-xl h-20"
              : "bg-transparent h-24"
          } flex items-center pointer-events-auto`}
        >
          <div className="mx-auto max-w-7xl px-6 w-full flex items-center justify-between relative">
            <Link
              href={homeHref}
              scroll={false}
              onClick={() => {
                setActiveDropdown(null);
                setIsMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex items-center space-x-3 group cursor-pointer"
            >
              <div className="w-3.5 h-3.5 bg-(--theme-primary) rounded-sm shadow-sm group-hover:rotate-45 transition-transform duration-300" />
              <span className="text-base font-semibold tracking-wider text-(--theme-text) uppercase font-heading">
                {brandName}
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-8 text-sm text-(--theme-text)/80">
              {categories.map((cat: any, idx: number) => {
                const hasSubItems = cat.items && cat.items.length > 0;
                return (
                  <div
                    key={idx}
                    className="h-full flex items-center static"
                    onMouseEnter={() =>
                      hasSubItems && setActiveDropdown(cat.label)
                    }
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button
                      onClick={() =>
                        hasSubItems &&
                        setActiveDropdown(
                          activeDropdown === cat.label ? null : cat.label,
                        )
                      }
                      className="relative uppercase tracking-wider text-xs font-medium text-(--theme-text)/80 hover:text-(--theme-text) transition-colors flex items-center gap-1 cursor-pointer py-4 group"
                    >
                      <span>{cat.label}</span>
                      {hasSubItems && (
                        <span
                          className={`text-[9px] transition-transform duration-200 ${
                            activeDropdown === cat.label ? "rotate-180" : ""
                          }`}
                        >
                          ▼
                        </span>
                      )}
                      <span className="absolute bottom-2 left-0 w-0 h-0.5 bg-(--theme-primary) group-hover:w-full transition-all duration-300 ease-out" />
                    </button>
                    {renderFullWidthMegaMenu(cat)}
                  </div>
                );
              })}
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <div className="relative">
                <button
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  style={{ borderRadius: "var(--theme-radius-btn)" }}
                  className="uppercase tracking-wider text-xs font-semibold text-(--theme-text) hover:opacity-80 flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-(--theme-border) transition-colors cursor-pointer"
                >
                  🌐 {currentLang.toUpperCase()}
                </button>
                {isLangDropdownOpen && (
                  <div
                    style={{
                      borderRadius: "var(--theme-radius-box)",
                      boxShadow: "var(--theme-shadow)",
                    }}
                    className="absolute right-0 mt-3 w-40 bg-(--theme-surface) border border-(--theme-border) py-2 z-20"
                  >
                    {languages.map((lang: any) => (
                      <button
                        key={lang.code}
                        onClick={() => switchLanguage(lang.code)}
                        className="w-full text-left px-4 py-2 text-xs uppercase text-(--theme-text)/80 hover:text-(--theme-text) hover:bg-white/5 flex items-center gap-2 cursor-pointer"
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href={getSmartHref(loginCta.href)}
                style={{ borderRadius: "var(--theme-radius-btn)" }}
                className="font-sub text-xs uppercase tracking-widest font-semibold text-(--theme-primary-text) px-4 py-2 bg-(--theme-primary) hover:bg-(--theme-primary-hover) transition-all shadow-md"
              >
                {loginCta.label}
              </Link>
            </div>

            <button
              type="button"
              className="md:hidden flex items-center justify-center w-12 h-12 text-(--theme-text) text-2xl font-bold bg-transparent border-0 cursor-pointer select-none touch-manipulation"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open Mobile Menu"
            >
              ☰
            </button>
          </div>
        </nav>
      )}

      {/* =========================================================
          VARIAN 2: navbar-cyber-terminal
         ========================================================= */}
      {v === "navbar-cyber-terminal" && (
        <nav
          style={{ zIndex: 9999 }}
          className="fixed top-0 left-0 w-full bg-black/95 border-b border-(--theme-primary)/40 backdrop-blur-3xl h-20 flex items-center font-mono shadow-2xl"
        >
          <div className="mx-auto max-w-7xl px-6 w-full flex items-center justify-between relative">
            <Link href={homeHref} className="flex items-center gap-3 group">
              <span className="w-2.5 h-2.5 bg-emerald-400 animate-ping rounded-full" />
              <span className="text-xs font-bold text-(--theme-text) tracking-widest uppercase">
                {brandName}{" "}
                <span className="text-(--theme-primary)">[SECURE_NODE]</span>
              </span>
            </Link>

            <div className="hidden lg:flex items-center space-x-6 text-xs">
              {categories.map((cat: any, idx: number) => {
                const hasSubItems = cat.items && cat.items.length > 0;
                return (
                  <div
                    key={idx}
                    className="h-full flex items-center static"
                    onMouseEnter={() =>
                      hasSubItems && setActiveDropdown(cat.label)
                    }
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button
                      onClick={() =>
                        hasSubItems &&
                        setActiveDropdown(
                          activeDropdown === cat.label ? null : cat.label,
                        )
                      }
                      className="text-gray-300 hover:text-(--theme-primary) transition-colors uppercase cursor-pointer flex items-center gap-1 py-4"
                    >
                      <span>// {cat.label}</span>
                      {hasSubItems && <span className="text-[9px]">▼</span>}
                    </button>
                    {renderFullWidthMegaMenu(cat)}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  switchLanguage(currentLang === "id" ? "en" : "id")
                }
                className="hidden md:block text-[11px] px-2.5 py-1 bg-(--theme-primary)/10 border border-(--theme-primary)/30 text-(--theme-primary) rounded hover:bg-(--theme-primary)/25 transition-colors cursor-pointer"
              >
                LANG: {currentLang.toUpperCase()}
              </button>
              <Link
                href={getSmartHref(loginCta.href)}
                className="hidden md:block text-xs px-4 py-2 bg-(--theme-primary) text-black font-bold uppercase rounded tracking-wider transition-all"
              >
                {loginCta.label}
              </Link>
              {renderHamburgerButton()}
            </div>
          </div>
        </nav>
      )}

      {/* =========================================================
          VARIAN 3: navbar-floating-island
         ========================================================= */}
      {v === "navbar-floating-island" && (
        <nav
          style={{ zIndex: 9999 }}
          className="fixed top-5 left-0 w-full px-4"
        >
          <div className="mx-auto max-w-5xl bg-(--theme-surface)/80 border border-(--theme-primary)/30 backdrop-blur-3xl rounded-full px-8 py-3.5 flex items-center justify-between shadow-2xl relative">
            <Link
              href={homeHref}
              className="font-heading text-xs font-bold uppercase tracking-widest text-(--theme-text) flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-(--theme-primary) animate-pulse" />
              {brandName}
            </Link>

            <div className="hidden md:flex items-center space-x-6 text-xs">
              {categories.map((cat: any, idx: number) => {
                const hasSubItems = cat.items && cat.items.length > 0;
                return (
                  <div
                    key={idx}
                    className="relative"
                    onMouseEnter={() =>
                      hasSubItems && setActiveDropdown(cat.label)
                    }
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button
                      onClick={() =>
                        hasSubItems &&
                        setActiveDropdown(
                          activeDropdown === cat.label ? null : cat.label,
                        )
                      }
                      className="text-(--theme-text)/80 hover:text-(--theme-text) font-sub font-medium cursor-pointer transition-colors flex items-center gap-1 py-2"
                    >
                      <span>{cat.label}</span>
                      {hasSubItems && <span className="text-[9px]">▾</span>}
                    </button>
                    {activeDropdown === cat.label && (
                      <div className="fixed top-24 left-0 w-full z-50">
                        {renderFullWidthMegaMenu(cat)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  switchLanguage(currentLang === "id" ? "en" : "id")
                }
                className="hidden md:block text-[10px] font-mono px-3 py-1 bg-white/5 border border-(--theme-border) rounded-full text-(--theme-text)/80 uppercase hover:text-(--theme-text) transition-colors cursor-pointer"
              >
                🌐 {currentLang}
              </button>
              <Link
                href={getSmartHref(loginCta.href)}
                className="hidden md:block text-xs font-sub font-semibold px-5 py-2 bg-(--theme-text) text-(--theme-bg) rounded-full shadow-md"
              >
                {loginCta.label}
              </Link>
              {renderHamburgerButton()}
            </div>
          </div>
        </nav>
      )}

      {/* =========================================================
          VARIAN 4: navbar-command-palette
         ========================================================= */}
      {v === "navbar-command-palette" && (
        <nav
          style={{ zIndex: 9999 }}
          className="fixed top-0 left-0 w-full bg-(--theme-base)/95 border-b border-(--theme-border) backdrop-blur-2xl h-20 flex items-center shadow-md"
        >
          <div className="mx-auto max-w-7xl px-6 w-full flex items-center justify-between relative">
            <Link
              href={homeHref}
              className="font-heading text-sm font-bold uppercase tracking-wider text-(--theme-text) flex items-center gap-2"
            >
              <span className="px-1.5 py-0.5 text-[9px] font-mono bg-(--theme-primary)/20 text-(--theme-primary) rounded">
                AI
              </span>
              {brandName}
            </Link>

            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/5 border border-(--theme-border) rounded-xl w-72 text-xs text-(--theme-text)/80">
              <span className="font-mono px-1.5 py-0.5 bg-white/10 rounded text-[10px]">
                ⌘K
              </span>
              <span>Ketik perintah otonom...</span>
            </div>

            <div className="flex items-center space-x-6">
              <div className="hidden lg:flex items-center gap-6 text-xs font-sub">
                {categories.map((cat: any, idx: number) => {
                  const hasSubItems = cat.items && cat.items.length > 0;
                  return (
                    <div
                      key={idx}
                      className="h-full flex items-center static"
                      onMouseEnter={() =>
                        hasSubItems && setActiveDropdown(cat.label)
                      }
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <button
                        onClick={() =>
                          hasSubItems &&
                          setActiveDropdown(
                            activeDropdown === cat.label ? null : cat.label,
                          )
                        }
                        className="text-(--theme-text)/80 hover:text-(--theme-text) cursor-pointer transition-colors py-4"
                      >
                        {cat.label} {hasSubItems && "▼"}
                      </button>
                      {renderFullWidthMegaMenu(cat)}
                    </div>
                  );
                })}
              </div>
              <Link
                href={getSmartHref(loginCta.href)}
                className="hidden md:inline-block text-xs font-semibold px-4 py-2 border border-(--theme-border) rounded-lg bg-(--theme-surface)/50 text-(--theme-text)"
              >
                {loginCta.label}
              </Link>
              {renderHamburgerButton()}
            </div>
          </div>
        </nav>
      )}

      {/* =========================================================
          VARIAN 5: navbar-dual-tier
         ========================================================= */}
      {v === "navbar-dual-tier" && (
        <nav
          style={{ zIndex: 9999 }}
          className="fixed top-0 left-0 w-full bg-(--theme-surface)/90 backdrop-blur-3xl border-b border-(--theme-border)"
        >
          <div className="border-b border-(--theme-border)/40 text-[10px] font-mono text-(--theme-text)/80 py-1.5 px-6 bg-black/20">
            <div className="mx-auto max-w-7xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
                <span className="tracking-widest font-medium">
                  SECURE CLUSTER: ONLINE (SLA 99.99%)
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="hidden sm:inline">AES-256 ENCRYPTED NODE</span>
                <button
                  onClick={() =>
                    switchLanguage(currentLang === "id" ? "en" : "id")
                  }
                  className="hover:text-(--theme-text) uppercase font-bold cursor-pointer text-(--theme-primary)"
                >
                  [ {currentLang.toUpperCase()} ]
                </button>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between relative">
            <Link
              href={homeHref}
              className="font-heading text-base font-bold text-(--theme-text) tracking-tight"
            >
              {brandName}
            </Link>

            <div className="hidden md:flex items-center space-x-8 text-xs uppercase tracking-wider font-sub">
              {categories.map((cat: any, idx: number) => {
                const hasSubItems = cat.items && cat.items.length > 0;
                return (
                  <div
                    key={idx}
                    className="h-16 flex items-center static"
                    onMouseEnter={() =>
                      hasSubItems && setActiveDropdown(cat.label)
                    }
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button
                      onClick={() =>
                        hasSubItems &&
                        setActiveDropdown(
                          activeDropdown === cat.label ? null : cat.label,
                        )
                      }
                      className="text-(--theme-text)/80 hover:text-(--theme-text) transition-colors cursor-pointer flex items-center gap-1 h-full"
                    >
                      <span>{cat.label}</span>
                      {hasSubItems && <span className="text-[9px]">▼</span>}
                    </button>
                    {renderFullWidthMegaMenu(cat)}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={getSmartHref(loginCta.href)}
                className="hidden md:inline-block text-xs font-semibold px-4 py-2 bg-(--theme-primary) text-white rounded-md shadow-md"
              >
                {loginCta.label}
              </Link>
              {renderHamburgerButton()}
            </div>
          </div>
        </nav>
      )}

      {/* =========================================================
          VARIAN 6: navbar-dynamic-island (Gaya Kapsul Interaktif Mengapung)
         ========================================================= */}
      {v === "navbar-dynamic-island" && (
        <header
          style={{ zIndex: 99999 }}
          className="fixed top-7 left-0 w-full px-4 pointer-events-none flex justify-center"
        >
          <div
            style={{
              boxShadow:
                "0 20px 40px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.15)",
            }}
            className={`pointer-events-auto transition-all duration-300 ease-out bg-black/85 backdrop-blur-3xl text-white rounded-[28px] border border-white/15 flex flex-col overflow-hidden ${
              isIslandExpanded
                ? "w-full max-w-3xl p-5 shadow-2xl"
                : "w-auto max-w-xl px-4 py-2.5 items-center gap-6"
            }`}
          >
            {/* Keadaan Utama: Kapsul Minimalis */}
            <div className="w-full flex items-center justify-between gap-6 relative">
              {/* Logo / Brand Sisi Kiri */}
              <Link
                href={homeHref}
                onClick={() => {
                  setIsIslandExpanded(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex items-center gap-2.5 group cursor-pointer shrink-0"
              >
                <div className="w-2.5 h-2.5 bg-(--theme-primary) rounded-full animate-ping shrink-0" />
                <span className="font-heading text-xs font-bold uppercase tracking-widest text-white">
                  {brandName}
                </span>
              </Link>

              {/* Teks Ringkas saat Tertutup */}
              {!isIslandExpanded && (
                <div className="hidden sm:flex items-center gap-4 text-[11px] font-mono text-gray-300">
                  <span className="px-2 py-0.5 bg-white/10 rounded-full text-white">
                    -----
                  </span>
                </div>
              )}

              {/* Tombol Kontrol Kanan (Trigger Expand & CTA) */}
              <div className="flex items-center gap-2 shrink-0 relative">
                {/* TOMBOL BAHASA KHUSUS VARIAN 6: Langsung ganti bahasa saat diklik tanpa dropdown */}
                <button
                  type="button"
                  onClick={() =>
                    switchLanguage(currentLang === "id" ? "en" : "id")
                  }
                  className="px-2.5 py-1 text-[10px] font-mono uppercase bg-white/10 hover:bg-white/25 rounded-full transition-colors cursor-pointer text-gray-200 flex items-center gap-1"
                  title="Ganti Bahasa"
                >
                  {/* Mengganti ikon berdasarkan bahasa saat ini */}
                  {currentLang === "id" ? "🇮🇩 ID" : "🏴󠁧󠁢󠁥󠁮󠁧󠁿 EN"}
                </button>

                {/* Tombol Login CTA */}
                <Link
                  href={getSmartHref(loginCta.href)}
                  onClick={() => setIsIslandExpanded(false)}
                  style={{
                    borderRadius: "var(--theme-radius-btn)",
                  }}
                  className="font-sub text-[10px] uppercase tracking-widest font-semibold text-(--theme-primary-text) px-3.5 py-1 bg-(--theme-primary) hover:bg-(--theme-primary-hover) transition-all shadow-sm"
                >
                  {loginCta.label}
                </Link>

                {/* Tombol Pemicu Animasi Ekspansi Kapsul */}
                <button
                  type="button"
                  onClick={() => setIsIslandExpanded(!isIslandExpanded)}
                  className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-xs text-white transition-transform cursor-pointer active:scale-95"
                  aria-label="Toggle Dynamic Island Menu"
                >
                  {isIslandExpanded ? "✕" : "☰"}
                </button>
              </div>
            </div>

            {/* Keadaan Terbuka: Daftar Navigasi Meluas (Expandable Content) */}
            {isIslandExpanded && (
              <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.map((cat: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 bg-white/5 border border-white/10 rounded-xl flex flex-col gap-2"
                    >
                      <span className="font-heading text-xs font-bold uppercase tracking-wider text-(--theme-primary)">
                        {cat.label}
                      </span>
                      {cat.items && (
                        <div className="flex flex-col gap-1.5 pl-2 border-l border-white/10">
                          {cat.items.map((sub: any, sIdx: number) => {
                            const subSmartHref = getSmartHref(sub.href);
                            return (
                              <Link
                                key={sIdx}
                                href={subSmartHref}
                                scroll={false}
                                onClick={(e) => {
                                  handleAnchorClick(e, subSmartHref);
                                  setIsIslandExpanded(false);
                                }}
                                className="text-[11px] text-gray-300 hover:text-white transition-colors"
                              >
                                {sub.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>
      )}

      {/* =========================================================
          VARIAN 7: navbar-editorial (Elegant Masthead, brand di tengah)
         ========================================================= */}
      {v === "navbar-editorial" && (
        <nav
          style={{ zIndex: 99999 }}
          className={`fixed top-0 left-0 w-full border-b border-(--theme-border)/30 backdrop-blur-3xl transition-all duration-500 pointer-events-auto ${
            isScrolled
              ? "bg-(--theme-surface)/80 shadow-lg"
              : "bg-(--theme-surface)/50"
          }`}
        >
          {/* Mobile Menu Trigger */}
          <div className="md:hidden h-16 px-6 flex items-center justify-between">
            <Link
              href={homeHref}
              className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-(--theme-text)"
            >
              {brandName}
            </Link>
            <button
              type="button"
              className="flex items-center justify-center w-12 h-12 text-(--theme-text) text-2xl font-bold bg-transparent border-0 cursor-pointer"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            >
              {isMobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>

          {/* Desktop View */}
          <div className="hidden md:block">
            {/* Top Bar (Language/Login) */}
            <div className="mx-auto max-w-7xl px-6 h-8 flex items-center justify-end gap-6 text-[9px] uppercase tracking-[0.2em] font-mono text-(--theme-text)/60">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  className="hover:text-(--theme-text) transition-colors cursor-pointer"
                >
                  🌐 {currentLang.toUpperCase()}
                </button>
                {isLangDropdownOpen && (
                  <div
                    style={{ borderRadius: "var(--theme-radius-box)" }}
                    className="absolute right-0 mt-2 w-32 bg-(--theme-surface) border border-(--theme-border) p-2 z-20 shadow-xl"
                  >
                    {languages.map((lang: any) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => switchLanguage(lang.code)}
                        className="w-full text-left px-2 py-1 text-[9px] uppercase hover:bg-white/5 cursor-pointer"
                      >
                        {lang.flag} {lang.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Link
                href={getSmartHref(loginCta.href)}
                className="hover:text-(--theme-text) underline underline-offset-4"
              >
                {loginCta.label}
              </Link>
            </div>

            {/* Masthead */}
            <div
              className={`mx-auto max-w-7xl px-6 grid grid-cols-[1fr_auto_1fr] items-center transition-all duration-500 ${
                isScrolled ? "h-14" : "h-20"
              }`}
            >
              <div className="flex items-center justify-end gap-8">
                {categories
                  .slice(0, editorialSplit)
                  .map((cat: any, idx: number) =>
                    renderEditorialCategory(cat, idx),
                  )}
              </div>
              <Link
                href={homeHref}
                className="px-8 font-heading font-bold uppercase text-(--theme-text) tracking-[0.3em] hover:text-(--theme-primary) transition-all duration-500"
              >
                {brandName}
              </Link>
              <div className="flex items-center justify-start gap-8">
                {categories
                  .slice(editorialSplit)
                  .map((cat: any, idx: number) =>
                    renderEditorialCategory(cat, idx + editorialSplit),
                  )}
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* MOBILE MENU COMMON DRAWER */}
      {isMobileMenuOpen && (
        <div
          style={{ zIndex: 999999 }}
          className="fixed inset-0 md:hidden flex justify-end"
        >
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setIsMobileMenuOpen(false)}
            onTouchStart={() => setIsMobileMenuOpen(false)}
          />

          <div
            style={{ borderRadius: "var(--theme-radius-box)" }}
            className="relative w-80 max-w-full bg-(--theme-surface) border-l border-(--theme-border) p-6 flex flex-col gap-6 shadow-2xl overflow-y-auto z-10 h-full"
          >
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="self-end text-(--theme-text)/80 hover:text-(--theme-text) text-lg p-2 cursor-pointer"
              aria-label="Close Menu"
            >
              ✕
            </button>

            <div className="flex flex-col gap-6">
              {categories.map((cat: any, idx: number) => (
                <div key={idx} className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-widest text-(--theme-text)">
                    {cat.label}
                  </span>
                  {cat.items && (
                    <div className="flex flex-col gap-2 pl-3 border-l border-(--theme-border)">
                      {cat.items.map((sub: any, sIdx: number) => {
                        const subSmartHref = getSmartHref(sub.href);
                        return (
                          <Link
                            key={sIdx}
                            href={subSmartHref}
                            onClick={(e) => {
                              handleAnchorClick(e, subSmartHref);
                              setIsMobileMenuOpen(false);
                            }}
                            className="text-xs text-(--theme-text)/80 hover:text-(--theme-text) py-1"
                          >
                            {sub.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              <div className="pt-4 border-t border-(--theme-border) flex flex-col gap-3">
                <Link
                  href={getSmartHref(loginCta.href)}
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ borderRadius: "var(--theme-radius-btn)" }}
                  className="text-xs uppercase tracking-widest font-semibold text-center py-2.5 bg-(--theme-primary) hover:bg-(--theme-primary-hover) text-(--theme-primary-text) transition-all"
                >
                  {loginCta.label}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
