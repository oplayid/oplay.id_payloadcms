"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Container from "@/components/ui/Container";
import { mediaUrl, mediaSrcSet, type MediaLike } from "@/lib/mediaUrl";

type SocialLink = {
  platform: string;
  url: string;
  description?: string;
};

type ExperienceItem = {
  role: string;
  company: string;
  period: string;
  category: "work" | "organization" | "education" | "project";
  description: string;
  achievements?: string[]; // Poin-poin pencapaian / jobdesk rinci
  skills?: string[]; // Teknologi atau skill terkait
};

type BioProfileData = {
  variant?: string;
  avatarUrl?: MediaLike;
  name: string;
  title: string;
  bio: string;
  location?: string;
  badge?: string;
  links: SocialLink[];
  experiences?: ExperienceItem[];
};

export default function BioProfileBlock({
  data,
  themeLayout,
}: {
  data: BioProfileData;
  themeLayout?: string;
}) {
  const variant = data.variant || "bio-card-minimal";
  const [activeTab, setActiveTab] = useState<string>("all");

  const filteredExperiences =
    activeTab === "all"
      ? data.experiences
      : data.experiences?.filter((exp) => exp.category === activeTab);

  return (
    <section className="w-full pt-2 pb-10 sm:pt-4 sm:pb-12 md:pt-10 md:pb-20 relative overflow-hidden">
      <Container containerClass={themeLayout}>
        {/* =========================================================
            VARIAN 1: bio-card-minimal (Gaya Linktree Klasik + 3D Tilt Effect)
           ========================================================= */}
        {variant === "bio-card-minimal" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            whileHover={{ y: -4 }}
            style={{
              borderRadius: "var(--theme-radius-box)",
              boxShadow: "var(--theme-shadow)",
            }}
            className="max-w-xl mx-auto p-5 sm:p-8 md:p-10 bg-(--theme-surface)/40 border border-(--theme-border) backdrop-blur-xl text-center relative overflow-hidden group"
          >
            {/* Background Glow Animasi */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-(--theme-primary)/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

            {data.avatarUrl && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-5 sm:mb-6 rounded-full overflow-hidden border-2 border-(--theme-primary) shadow-xl relative"
              >
                <motion.img
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  src={mediaUrl(data.avatarUrl, "thumbnail")}
                  srcSet={mediaSrcSet(data.avatarUrl, ["thumbnail", "card"])}
                  sizes="112px"
                  alt={data.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}

            {data.badge && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-block px-3.5 py-1 mb-3 text-[10px] font-mono tracking-widest text-(--theme-primary) uppercase bg-(--theme-primary)/10 border border-(--theme-primary)/30 rounded-full shadow-xs"
              >
                {data.badge}
              </motion.span>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="font-heading text-xl sm:text-2xl md:text-3xl font-bold text-(--theme-text) mb-1"
            >
              {data.name}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-sub text-xs md:text-sm text-(--theme-primary) font-medium mb-4"
            >
              {data.title} {data.location && `• ${data.location}`}
            </motion.p>

            {/* Biografi Text-Justify */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="font-sub text-xs text-(--theme-muted) font-light leading-relaxed mb-6 sm:mb-8 max-w-md mx-auto space-y-3 text-justify px-1 sm:px-0"
            >
              {data.bio.split("\n\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </motion.div>

            {/* Tautan Sosial */}
            <div className="space-y-2.5 sm:space-y-3">
              {data.links.map((link, idx) => (
                <motion.a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.05 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ borderRadius: "var(--theme-radius-btn)" }}
                  className="w-full p-3.5 sm:p-4 bg-white/5 border border-(--theme-border) hover:border-(--theme-primary) text-(--theme-text) font-sub text-xs md:text-sm font-medium flex items-center justify-between transition-all duration-300 group/link hover:shadow-lg backdrop-blur-md"
                >
                  <div className="flex flex-col text-left">
                    <span className="group-hover/link:text-(--theme-primary) transition-colors font-semibold">
                      {link.platform}
                    </span>
                    {link.description && (
                      <span className="text-[10px] text-(--theme-muted) font-light">
                        {link.description}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-xs text-(--theme-muted) group-hover/link:translate-x-1.5 transition-transform">
                    →
                  </span>
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}

        {/* =========================================================
            VARIAN 2: cv-modern-resume (Gaya CV Interaktif & Pengalaman Multi-Kategori)
           ========================================================= */}
        {variant === "cv-modern-resume" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              borderRadius: "var(--theme-radius-box)",
              boxShadow: "var(--theme-shadow)",
            }}
            className="w-full max-w-4xl mx-auto p-4 sm:p-8 md:p-10 bg-(--theme-surface)/40 border border-(--theme-border) backdrop-blur-xl relative overflow-hidden"
          >
            {/* Header Profil */}
            <div className="flex flex-col-reverse sm:flex-row justify-between items-start sm:items-center gap-5 sm:gap-6 pb-6 sm:pb-8 border-b border-(--theme-border)">
              <div>
                {data.badge && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="inline-block px-2.5 py-1 mb-2 text-[10px] font-mono text-(--theme-primary) uppercase bg-(--theme-primary)/10 rounded"
                  >
                    {data.badge}
                  </motion.span>
                )}
                <motion.h1
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="font-heading text-xl sm:text-2xl md:text-3xl font-bold text-(--theme-text) mb-1"
                >
                  {data.name}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="font-sub text-xs md:text-sm text-(--theme-primary) font-medium"
                >
                  {data.title} {data.location && `• ${data.location}`}
                </motion.p>
              </div>
              {data.avatarUrl && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-(--theme-border) shadow-lg shrink-0 relative"
                >
                  <img
                    src={mediaUrl(data.avatarUrl, "thumbnail")}
                    srcSet={mediaSrcSet(data.avatarUrl, ["thumbnail", "card"])}
                    sizes="96px"
                    alt={data.name}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              )}
            </div>

            {/* Ringkasan Profesional */}
            <div className="py-5 sm:py-6 border-b border-(--theme-border)">
              <h3 className="font-heading text-[11px] sm:text-xs uppercase tracking-widest text-(--theme-muted) mb-3">
                // PROFESSIONAL_SUMMARY
              </h3>
              <div className="font-sub text-xs md:text-sm text-(--theme-text) font-light leading-relaxed space-y-3 text-justify">
                {data.bio.split("\n\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Riwayat Pengalaman dengan Tab Filter Interaktif */}
            {data.experiences && data.experiences.length > 0 && (
              <div className="py-6 sm:py-8 border-b border-(--theme-border)">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                  <h3 className="font-heading text-[11px] sm:text-xs uppercase tracking-widest text-(--theme-muted)">
                    // EXPERIENCE & TRACK_RECORD
                  </h3>

                  {/* Tombol Filter Kategori */}
                  <div className="flex flex-wrap gap-1.5 bg-white/5 p-1 rounded-lg border border-(--theme-border)">
                    {[
                      "all",
                      "work",
                      "organization",
                      "education",
                      "project",
                    ].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1 text-[10px] font-mono uppercase rounded-md transition-all ${
                          activeTab === tab
                            ? "bg-(--theme-primary) text-white font-semibold shadow-xs"
                            : "text-(--theme-muted) hover:text-(--theme-text)"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* List Pengalaman dengan AnimatePresence */}
                <div className="space-y-5">
                  <AnimatePresence mode="wait">
                    {filteredExperiences && filteredExperiences.length > 0 ? (
                      filteredExperiences.map((exp, idx) => (
                        <motion.div
                          key={`${exp.company}-${idx}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3, delay: idx * 0.05 }}
                          whileHover={{ x: 4 }}
                          className="p-4 rounded-xl bg-white/5 border border-(--theme-border) hover:border-(--theme-primary)/50 transition-all group"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline gap-1 sm:gap-0 mb-1.5">
                            <h4 className="font-heading text-xs sm:text-sm font-semibold text-(--theme-text) group-hover:text-(--theme-primary) transition-colors">
                              {exp.role} —{" "}
                              <span className="text-(--theme-primary)">
                                {exp.company}
                              </span>
                            </h4>
                            <span className="font-mono text-[10px] sm:text-[11px] px-2 py-0.5 rounded bg-(--theme-primary)/10 text-(--theme-primary)">
                              {exp.period}
                            </span>
                          </div>

                          <p className="font-sub text-xs text-(--theme-muted) font-light leading-relaxed text-justify mb-3">
                            {exp.description}
                          </p>

                          {/* Pencapaian / Jobdesk Rinci (Bullet points) */}
                          {exp.achievements && exp.achievements.length > 0 && (
                            <ul className="space-y-1 mb-3 pl-4 border-l border-(--theme-primary)/30">
                              {exp.achievements.map((ach, aIdx) => (
                                <li
                                  key={aIdx}
                                  className="font-sub text-[11px] text-(--theme-text)/80 text-justify list-disc"
                                >
                                  {ach}
                                </li>
                              ))}
                            </ul>
                          )}

                          {/* Skill Tags */}
                          {exp.skills && exp.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {exp.skills.map((skill, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-(--theme-muted) border border-(--theme-border)"
                                >
                                  #{skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      ))
                    ) : (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-(--theme-muted) italic text-center py-4 font-mono"
                      >
                        // Tidak ada data pada kategori ini.
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Quick Links & Kontak */}
            <div className="pt-5 sm:pt-6">
              <h3 className="font-heading text-[11px] sm:text-xs uppercase tracking-widest text-(--theme-muted) mb-3 sm:mb-4">
                // QUICK_LINKS & CONTACT
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {data.links.map((link, idx) => (
                  <motion.a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.01, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ borderRadius: "var(--theme-radius-btn)" }}
                    className="p-3 bg-white/5 border border-(--theme-border) hover:border-(--theme-primary) text-(--theme-text) font-sub text-xs flex items-center justify-between transition-all group"
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-medium group-hover:text-(--theme-primary) transition-colors">
                        {link.platform}
                      </span>
                      {link.description && (
                        <span className="text-[9px] text-(--theme-muted) font-light truncate max-w-50">
                          {link.description}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-(--theme-muted) group-hover:translate-x-0.5 transition-transform">
                      ↗
                    </span>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </Container>
    </section>
  );
}
