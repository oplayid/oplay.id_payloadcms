"use client";

import React, { useState } from "react";
import Link from "next/link";
import Container from "@/components/ui/Container"; // (1) Mengimpor komponen Container terpusat
import { mediaUrl, mediaSrcSet, type MediaLike } from "@/lib/mediaUrl";

type ProfileItem = {
  id: string;
  name: string;
  role: string;
  category?: string;
  avatarUrl?: MediaLike; // Digunakan sebagai foto portrait utama
  bio: string;
  badge?: string;
  metrics?: {
    label: string;
    value: string;
  }[];
  skills?: string[];
  socialLinks?: {
    platform: "LinkedIn" | "GitHub" | "Website" | "Email";
    href: string;
  }[];
};

type ProfileHubData = {
  sectionBadge?: string;
  sectionTitle: string;
  sectionSubtitle?: string;
  enableCategoryFilter?: boolean;
  profiles: ProfileItem[];
};

// (2) Menerima prop opsional themeLayout untuk kontrol tata letak terpusat dari JSON tema
export default function ProfileHubBlock({
  data,
  themeLayout,
}: {
  data: ProfileHubData;
  themeLayout?: string;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = [
    "All",
    ...Array.from(
      new Set(data.profiles.map((p) => p.category).filter(Boolean)),
    ),
  ];

  const filteredProfiles = data.profiles.filter((profile) => {
    if (selectedCategory === "All") return true;
    return profile.category === selectedCategory;
  });

  return (
    <section className="w-full py-20">
      {/* (3) Menggunakan Container universal menggantikan max-w-7xl dan px-6 statis */}
      <Container containerClass={themeLayout}>
        {/* HEADER SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          {data.sectionBadge && (
            <div
              style={{ borderRadius: "var(--theme-radius-btn)" }}
              className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wider text-(--theme-muted) uppercase bg-white/5 border border-(--theme-border) font-sub"
            >
              {data.sectionBadge}
            </div>
          )}
          <h2 className="font-heading text-3xl md:text-5xl font-semibold tracking-tight text-(--theme-text) mb-4">
            {data.sectionTitle}
          </h2>
          {data.sectionSubtitle && (
            <p className="font-sub text-sm md:text-base text-(--theme-muted) font-light">
              {data.sectionSubtitle}
            </p>
          )}
        </div>

        {/* KATEGORI FILTER INTERAKTIF */}
        {data.enableCategoryFilter && categories.length > 2 && (
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((cat, idx) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedCategory(cat as string)}
                  style={{ borderRadius: "var(--theme-radius-btn)" }}
                  className={`px-5 py-2 text-xs font-medium transition-all font-sub uppercase tracking-wider ${
                    isActive
                      ? "bg-(--theme-primary) text-(--theme-primary-text) shadow-lg"
                      : "bg-(--theme-surface)/40 text-(--theme-muted) border border-(--theme-border) hover:text-(--theme-text) hover:bg-white/5"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* GRID PROFIL FOUNDER DENGAN VISUAL FOTO PENUH */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProfiles.map((profile, idx) => (
            <div
              key={idx}
              style={{
                borderRadius: "var(--theme-radius-box)",
                boxShadow: "var(--theme-shadow)",
              }}
              className="bg-(--theme-surface) border border-(--theme-border) group relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-(--theme-border-hover)"
            >
              {/* AREA VISUAL FOTO FOUNDER (Full Width di bagian atas kartu) */}
              <div className="relative w-full h-80 overflow-hidden bg-(--theme-surface)/50 border-b border-(--theme-border)">
                {profile.avatarUrl ? (
                  <img
                    src={mediaUrl(profile.avatarUrl, "card")}
                    srcSet={mediaSrcSet(profile.avatarUrl)}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    alt={profile.name}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  /* Placeholder Inisial Jika Foto Kosong */
                  <div className="w-full h-full flex items-center justify-center bg-white/5 font-heading text-4xl font-bold text-(--theme-muted)">
                    {profile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                )}

                {/* Gradient Overlay tipis di bawah foto agar menyatu dengan kartu */}
                <div className="absolute inset-0 bg-linear-to-t from-(--theme-bg)/60 via-transparent to-transparent opacity-60 pointer-events-none" />

                {/* Badge Eksklusif di atas foto */}
                {profile.badge && (
                  <div className="absolute top-4 right-4 z-10">
                    <span
                      style={{ borderRadius: "var(--theme-radius-btn)" }}
                      className="px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-(--theme-text) bg-(--theme-bg)/60 backdrop-blur-md border border-(--theme-border) shadow-lg"
                    >
                      {profile.badge}
                    </span>
                  </div>
                )}
              </div>

              {/* KONTEN INFORMASI FOUNDER */}
              <div className="p-8 flex flex-col justify-between flex-1">
                <div>
                  {/* Nama & Jabatan */}
                  <div className="mb-4">
                    <h3 className="font-heading text-2xl font-semibold text-(--theme-text) transition-colors">
                      {profile.name}
                    </h3>
                    <p className="font-sub text-xs font-semibold text-(--theme-primary) uppercase tracking-widest mt-1">
                      {profile.role}
                    </p>
                  </div>

                  {/* Bio / Latar Belakang */}
                  <p className="font-sub text-xs md:text-sm text-(--theme-muted) font-light leading-relaxed mb-6">
                    {profile.bio}
                  </p>

                  {/* Metrics / Pencapaian Founder */}
                  {profile.metrics && profile.metrics.length > 0 && (
                    <div
                      style={{ borderRadius: "var(--theme-radius-box)" }}
                      className="grid grid-cols-2 gap-3 mb-6 p-4 bg-white/5 border border-(--theme-border)"
                    >
                      {profile.metrics.map((m, mIdx) => (
                        <div key={mIdx}>
                          <span className="font-heading text-base font-semibold text-(--theme-text) block">
                            {m.value}
                          </span>
                          <span className="font-sub text-[10px] text-(--theme-muted) uppercase tracking-wider">
                            {m.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Keahlian / Spesialisasi (Skills Tags) */}
                  {profile.skills && profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {profile.skills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          style={{ borderRadius: "var(--theme-radius-btn)" }}
                          className="px-2.5 py-1 text-[10px] font-sub font-medium bg-white/5 border border-(--theme-border) text-(--theme-text)/90"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tautan Sosial / Profil Eksternal di Bagian Bawah */}
                {profile.socialLinks && profile.socialLinks.length > 0 && (
                  <div className="pt-4 border-t border-(--theme-border)/50 flex items-center justify-between">
                    <span className="font-sub text-[10px] text-(--theme-muted) uppercase tracking-widest">
                      Direct Network
                    </span>
                    <div className="flex items-center space-x-4">
                      {profile.socialLinks.map((social, sIdx) => (
                        <Link
                          key={sIdx}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-sub text-xs font-medium text-(--theme-muted) hover:text-(--theme-text) transition-colors"
                        >
                          {social.platform}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
