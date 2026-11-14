"use client";

import React, { useState } from "react";
import Container from "@/components/ui/Container";
import { FaLinkedin } from "react-icons/fa";
type Experience = {
  role: string;
  company: string;
  period: string;
  location?: string;
  description: string[];
};

type CVData = {
  badge?: string;
  name: string;
  title: string;
  contact: {
    phone: string;
    email: string;
    linkedin: string;
    location: string;
  };
  summary: string;
  experiences: Experience[];
  skills: {
    personal: string[];
    computation: string[];
    technical: string[];
    certifications: string[];
  };
};

export default function ProfessionalCVBlock({
  data,
  themeLayout,
}: {
  data: CVData;
  themeLayout?: string;
}) {
  const [activeTab, setActiveTab] = useState<
    "experience" | "skills" | "summary"
  >("summary");
  const [isAnimating, setIsAnimating] = useState(false);

  const handleTabChange = (tab: "experience" | "skills" | "summary") => {
    if (tab === activeTab || isAnimating) return;
    setIsAnimating(true);
    setActiveTab(tab);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <section className="w-full py-20 relative overflow-hidden">
      <Container containerClass={themeLayout}>
        <div className="max-w-4xl mx-auto">
          {/* Header Profil Utama (Gaya Enterprise LegalTech) */}
          <div
            style={{
              borderRadius: "var(--theme-radius-box)",
              boxShadow: "var(--theme-shadow)",
            }}
            className="p-8 md:p-12 bg-(--theme-surface)/60 border border-(--theme-border) backdrop-blur-xl mb-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 font-mono text-8xl font-bold text-(--theme-primary) pointer-events-none select-none">
              CV
            </div>

            {data.badge && (
              <span className="inline-block px-3 py-1 mb-4 text-[10px] font-mono uppercase tracking-widest text-(--theme-primary) bg-(--theme-primary)/10 border border-(--theme-primary)/30 rounded-full">
                {data.badge}
              </span>
            )}

            <h1 className="font-heading text-2xl md:text-4xl font-bold text-(--theme-text) mb-2">
              {data.name}
            </h1>

            <p className="font-sub text-sm md:text-base text-(--theme-primary) font-semibold mb-4">
              {data.title} •{" "}
              <span className="text-(--theme-muted)">
                {data.contact.location}
              </span>
            </p>

            {/* Tautan Kontak Cepat dengan Ikon Resmi */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-(--theme-border) text-xs font-mono text-(--theme-muted)">
              <a
                href={`tel:${data.contact.phone}`}
                className="hover:text-(--theme-primary) transition-colors"
              >
                📞 {data.contact.phone}
              </a>
              <span>•</span>
              <a
                href={`mailto:${data.contact.email}`}
                className="hover:text-(--theme-primary) transition-colors"
              >
                ✉️ {data.contact.email}
              </a>
              <span>•</span>
              <a
                href={`https://${data.contact.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-(--theme-primary) transition-colors flex items-center gap-1.5"
              >
                <FaLinkedin className="w-4 h-4 text-(--theme-primary)" />
                <span>LinkedIn Profile</span>
              </a>
            </div>
          </div>

          {/* Tab Navigasi Interaktif (Efek Ganti Kertas / Dossier) */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {[
              { id: "summary", label: "01. PROFIL & RINGKASAN" },
              { id: "experience", label: "02. PENGALAMAN & MAGANG" },
              { id: "skills", label: "03. KEAHLIAN & SERTIFIKASI" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as any)}
                  style={{ borderRadius: "var(--theme-radius-btn)" }}
                  className={`px-5 py-3 text-xs font-sub font-semibold tracking-wider transition-all duration-200 cursor-pointer border shrink-0 ${
                    isActive
                      ? "bg-(--theme-primary) text-(--theme-primary-text) border-(--theme-primary) shadow-md scale-[1.02]"
                      : "bg-(--theme-surface)/40 text-(--theme-muted) border-(--theme-border) hover:bg-white/10 hover:text-(--theme-text)"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Konten Utama Berdasarkan Tab yang Dipilih */}
          <div
            style={{
              borderRadius: "var(--theme-radius-box)",
              boxShadow: "var(--theme-shadow)",
            }}
            className={`p-8 md:p-12 bg-(--theme-surface)/60 border border-(--theme-border) backdrop-blur-xl transition-all duration-300 transform ${
              isAnimating
                ? "opacity-0 translate-y-3 scale-[0.98]"
                : "opacity-100 translate-y-0 scale-100"
            }`}
          >
            {/* TAB 1: RINGKASAN */}
            {activeTab === "summary" && (
              <div>
                <h3 className="font-heading text-xs uppercase tracking-widest text-(--theme-muted) mb-4">
                  // EXECUTIVE_SUMMARY & BACKGROUND
                </h3>
                <div className="space-y-4 font-sub text-xs md:text-sm text-(--theme-text) font-light leading-relaxed text-justify">
                  {data.summary.split("\n\n").map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: PENGALAMAN KERJA & MAGANG */}
            {activeTab === "experience" && (
              <div className="space-y-8">
                <h3 className="font-heading text-xs uppercase tracking-widest text-(--theme-muted) mb-2">
                  // PROFESSIONAL_EXPERIENCE & LEGAL PRACTICE
                </h3>
                {data.experiences.map((exp, idx) => (
                  <div
                    key={idx}
                    className="border-b border-(--theme-border) pb-6 last:border-b-0 last:pb-0"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-baseline mb-2">
                      <h4 className="font-heading text-sm md:text-base font-bold text-(--theme-text)">
                        {exp.role}{" "}
                        <span className="text-(--theme-primary)">
                          — {exp.company}
                        </span>
                      </h4>
                      <span className="font-mono text-[11px] text-(--theme-muted) px-2 py-0.5 bg-white/5 border border-(--theme-border) rounded">
                        {exp.period}
                      </span>
                    </div>
                    <ul className="space-y-2 mt-3">
                      {exp.description.map((desc, dIdx) => (
                        <li
                          key={dIdx}
                          className="font-sub text-xs text-(--theme-muted) font-light leading-relaxed flex items-start text-justify"
                        >
                          <span className="text-(--theme-primary) mr-2">▪</span>
                          <span>{desc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: KEAHLIAN & SERTIFIKASI */}
            {activeTab === "skills" && (
              <div className="space-y-6">
                <h3 className="font-heading text-xs uppercase tracking-widest text-(--theme-muted) mb-4">
                  // COMPETENCIES_AND_CERTIFICATIONS
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-white/5 border border-(--theme-border) rounded-xl">
                    <h5 className="font-heading text-xs font-bold uppercase text-(--theme-primary) mb-2">
                      ⚖️ Kompetensi Teknis
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {data.skills.technical.map((s, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 text-[10px] font-mono bg-(--theme-primary)/10 text-(--theme-text) rounded"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 border border-(--theme-border) rounded-xl">
                    <h5 className="font-heading text-xs font-bold uppercase text-(--theme-primary) mb-2">
                      💻 Kemampuan Komputasi
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {data.skills.computation.map((s, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 text-[10px] font-mono bg-white/10 text-(--theme-text) rounded"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 border border-(--theme-border) rounded-xl">
                    <h5 className="font-heading text-xs font-bold uppercase text-(--theme-primary) mb-2">
                      🧠 Keterampilan Personal
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {data.skills.personal.map((s, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 text-[10px] font-mono bg-white/10 text-(--theme-text) rounded"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 border border-(--theme-border) rounded-xl">
                    <h5 className="font-heading text-xs font-bold uppercase text-(--theme-primary) mb-2">
                      📜 Pelatihan & Sertifikasi
                    </h5>
                    <ul className="space-y-1.5 text-xs text-(--theme-text) font-sub">
                      {data.skills.certifications.map((c, i) => (
                        <li key={i} className="flex items-center">
                          <span className="text-(--theme-primary) mr-2">✔</span>{" "}
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
