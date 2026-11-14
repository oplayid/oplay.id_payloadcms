"use client";

import React, { useState } from "react";
import Container from "@/components/ui/Container"; // (1) Mengimpor komponen Container terpusat

type FAQItem = {
  question: string;
  answer: string;
  category?: string;
};

type FAQHubData = {
  sectionBadge?: string;
  sectionTitle: string;
  sectionSubtitle?: string;
  variant?: "list" | "bento";
  enableAICopilot?: boolean;
  faqs: FAQItem[];
};

// (2) Menerima prop opsional themeLayout untuk kontrol tata letak terpusat dari JSON tema
export default function FAQHubBlock({
  data,
  themeLayout,
}: {
  data: FAQHubData;
  themeLayout?: string;
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  const variant = data.variant || "list";

  const filteredFaqs = data.faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAskAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;

    setIsThinking(true);
    setAiAnswer(null);

    setTimeout(() => {
      setAiAnswer(
        `Hasil analisis Oplay Legal Copilot untuk "${aiQuestion}": Berdasarkan kerangka regulasi dan standar kepatuhan enterprise kami, hal ini diatur di bawah protokol isolasi data ketat oplay.id dengan enkripsi tingkat lanjut.`,
      );
      setIsThinking(false);
    }, 1000);
  };

  return (
    <section className="w-full py-20">
      {/* (3) Menggunakan Container universal menggantikan max-w-5xl dan px-6 statis */}
      <Container containerClass={themeLayout}>
        {/* Header Section */}
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

        {/* Kotak Pencarian Pintar */}
        <div className="mb-10 max-w-xl mx-auto">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-(--theme-muted) text-sm">
              🔍
            </span>
            <input
              type="text"
              placeholder="Cari pertanyaan hukum, keamanan, atau sistem..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ borderRadius: "var(--theme-radius-btn)" }}
              className="w-full pl-11 pr-4 py-3 bg-(--theme-surface)/40 border border-(--theme-border) text-sm text-(--theme-text) placeholder-(--theme-muted)/50 backdrop-blur-md focus:outline-none focus:border-(--theme-border-hover) transition-all shadow-inner font-sub"
            />
          </div>
        </div>

        {/* VARIASI 1: LIST AKORDEON */}
        {variant === "list" && (
          <div className="space-y-4 mb-16">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, idx) => {
                const isOpen = openIdx === idx;
                return (
                  <div
                    key={idx}
                    style={{ borderRadius: "var(--theme-radius-box)" }}
                    className="bg-(--theme-surface)/30 border border-(--theme-border) backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-(--theme-border-hover)"
                  >
                    <button
                      onClick={() => setOpenIdx(isOpen ? null : idx)}
                      className="w-full p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                    >
                      <span className="font-sub text-base font-medium text-(--theme-text)">
                        {faq.question}
                      </span>
                      <span className="text-xs text-(--theme-muted) transform transition-transform duration-300">
                        {isOpen ? "▲" : "▼"}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-6 text-sm text-(--theme-muted) font-light leading-relaxed border-t border-(--theme-border)/50 pt-4 font-sub">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="font-sub text-center text-(--theme-muted) text-sm py-8">
                Tidak ada pertanyaan yang sesuai dengan pencarian Anda.
              </p>
            )}
          </div>
        )}

        {/* VARIASI 2: BENTO GRID MODERN */}
        {variant === "bento" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {filteredFaqs.map((faq, idx) => (
              <div
                key={idx}
                style={{
                  borderRadius: "var(--theme-radius-box)",
                  boxShadow: "var(--theme-shadow)",
                }}
                className="p-8 bg-(--theme-surface)/30 border border-(--theme-border) backdrop-blur-xl flex flex-col justify-between hover:border-(--theme-border-hover) transition-all duration-300"
              >
                <div>
                  {faq.category && (
                    <span
                      style={{ borderRadius: "var(--theme-radius-btn)" }}
                      className="inline-block px-2.5 py-0.5 mb-3 text-[10px] font-semibold tracking-widest text-(--theme-muted) uppercase bg-white/5 border border-(--theme-border) font-sub"
                    >
                      {faq.category}
                    </span>
                  )}
                  <h3 className="font-sub text-lg font-medium text-(--theme-text) mb-3">
                    {faq.question}
                  </h3>
                </div>
                <p className="font-sub text-sm text-(--theme-muted) font-light leading-relaxed pt-4 border-t border-(--theme-border)/50">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* FITUR TAMBAHAN: CHAT AI COPILOT */}
        {data.enableAICopilot && (
          <div
            style={{
              borderRadius: "var(--theme-radius-box)",
              boxShadow: "var(--theme-shadow)",
            }}
            className="relative overflow-hidden bg-(--theme-surface) border border-(--theme-border) p-8 md:p-10 backdrop-blur-2xl"
          >
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-xl mx-auto text-center">
              <span
                style={{ borderRadius: "var(--theme-radius-btn)" }}
                className="inline-block px-3 py-1 mb-3 text-[10px] font-semibold tracking-widest text-(--theme-muted) uppercase bg-white/5 border border-(--theme-border) font-sub"
              >
                AI Copilot Assistant
              </span>
              <h3 className="font-heading text-xl font-medium text-(--theme-text) mb-2">
                Belum Menemukan Jawaban yang Dicari?
              </h3>
              <p className="font-sub text-xs md:text-sm text-(--theme-muted) font-light mb-6">
                Ajukan pertanyaan khusus langsung ke Oplay Legal Copilot untuk
                analisis instan.
              </p>

              <div
                onClick={handleAskAI}
                className="flex flex-col sm:flex-row gap-3"
              >
                <input
                  type="text"
                  placeholder="Ketik pertanyaan hukum atau operasional..."
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  style={{ borderRadius: "var(--theme-radius-btn)" }}
                  className="flex-1 px-4 py-3 bg-(--theme-bg)/50 border border-(--theme-border) text-xs text-(--theme-text) placeholder-(--theme-muted)/50 focus:outline-none focus:border-(--theme-border-hover) font-sub"
                />
                <button
                  type="submit"
                  disabled={isThinking}
                  style={{ borderRadius: "var(--theme-radius-btn)" }}
                  className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-(--theme-primary-text) bg-(--theme-primary) hover:opacity-90 transition-all disabled:opacity-50 font-sub shadow-sm"
                >
                  {isThinking ? "Menganalisis..." : "Tanya AI"}
                </button>
              </div>

              {aiAnswer && (
                <div
                  style={{ borderRadius: "var(--theme-radius-box)" }}
                  className="mt-6 p-4 bg-(--theme-bg)/90 border border-(--theme-border) text-left text-xs text-(--theme-text) leading-relaxed animate-fadeIn font-sub"
                >
                  <div className="font-semibold text-(--theme-muted) mb-1 uppercase tracking-wider text-[10px] font-sub">
                    Respon Oplay Copilot:
                  </div>
                  {aiAnswer}
                </div>
              )}
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
