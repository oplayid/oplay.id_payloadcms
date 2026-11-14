import React from "react";
import Container from "@/components/ui/Container"; // (1) Mengimpor komponen Container terpusat

type LegalStatsData = {
  labels: {
    cases: string;
    clients: string;
    accuracy: string;
    uptime: string;
  };
  casesProcessed: string;
  activeClients: string;
  aiAccuracy: string;
  uptime: string;
};

// (2) Menerima prop opsional themeLayout untuk kontrol tata letak terpusat dari JSON tema
export default function LegalStatsBlock({
  data,
  themeLayout,
}: {
  data: LegalStatsData;
  themeLayout?: string;
}) {
  // Fallback pengaman jika properti labels belum sempat diisi di JSON
  const labels = data.labels || {
    cases: "Cases Processed",
    clients: "Active Clients",
    accuracy: "AI Accuracy",
    uptime: "Uptime",
  };

  const stats = [
    { label: labels.cases, value: data.casesProcessed },
    { label: labels.clients, value: data.activeClients },
    { label: labels.accuracy, value: data.aiAccuracy },
    { label: labels.uptime, value: data.uptime },
  ];

  return (
    <section className="w-full py-12">
      {/* (3) Membungkus grid statistik menggunakan Container terpusat */}
      <Container containerClass={themeLayout}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              style={{
                borderRadius: "var(--theme-radius-box)",
                boxShadow: "var(--theme-shadow)",
              }}
              className="p-6 bg-(--theme-surface)/30 border border-(--theme-border) backdrop-blur-xl flex flex-col justify-center transition-all duration-300 hover:border-(--theme-border-hover)"
            >
              {/* Nilai statistik menggunakan font-heading */}
              <div className="font-heading text-3xl md:text-4xl font-semibold text-(--theme-text) mb-1">
                {stat.value}
              </div>
              {/* Label keterangan menggunakan font-sub */}
              <div className="font-sub text-xs font-medium text-(--theme-muted) uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
