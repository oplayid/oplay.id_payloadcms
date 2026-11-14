"use client";

import React, { useState, useRef, useEffect } from "react";
import Container from "@/components/ui/Container";
import { mediaUrl, mediaSrcSet, type MediaLike } from "@/lib/mediaUrl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type ShowcaseItem = {
  title: string;
  description: string;
  tag?: string;
  image?: MediaLike;
  videoUrl?: MediaLike;
  link?: string;
};

type ShowcaseData = {
  variant?:
    | "hardware-video"
    | "bento-spotlight"
    | "sticky-stack"
    | "text-reveal";
  title?: string;
  subtitle?: string;
  items: ShowcaseItem[];
};

export default function AppleInteractiveShowcaseBlock({
  data,
  themeLayout,
}: {
  data: ShowcaseData;
  themeLayout?: string;
}) {
  const variant = data.variant || "bento-spotlight";
  const items = data.items || [];

  // State untuk Varian 2 (Bento Spotlight)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Ref untuk Varian 1 (Hardware Video Scroll-Scrub dengan GSAP)
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      variant === "hardware-video" &&
      videoRef.current &&
      videoSectionRef.current
    ) {
      const video = videoRef.current;

      const initScrollScrub = () => {
        if (!video.duration || isNaN(video.duration)) return;

        video.pause();
        video.currentTime = 0;

        const st = ScrollTrigger.create({
          trigger: videoSectionRef.current,
          start: "top top",
          end: "+=3500", // Durasi layar terkunci
          scrub: 0.5,
          pin: true, // Mengunci layar secara mutlak
          pinSpacing: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            video.currentTime = self.progress * video.duration;
          },
        });

        return () => {
          st.kill();
          ScrollTrigger.refresh();
        };
      };

      if (video.readyState >= 1) {
        return initScrollScrub();
      } else {
        video.addEventListener("loadedmetadata", initScrollScrub);
        return () => {
          video.removeEventListener("loadedmetadata", initScrollScrub);
        };
      }
    }
  }, [variant]);

  // =========================================================
  // KHUSUS VARIAN 1: Render Full Screen terpisah dari Container biasa
  // =========================================================
  if (variant === "hardware-video") {
    return (
      <div
        ref={videoSectionRef}
        className="w-full h-screen flex flex-col items-center justify-center relative bg-(--theme-background) overflow-hidden"
      >
        <div className="text-center mb-6 z-10 px-4">
          <h3 className="font-heading text-xs uppercase tracking-widest text-(--theme-primary) mb-2">
            // {data.title || "HARDWARE EXPERIENCE"}
          </h3>
          <h2 className="font-heading text-2xl md:text-4xl font-bold text-(--theme-text)">
            {data.subtitle || "Gulir untuk Menjelajahi Performa"}
          </h2>
        </div>
        <div className="w-[90%] max-w-4xl h-[55vh] rounded-3xl overflow-hidden shadow-2xl border border-(--theme-border) bg-black relative">
          <video
            ref={videoRef}
            src={
              mediaUrl(items[0]?.videoUrl) ||
              "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            }
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    );
  }

  // =========================================================
  // VARIAN LAINNYA (Bento, Sticky Stack, Text Reveal)
  // =========================================================
  return (
    <section className="w-full py-20 relative overflow-hidden">
      <Container containerClass={themeLayout}>
        {(data.title || data.subtitle) && (
          <div className="text-center max-w-2xl mx-auto mb-16">
            {data.title && (
              <h3 className="font-heading text-xs uppercase tracking-widest text-(--theme-muted) mb-3">
                // {data.title}
              </h3>
            )}
            {data.subtitle && (
              <h2 className="font-heading text-2xl md:text-4xl font-bold text-(--theme-text)">
                {data.subtitle}
              </h2>
            )}
          </div>
        )}

        {/* Varian 2: bento-spotlight */}
        {variant === "bento-spotlight" && (
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 relative"
          >
            {isHovered && (
              <div
                className="absolute pointer-events-none w-96 h-96 rounded-full bg-(--theme-primary)/15 blur-3xl transition-opacity duration-300 z-0"
                style={{
                  top: mousePosition.y - 192,
                  left: mousePosition.x - 192,
                }}
              />
            )}

            {items.map((item, idx) => (
              <div
                key={idx}
                className={`relative p-8 rounded-3xl bg-(--theme-surface)/50 border border-(--theme-border) backdrop-blur-xl overflow-hidden flex flex-col justify-between transition-all duration-500 hover:border-(--theme-primary)/50 hover:shadow-2xl ${
                  idx === 0 ? "md:col-span-2" : "md:col-span-1"
                }`}
              >
                <div>
                  {item.tag && (
                    <span className="inline-block px-3 py-1 mb-4 text-[10px] font-mono uppercase tracking-widest text-(--theme-primary) bg-(--theme-primary)/10 border border-(--theme-primary)/30 rounded-full">
                      {item.tag}
                    </span>
                  )}
                  <h4 className="font-heading text-lg md:text-xl font-bold text-(--theme-text) mb-2">
                    {item.title}
                  </h4>
                  <p className="font-sub text-xs md:text-sm text-(--theme-muted) font-light leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {item.image && (
                  <div className="mt-6 w-full h-48 rounded-2xl overflow-hidden relative shadow-inner bg-black/20 shrink-0">
                    <img
                      src={mediaUrl(item.image, "card")}
                      srcSet={mediaSrcSet(item.image)}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      alt={item.title || "Showcase image"}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Varian 3: sticky-stack */}
        {variant === "sticky-stack" && (
          <div className="max-w-3xl mx-auto space-y-12 pb-12">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="sticky p-8 md:p-12 rounded-3xl bg-(--theme-surface) border border-(--theme-border) shadow-2xl backdrop-blur-xl transition-transform"
                style={{
                  top: `${6 + idx * 3}rem`,
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs text-(--theme-primary)">
                    0{idx + 1} // PILAR UTAMA
                  </span>
                  {item.tag && (
                    <span className="text-[10px] font-mono px-2.5 py-1 bg-white/5 border border-(--theme-border) rounded-full text-(--theme-muted)">
                      {item.tag}
                    </span>
                  )}
                </div>
                <h4 className="font-heading text-xl md:text-2xl font-bold text-(--theme-text) mb-3">
                  {item.title}
                </h4>
                <p className="font-sub text-sm text-(--theme-muted) font-light leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Varian 4: text-reveal */}
        {variant === "text-reveal" && (
          <div className="max-w-4xl mx-auto py-12 text-center space-y-8">
            {items.map((item, idx) => (
              <div key={idx} className="group cursor-pointer">
                <h4 className="font-heading text-2xl md:text-5xl font-bold text-(--theme-muted) transition-colors duration-500 group-hover:text-(--theme-text) leading-tight">
                  {item.title}
                </h4>
                <p className="font-sub text-sm md:text-base text-(--theme-muted)/70 mt-2 font-light">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
