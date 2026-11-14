import React from "react";
import Container from "@/components/ui/Container";

type TierValue =
  | boolean
  | string
  | { included?: boolean | null; label?: string | null }
  | null
  | undefined;

type Feature = {
  name: string;
  description: string;
  tiers: TierValue[];
};

type FeatureMatrixData = {
  variant?: string;
  sectionBadge?: string;
  sectionTitle: string;
  sectionSubtitle?: string;
  planNames: string[];
  features: Feature[];
};

export default function FeatureMatrixBlock({
  data,
  themeLayout,
}: {
  data: FeatureMatrixData;
  themeLayout?: string;
}) {
  const v = data.variant || "matrix-standard";

  // Helper untuk merender nilai boolean / string / objek pada sel matriks
  const renderTierValue = (val: TierValue) => {
    if (val && typeof val === "object") {
      if (val.label) return val.label;
      return val.included ? (
        <span className="text-emerald-400 font-bold">✓</span>
      ) : (
        <span className="text-(--theme-muted)/40">✕</span>
      );
    }
    if (typeof val === "boolean") {
      return val ? (
        <span className="text-emerald-400 font-bold">✓</span>
      ) : (
        <span className="text-(--theme-muted)/40">✕</span>
      );
    }
    return val ?? <span className="text-(--theme-muted)/40">✕</span>;
  };

  return (
    <section className="w-full py-20 relative overflow-hidden">
      <Container containerClass={themeLayout}>
        {/* HEADER SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          {data.sectionBadge && (
            <div
              style={{ borderRadius: "var(--theme-radius-btn)" }}
              className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wider text-(--theme-muted) uppercase bg-white/5 border border-(--theme-border) font-sub backdrop-blur-md"
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

        {/* =========================================================
            VARIAN 1: matrix-standard (Tabel Standar Komparasi Rapi)
           ========================================================= */}
        {v === "matrix-standard" && (
          <div
            style={{
              borderRadius: "var(--theme-radius-box)",
              boxShadow: "var(--theme-shadow)",
            }}
            className="overflow-x-auto bg-(--theme-surface)/30 border border-(--theme-border) p-6 md:p-8 backdrop-blur-xl"
          >
            <table className="w-full text-left border-collapse min-w-150">
              <thead>
                <tr className="border-b border-(--theme-border)">
                  <th className="p-4 font-heading text-sm text-(--theme-text)">
                    Fitur & Spesifikasi
                  </th>
                  {data.planNames.map((p, i) => (
                    <th
                      key={i}
                      className="p-4 font-heading text-sm text-center text-(--theme-text)"
                    >
                      {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-(--theme-border)/50">
                {data.features.map((f, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 max-w-xs">
                      <div className="font-heading text-sm font-medium text-(--theme-text)">
                        {f.name}
                      </div>
                      <div className="font-sub text-xs text-(--theme-muted) font-light mt-0.5">
                        {f.description}
                      </div>
                    </td>
                    {f.tiers.map((t, tIdx) => (
                      <td
                        key={tIdx}
                        className="p-4 text-center font-mono text-xs text-(--theme-text)"
                      >
                        {renderTierValue(t)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* =========================================================
            VARIAN 2: matrix-highlight-middle (Matriks dengan Sorotan Kolom Tengah/Populer)
           ========================================================= */}
        {v === "matrix-highlight-middle" && (
          <div
            style={{
              borderRadius: "var(--theme-radius-box)",
              boxShadow: "var(--theme-shadow)",
            }}
            className="overflow-x-auto bg-(--theme-surface)/40 border border-(--theme-primary)/40 p-6 md:p-8 backdrop-blur-2xl relative shadow-2xl"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-(--theme-primary) to-transparent" />
            <table className="w-full text-left border-collapse min-w-150">
              <thead>
                <tr className="border-b border-(--theme-border)">
                  <th className="p-4 font-heading text-sm text-(--theme-text)">
                    Fitur & Spesifikasi
                  </th>
                  {data.planNames.map((p, i) => {
                    const isMiddle = i === 1; // Menyorot indeks ke-1 (biasanya paket Pro/Populer)
                    return (
                      <th
                        key={i}
                        className={`p-4 font-heading text-sm text-center ${
                          isMiddle
                            ? "text-(--theme-primary) bg-(--theme-primary)/10 border-x border-t border-(--theme-primary)/30 rounded-t-lg font-bold"
                            : "text-(--theme-text)"
                        }`}
                      >
                        {p} {isMiddle && "★"}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-(--theme-border)/50">
                {data.features.map((f, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 max-w-xs">
                      <div className="font-heading text-sm font-medium text-(--theme-text)">
                        {f.name}
                      </div>
                      <div className="font-sub text-xs text-(--theme-muted) font-light mt-0.5">
                        {f.description}
                      </div>
                    </td>
                    {f.tiers.map((t, tIdx) => {
                      const isMiddle = tIdx === 1;
                      return (
                        <td
                          key={tIdx}
                          className={`p-4 text-center font-mono text-xs ${
                            isMiddle
                              ? "bg-(--theme-primary)/10 border-x border-(--theme-primary)/30 text-(--theme-primary) font-bold"
                              : "text-(--theme-text)"
                          }`}
                        >
                          {renderTierValue(t)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* =========================================================
            VARIAN 3: matrix-side-cards (Gaya Perbandingan Kartu Sejajar)
           ========================================================= */}
        {v === "matrix-side-cards" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.planNames.map((plan, pIdx) => (
              <div
                key={pIdx}
                style={{
                  borderRadius: "var(--theme-radius-box)",
                  boxShadow: "var(--theme-shadow)",
                }}
                className={`p-6 md:p-8 bg-(--theme-surface)/30 border backdrop-blur-xl flex flex-col justify-between ${
                  pIdx === 1
                    ? "border-(--theme-primary) bg-(--theme-surface)/50"
                    : "border-(--theme-border)"
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-mono text-[10px] text-(--theme-primary) uppercase tracking-wider">
                      PLAN // 0{pIdx + 1}
                    </span>
                    {pIdx === 1 && (
                      <span className="font-mono text-[10px] bg-(--theme-primary) text-(--theme-primary-text) px-2 py-0.5 rounded">
                        POPULAR
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-(--theme-text) mb-6">
                    {plan}
                  </h3>
                  <div className="space-y-4 border-t border-(--theme-border)/40 pt-4">
                    {data.features.map((f, fIdx) => (
                      <div
                        key={fIdx}
                        className="flex justify-between items-center text-xs"
                      >
                        <span
                          className="font-sub text-(--theme-muted) max-w-45 truncate"
                          title={f.name}
                        >
                          {f.name}
                        </span>
                        <span className="font-mono font-medium text-(--theme-text)">
                          {renderTierValue(f.tiers[pIdx])}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================
            VARIAN 4: matrix-terminal-style (Gaya Konsol Terminal Sistem)
           ========================================================= */}
        {v === "matrix-terminal-style" && (
          <div
            style={{ borderRadius: "var(--theme-radius-box)" }}
            className="max-w-4xl mx-auto p-6 md:p-8 bg-(--theme-surface)/50 border border-(--theme-primary)/40 backdrop-blur-2xl overflow-x-auto shadow-2xl font-mono text-xs"
          >
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-(--theme-border) text-(--theme-muted)">
              <span>$ cat /etc/matrix/features.conf</span>
              <span className="text-emerald-400">STATUS: VERIFIED</span>
            </div>
            <table className="w-full text-left border-collapse min-w-125">
              <thead>
                <tr className="border-b border-(--theme-border) text-(--theme-primary)">
                  <th className="p-3">FEATURE</th>
                  {data.planNames.map((p, i) => (
                    <th key={i} className="p-3 text-center">
                      {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-(--theme-border)/30">
                {data.features.map((f, i) => (
                  <tr key={i}>
                    <td className="p-3 text-(--theme-text)">
                      <div>{f.name}</div>
                      <div className="text-[10px] text-(--theme-muted) font-sans">
                        {f.description}
                      </div>
                    </td>
                    {f.tiers.map((t, tIdx) => (
                      <td
                        key={tIdx}
                        className="p-3 text-center text-(--theme-text)"
                      >
                        {renderTierValue(t)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* =========================================================
            VARIAN 5: matrix-minimal-clean (Gaya Minimalis Bersih Tanpa Garis Berat)
           ========================================================= */}
        {v === "matrix-minimal-clean" && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="grid grid-cols-4 gap-4 px-6 py-3 bg-white/5 border border-(--theme-border) rounded-lg font-heading text-xs font-semibold text-(--theme-text)">
              <div>Fitur Utama</div>
              {data.planNames.map((p, i) => (
                <div key={i} className="text-center">
                  {p}
                </div>
              ))}
            </div>
            {data.features.map((f, i) => (
              <div
                key={i}
                style={{ borderRadius: "var(--theme-radius-box)" }}
                className="grid grid-cols-4 gap-4 p-6 bg-(--theme-surface)/20 border border-(--theme-border) backdrop-blur-xl items-center"
              >
                <div>
                  <div className="font-heading text-sm font-medium text-(--theme-text)">
                    {f.name}
                  </div>
                  <div className="font-sub text-[11px] text-(--theme-muted) font-light">
                    {f.description}
                  </div>
                </div>
                {f.tiers.map((t, tIdx) => (
                  <div
                    key={tIdx}
                    className="text-center font-mono text-xs text-(--theme-text)"
                  >
                    {renderTierValue(t)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
