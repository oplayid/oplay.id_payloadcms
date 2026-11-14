"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { mediaUrl, type MediaLike } from "@/lib/mediaUrl";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type VideoScrubItem = {
  videoUrl: MediaLike;
};

type VideoScrubData = {
  title?: string;
  subtitle?: string;
  items?: VideoScrubItem[];
};

export default function AppleVideoScrubBlock({
  data,
}: {
  data: VideoScrubData;
  themeLayout?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoUrl =
    mediaUrl(data?.items?.[0]?.videoUrl) ||
    "https://res.cloudinary.com/demo/video/upload/q_auto,f_auto/dog.mp4"; // Contoh video stabil Cloudinary

  useGSAP(
    () => {
      const video = videoRef.current;
      const container = containerRef.current;
      if (!video || !container) return;

      const initScrub = () => {
        // Pengecekan ekstra agar durasi benar-benar valid
        if (
          !video.duration ||
          isNaN(video.duration) ||
          !isFinite(video.duration)
        )
          return;

        video.pause();
        video.currentTime = 0;

        ScrollTrigger.create({
          trigger: container,
          start: "top top",
          end: "+=2500",
          scrub: 0.5,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
          onUpdate: (self) => {
            // PENGAMAN: Pastikan video.duration valid sebelum diset ke currentTime
            if (
              video.duration &&
              !isNaN(video.duration) &&
              isFinite(video.duration)
            ) {
              video.currentTime = self.progress * video.duration;
            }
          },
        });

        ScrollTrigger.refresh();
      };

      if (video.readyState >= 1) {
        initScrub();
      } else {
        video.addEventListener("loadedmetadata", initScrub);
        return () => {
          video.removeEventListener("loadedmetadata", initScrub);
        };
      }
    },
    { scope: containerRef, dependencies: [videoUrl] },
  );
  return (
    <div
      ref={containerRef}
      className="w-full h-screen flex flex-col items-center justify-center relative bg-(--theme-background) overflow-hidden"
    >
      {/* Header Teks */}
      <div className="text-center mb-6 z-10 px-4">
        {data?.title && (
          <h3 className="font-heading text-xs uppercase tracking-widest text-(--theme-primary) mb-2">
            // {data.title}
          </h3>
        )}
        {data?.subtitle && (
          <h2 className="font-heading text-2xl md:text-4xl font-bold text-(--theme-text)">
            {data.subtitle}
          </h2>
        )}
      </div>

      {/* Frame Pemutar Video */}
      <div className="w-[90%] max-w-4xl h-[55vh] rounded-3xl overflow-hidden shadow-2xl border border-(--theme-border) bg-black relative">
        <video
          ref={videoRef}
          src={videoUrl}
          muted
          playsInline /* PENTING: Wajib agar video bisa jalan inline di HP tanpaFullscreen otomatis */
          preload="auto"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
