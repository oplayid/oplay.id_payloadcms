"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { mediaUrl, type MediaLike } from "@/lib/mediaUrl";
import {
  Sparkles,
  Terminal,
  ShieldCheck,
  Zap,
  ArrowRight,
  Activity,
} from "lucide-react";

type HeroBannerData = {
  variant?: string;
  badge?: string;
  title: string;
  subtitle: string;
  align?: "left" | "center";
  bgImage?: MediaLike;
  cta?: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
};

export default function HeroBannerBlock({ data }: { data: HeroBannerData }) {
  const v = data.variant || "hero-standard";
  const isCentered = data.align === "center";

  // Render Background menggunakan Next/Image dengan efek zoom-in lembut
  const renderImageBackground = () => {
    const bgSrc = mediaUrl(data.bgImage, "hero");
    if (!bgSrc) return null;
    return (
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: 1.05 }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          className="w-full h-full relative"
        >
          <Image
            src={bgSrc}
            alt="Hero Background"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-40"
          />
        </motion.div>
        {/* Overlay Gelap Ringan & Elegan dengan Glow Radial */}
        <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/30 to-black/60 backdrop-blur-[0.5px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />
      </div>
    );
  };

  return (
    <>
      {/* =========================================================
          VARIAN BARU: hero-casual-elegant (Casual, Smooth & Mengalir)
         ========================================================= */}
      {v === "hero-casual-elegant" && (
        <div className="relative w-screen left-1/2 -translate-x-1/2 overflow-hidden min-h-[90vh] -mt-16 md:-mt-28 pt-48 pb-20 flex flex-col justify-center bg-[#0a0a0c] text-white">
          {renderImageBackground()}

          {/* Efek Gradasi Lembut di Sudut */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-87.5 bg-linear-to-tr from-indigo-600/20 via-purple-500/15 to-pink-500/10 rounded-full blur-[140px] pointer-events-none" />

          <div className="relative z-10 max-w-5xl mx-auto w-full px-6 md:px-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center space-y-8"
            >
              {/* Badge Minimalis Elegan */}
              {data.badge && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/6 border border-white/10 text-gray-300 text-xs font-light tracking-wide backdrop-blur-xl shadow-2xl"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  <span>{data.badge}</span>
                </motion.div>
              )}

              {/* Judul Utama dengan Nuansa Estetik */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.3,
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="font-heading text-4xl md:text-6xl lg:text-7xl font-normal tracking-tight text-white max-w-4xl leading-[1.15]"
              >
                {data.title}{" "}
                <span className="font-light italic text-transparent bg-clip-text bg-linear-to-r from-indigo-300 via-purple-300 to-pink-300">
                  effortlessly.
                </span>
              </motion.h1>

              {/* Subtitle Ringan */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.4,
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="font-sub text-base md:text-lg text-gray-400 max-w-xl font-light leading-relaxed"
              >
                {data.subtitle}
              </motion.p>

              {/* Tombol CTA dengan Efek Membal Halus (Spring Physics) */}
              {(data.cta || data.secondaryCta) && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="pt-4 flex flex-wrap items-center justify-center gap-4"
                >
                  {data.cta && (
                    <motion.a
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      href={data.cta.href}
                      className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-white text-black font-medium text-xs tracking-wide shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:bg-gray-100 transition-colors"
                    >
                      <span>{data.cta.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-black" />
                    </motion.a>
                  )}

                  {data.secondaryCta && (
                    <motion.a
                      whileHover={{
                        scale: 1.03,
                        backgroundColor: "rgba(255,255,255,0.08)",
                      }}
                      whileTap={{ scale: 0.97 }}
                      href={data.secondaryCta.href}
                      className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/4 border border-white/10 text-gray-300 font-medium text-xs tracking-wide backdrop-blur-xl transition-all"
                    >
                      {data.secondaryCta.label}
                    </motion.a>
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      )}

      {/* =========================================================
          VARIAN 1: hero-standard (Animatif & Mulus)
         ========================================================= */}
      {v === "hero-standard" && (
        <div className="relative w-screen left-1/2 -translate-x-1/2 overflow-hidden h-screen -mt-16 md:-mt-28 pt-32 flex flex-col justify-center bg-(--theme-surface)">
          {renderImageBackground()}
          <div className="relative z-10 max-w-7xl mx-auto w-full px-6 md:px-12 my-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`flex flex-col py-8 ${
                isCentered
                  ? "items-center text-center"
                  : "items-start text-left"
              }`}
            >
              {data.badge && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  style={{ borderRadius: "var(--theme-radius-btn)" }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 text-xs font-medium tracking-wider text-(--theme-text) uppercase bg-white/10 border border-white/20 backdrop-blur-md shadow-lg"
                >
                  <Sparkles className="w-3 h-3 text-(--theme-primary)" />
                  {data.badge}
                </motion.div>
              )}

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
                className="font-heading text-3xl md:text-5xl font-semibold tracking-tight text-white mb-4 max-w-3xl drop-shadow-md"
              >
                {data.title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7 }}
                className="font-sub text-base md:text-lg text-gray-200 max-w-2xl leading-relaxed font-light mb-8 drop-shadow"
              >
                {data.subtitle}
              </motion.p>

              {data.cta && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <a
                    href={data.cta.href}
                    style={{
                      borderRadius: "var(--theme-radius-btn)",
                      boxShadow: "var(--theme-shadow)",
                    }}
                    className="group inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-(--theme-primary-text) bg-(--theme-primary) hover:opacity-95 transition-all transform hover:-translate-y-0.5 font-sub"
                  >
                    <span>{data.cta.label}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      )}

      {/* =========================================================
          VARIAN 2: hero-cyber-terminal (Futuristik & Glow Terminal)
         ========================================================= */}
      {v === "hero-cyber-terminal" && (
        <div className="relative w-screen left-1/2 -translate-x-1/2 overflow-hidden min-h-112.5 flex flex-col justify-center -mt-16 md:-mt-28 mb-6 border-y border-(--theme-primary)/30 font-mono pt-40 pb-16 bg-black">
          {renderImageBackground()}

          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_50%,rgba(0,0,0,0.25)_50%)] bg-size-[100%_4px] pointer-events-none opacity-20" />

          <div className="relative z-10 max-w-7xl mx-auto w-full px-6 md:px-12">
            <motion.div
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.7 }}
              className={`flex flex-col ${
                isCentered
                  ? "items-center text-center"
                  : "items-start text-left"
              } space-y-6`}
            >
              <div className="flex items-center gap-2 px-3 py-1 bg-(--theme-primary)/20 border border-(--theme-primary)/40 rounded text-[11px] text-(--theme-primary) backdrop-blur-sm shadow-[0_0_15px_rgba(var(--theme-primary),0.2)]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Terminal className="w-3.5 h-3.5" />
                <span>SYSTEM_STATE: SECURE_AI_AUTONOMOUS</span>
              </div>

              {data.badge && (
                <span className="text-xs text-gray-300 uppercase tracking-widest flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-(--theme-primary)" />
                  // {data.badge}
                </span>
              )}

              <h1 className="font-heading text-3xl md:text-6xl font-bold tracking-tight text-white max-w-4xl drop-shadow-[0_0_25px_rgba(255,255,255,0.2)]">
                {data.title}
              </h1>

              <p className="text-sm md:text-base text-gray-300 max-w-2xl font-light leading-relaxed">
                &gt; {data.subtitle}
              </p>

              {data.cta && (
                <div className="pt-4 flex flex-wrap gap-4">
                  <a
                    href={data.cta.href}
                    className="px-6 py-3 text-xs font-bold uppercase tracking-wider bg-(--theme-primary) text-black rounded hover:opacity-90 transition-all shadow-[0_0_25px_rgba(var(--theme-primary),0.4)] transform hover:scale-105 active:scale-95"
                  >
                    {data.cta.label} _
                  </a>
                  {data.secondaryCta && (
                    <a
                      href={data.secondaryCta.href}
                      className="px-6 py-3 text-xs font-bold uppercase tracking-wider bg-white/10 border border-white/20 text-white rounded hover:bg-white/20 transition-all backdrop-blur-sm"
                    >
                      {data.secondaryCta.label}
                    </a>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}

      {/* =========================================================
          VARIAN 3: hero-split-bento (Modern Bento Grid dengan Efek Melayang)
         ========================================================= */}
      {v === "hero-split-bento" && (
        <div className="relative w-screen left-1/2 -translate-x-1/2 overflow-hidden -mt-16 md:-mt-28 pt-44 pb-20 mb-6 border-y border-white/10 bg-(--theme-surface)">
          {renderImageBackground()}
          <div className="max-w-7xl mx-auto w-full px-6 md:px-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="lg:col-span-7 space-y-6"
              >
                {data.badge && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono bg-white/10 border border-white/20 rounded-full text-(--theme-primary) backdrop-blur-sm">
                    <Sparkles className="w-3 h-3" />
                    {data.badge}
                  </span>
                )}
                <h1 className="font-heading text-3xl md:text-5xl font-semibold tracking-tight text-white leading-tight drop-shadow-md">
                  {data.title}
                </h1>
                <p className="font-sub text-base text-gray-200 font-light leading-relaxed max-w-xl">
                  {data.subtitle}
                </p>
                {data.cta && (
                  <div className="pt-2 flex flex-wrap gap-4">
                    <a
                      href={data.cta.href}
                      style={{ borderRadius: "var(--theme-radius-btn)" }}
                      className="group inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-(--theme-primary-text) bg-(--theme-primary) hover:opacity-95 shadow-md transition-all transform hover:-translate-y-1"
                    >
                      <span>{data.cta.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </a>
                    {data.secondaryCta && (
                      <a
                        href={data.secondaryCta.href}
                        style={{ borderRadius: "var(--theme-radius-btn)" }}
                        className="inline-flex items-center px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white bg-white/10 border border-white/20 hover:bg-white/20 transition-all backdrop-blur-sm"
                      >
                        {data.secondaryCta.label}
                      </a>
                    )}
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="lg:col-span-5"
              >
                <div
                  style={{ borderRadius: "var(--theme-radius-box)" }}
                  className="p-8 bg-black/70 border border-white/20 backdrop-blur-xl space-y-6 shadow-2xl relative overflow-hidden group hover:border-(--theme-primary)/50 transition-colors"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-(--theme-primary)/20 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />

                  <div className="space-y-2 relative z-10">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-(--theme-primary) uppercase tracking-widest">
                      <ShieldCheck className="w-4 h-4" />
                      <span>NODE_SECURITY_METRIC</span>
                    </div>
                    <h3 className="font-heading text-lg font-bold text-white">
                      AES-256 Client Data Isolation
                    </h3>
                    <p className="font-sub text-xs text-gray-300 font-light">
                      Infrastruktur otonom korporat yang dirancang khusus untuk
                      kepatuhan hukum tertinggi di Indonesia.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs font-mono text-gray-300 relative z-10">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      STATUS: ACTIVE
                    </span>
                    <span className="text-emerald-400 font-bold">
                      99.99% UPTIME
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          VARIAN 4: hero-holographic-glow (Efek Hologram Bersinar)
         ========================================================= */}
      {v === "hero-holographic-glow" && (
        <div className="relative w-screen left-1/2 -translate-x-1/2 overflow-hidden -mt-16 md:-mt-28 pt-48 pb-24 mb-6 bg-black">
          {renderImageBackground()}

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-125 h-125 bg-(--theme-primary)/15 rounded-full blur-[100px] animate-pulse" />
          </div>

          <div className="max-w-5xl mx-auto w-full px-6 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              style={{ borderRadius: "var(--theme-radius-box)" }}
              className="p-10 md:p-16 bg-black/60 border border-(--theme-primary)/40 backdrop-blur-xl shadow-[0_0_50px_rgba(var(--theme-primary),0.15)] relative overflow-hidden space-y-6"
            >
              {data.badge && (
                <motion.span
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1 text-[10px] uppercase font-mono tracking-widest bg-(--theme-primary)/20 border border-(--theme-primary)/40 text-(--theme-primary) rounded-full"
                >
                  <Activity className="w-3 h-3 animate-spin" />
                  {data.badge}
                </motion.span>
              )}

              <h1 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-white max-w-3xl mx-auto drop-shadow-lg">
                {data.title}
              </h1>

              <p className="font-sub text-sm md:text-base text-gray-200 max-w-2xl mx-auto font-light leading-relaxed">
                {data.subtitle}
              </p>

              {data.cta && (
                <div className="pt-4 flex justify-center gap-4 flex-wrap">
                  <a
                    href={data.cta.href}
                    style={{ borderRadius: "var(--theme-radius-btn)" }}
                    className="inline-flex items-center gap-2 px-8 py-3.5 text-xs uppercase tracking-widest font-bold text-(--theme-primary-text) bg-(--theme-primary) hover:opacity-95 shadow-[0_0_20px_rgba(var(--theme-primary),0.4)] transition-transform hover:scale-105 active:scale-95"
                  >
                    <span>{data.cta.label}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  {data.secondaryCta && (
                    <a
                      href={data.secondaryCta.href}
                      style={{ borderRadius: "var(--theme-radius-btn)" }}
                      className="inline-flex items-center px-8 py-3.5 text-xs uppercase tracking-widest font-bold text-white bg-white/10 border border-white/20 hover:bg-white/20 transition-colors backdrop-blur-sm"
                    >
                      {data.secondaryCta.label}
                    </a>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}

      {/* =========================================================
          VARIAN 5: hero-status-ticker (Live Monitoring & Pulse Badge)
         ========================================================= */}
      {v === "hero-status-ticker" && (
        <div className="relative w-screen left-1/2 -translate-x-1/2 overflow-hidden -mt-16 md:-mt-28 pt-44 pb-20 mb-6 border-b border-white/10 bg-(--theme-surface)">
          {renderImageBackground()}

          <div className="max-w-7xl mx-auto w-full px-6 md:px-12 text-center space-y-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-4 py-1.5 bg-black/60 border border-white/20 rounded-full text-xs font-mono backdrop-blur-md shadow-lg"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-white tracking-wider">
                ENTERPRISE LEGAL ECOSYSTEM LIVE
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4 max-w-4xl mx-auto"
            >
              {data.badge && (
                <span className="text-xs uppercase font-mono tracking-widest text-(--theme-primary) block">
                  // {data.badge}
                </span>
              )}
              <h1 className="font-heading text-4xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-md">
                {data.title}
              </h1>
              <p className="font-sub text-base md:text-lg text-gray-200 font-light leading-relaxed max-w-2xl mx-auto">
                {data.subtitle}
              </p>
            </motion.div>

            {data.cta && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center gap-4 pt-4 flex-wrap"
              >
                <a
                  href={data.cta.href}
                  style={{ borderRadius: "var(--theme-radius-btn)" }}
                  className="px-6 py-3 text-xs uppercase tracking-widest font-semibold bg-(--theme-primary) text-(--theme-primary-text) hover:opacity-95 shadow-md transition-transform hover:scale-105"
                >
                  {data.cta.label}
                </a>
                {data.secondaryCta && (
                  <a
                    href={data.secondaryCta.href}
                    style={{ borderRadius: "var(--theme-radius-btn)" }}
                    className="px-6 py-3 text-xs uppercase tracking-widest font-semibold bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
                  >
                    {data.secondaryCta.label}
                  </a>
                )}
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          VARIAN 6: hero-minimal-bottom-left (Elegan, Sinematik di Kiri Bawah)
         ========================================================= */}
      {v === "hero-minimal-bottom-left" && (
        <div className="relative w-screen left-1/2 -translate-x-1/2 overflow-hidden h-[85vh] min-h-130 -mt-16 md:-mt-28 pt-32 flex flex-col justify-end bg-(--theme-surface)">
          {renderImageBackground()}

          <div className="relative z-10 max-w-7xl mx-auto w-full px-6 md:px-16 pb-16 md:pb-20">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-start text-left max-w-3xl space-y-5"
            >
              {data.badge && (
                <div
                  style={{ borderRadius: "var(--theme-radius-btn)" }}
                  className="inline-flex items-center gap-2 px-3 py-1 text-[11px] font-mono tracking-widest text-white uppercase bg-white/10 border border-white/15 backdrop-blur-md shadow-md"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-(--theme-primary) animate-pulse" />
                  {data.badge}
                </div>
              )}

              <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl font-light tracking-tight text-white leading-[1.15] drop-shadow-lg">
                {data.title}
              </h1>

              <p className="font-sub text-sm md:text-base text-gray-300 max-w-xl leading-relaxed font-light drop-shadow">
                {data.subtitle}
              </p>

              {(data.cta || data.secondaryCta) && (
                <div className="pt-3 flex flex-wrap items-center gap-4">
                  {data.cta && (
                    <a
                      href={data.cta.href}
                      style={{
                        borderRadius: "var(--theme-radius-btn)",
                        boxShadow: "var(--theme-shadow)",
                      }}
                      className="group inline-flex items-center gap-2 px-7 py-3 text-xs font-mono uppercase tracking-widest text-(--theme-primary-text) bg-(--theme-primary) hover:opacity-90 transition-all shadow-lg transform hover:-translate-y-0.5"
                    >
                      <span>{data.cta.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </a>
                  )}
                  {data.secondaryCta && (
                    <a
                      href={data.secondaryCta.href}
                      style={{
                        borderRadius: "var(--theme-radius-btn)",
                      }}
                      className="inline-flex items-center justify-center px-7 py-3 text-xs font-mono uppercase tracking-widest text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all backdrop-blur-sm"
                    >
                      {data.secondaryCta.label}
                    </a>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}

      {/* =========================================================
          VARIAN 7: hero-saas-showcase (Modern SaaS & Floating Mockup)
         ========================================================= */}
      {v === "hero-saas-showcase" && (
        <div className="relative w-screen left-1/2 -translate-x-1/2 overflow-hidden -mt-16 md:-mt-28 pt-48 pb-24 flex flex-col items-center justify-center bg-[#070709] text-white">
          {renderImageBackground()}

          {/* Latar Belakang Cahaya Ambient (Glow Mesh) */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-87.5 bg-linear-to-tr from-(--theme-primary)/20 via-purple-600/15 to-blue-500/10 rounded-full blur-[140px] pointer-events-none" />

          <div className="relative z-10 max-w-6xl mx-auto w-full px-6 md:px-12 flex flex-col items-center text-center">
            {/* 1. Header & Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center space-y-6 max-w-4xl"
            >
              {data.badge && (
                <div
                  style={{ borderRadius: "var(--theme-radius-btn)" }}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/5 border border-white/10 text-gray-200 text-xs font-mono tracking-wide backdrop-blur-xl shadow-lg"
                >
                  <Sparkles className="w-3.5 h-3.5 text-(--theme-primary) animate-pulse" />
                  <span>{data.badge}</span>
                </div>
              )}

              <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.12] text-white">
                {data.title}
              </h1>

              <p className="font-sub text-base md:text-lg text-gray-300 max-w-2xl font-light leading-relaxed">
                {data.subtitle}
              </p>

              {/* Action Buttons */}
              {(data.cta || data.secondaryCta) && (
                <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
                  {data.cta && (
                    <motion.a
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      href={data.cta.href}
                      style={{ borderRadius: "var(--theme-radius-btn)" }}
                      className="group inline-flex items-center gap-2 px-8 py-3.5 text-xs font-medium uppercase tracking-wider bg-(--theme-primary) text-(--theme-primary-text) shadow-[0_0_30px_rgba(var(--theme-primary),0.3)] hover:opacity-90 transition-all"
                    >
                      <span>{data.cta.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </motion.a>
                  )}

                  {data.secondaryCta && (
                    <motion.a
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      href={data.secondaryCta.href}
                      style={{ borderRadius: "var(--theme-radius-btn)" }}
                      className="inline-flex items-center gap-2 px-7 py-3.5 text-xs font-medium uppercase tracking-wider bg-white/5 border border-white/15 text-gray-200 backdrop-blur-md hover:bg-white/10 transition-all"
                    >
                      {data.secondaryCta.label}
                    </motion.a>
                  )}
                </div>
              )}
            </motion.div>

            {/* 2. Floating App Mockup Window */}
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="mt-14 w-full max-w-4xl"
            >
              <div
                style={{ borderRadius: "var(--theme-radius-box)" }}
                className="relative p-2 md:p-3 bg-white/5 border border-white/15 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden group hover:border-(--theme-primary)/40 transition-colors"
              >
                {/* Mockup Header Window Controls */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-black/40 rounded-t-lg">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="text-[11px] font-mono text-gray-400 bg-white/5 px-4 py-0.5 rounded border border-white/5">
                    oplay.id — autonomous-legal-core v2.4
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    ONLINE
                  </div>
                </div>

                {/* Mockup Body Content Preview */}
                <div className="p-6 md:p-8 bg-black/70 rounded-b-lg space-y-4 text-left font-mono">
                  <div className="flex items-center gap-2 text-xs text-(--theme-primary)">
                    <Terminal className="w-4 h-4" />
                    <span>query --target="analisis_kontrak_korporat"</span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-300 font-light leading-relaxed">
                    &gt; AI Digital Twin mengisolasi klausa risiko tinggi dan
                    memvalidasi terhadap KUHPerdata & UU ITE secara otomatis
                    dalam 0.42 detik.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2 text-[10px]">
                    <span className="px-2.5 py-1 rounded bg-white/10 text-gray-300 border border-white/10">
                      Kepatuhan Hukum: 100%
                    </span>
                    <span className="px-2.5 py-1 rounded bg-white/10 text-gray-300 border border-white/10">
                      Enkripsi: AES-256
                    </span>
                    <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Status: Verifikasi Sukses
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </>
  );
}
