import React from "react";
import Container from "@/components/ui/Container";
import { mediaUrl, type MediaLike } from "@/lib/mediaUrl";

export type TeamDirectoryMember = {
  name: string;
  role: string;
  bio: string;
  badge?: string;
  skills?: string[];
  imageUrl?: MediaLike;
};

export type TeamDirectoryViewData = {
  variant?: string;
  sectionBadge?: string;
  sectionTitle?: string;
  sectionSubtitle?: string;
};

export default function TeamDirectoryView({
  data,
  members,
  themeLayout,
}: {
  data: TeamDirectoryViewData;
  members: TeamDirectoryMember[];
  themeLayout?: string;
}) {
  const v = data.variant || "team-portrait-grid";
  const list = Array.isArray(members) ? members : [];

  return (
    <section className="w-full py-20">
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
            VARIAN 1: team-portrait-grid (Grid Potret Vertikal Standar)
           ========================================================= */}
        {v === "team-portrait-grid" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {list.map((m, i) => (
              <div
                key={i}
                style={{
                  borderRadius: "var(--theme-radius-box)",
                  boxShadow: "var(--theme-shadow)",
                }}
                className="p-8 bg-(--theme-surface)/30 border border-(--theme-border) flex flex-col justify-between backdrop-blur-xl group hover:border-(--theme-border-hover) transition-all duration-300"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    {m.imageUrl ? (
                      <img
                        src={mediaUrl(m.imageUrl, "thumbnail")}
                        alt={m.name}
                        style={{ borderRadius: "var(--theme-radius-btn)" }}
                        className="w-16 h-16 object-cover object-center border border-(--theme-border) shadow-md shrink-0"
                      />
                    ) : (
                      <div
                        style={{ borderRadius: "var(--theme-radius-btn)" }}
                        className="w-16 h-16 bg-(--theme-primary)/10 border border-(--theme-primary)/30 flex items-center justify-center font-heading text-lg font-bold text-(--theme-primary) shadow-inner shrink-0"
                      >
                        {m.name.charAt(0)}
                      </div>
                    )}

                    {m.badge && (
                      <span
                        style={{ borderRadius: "var(--theme-radius-btn)" }}
                        className="font-mono text-[10px] px-2.5 py-1 bg-white/5 border border-(--theme-border) text-(--theme-muted) uppercase tracking-wider"
                      >
                        {m.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-(--theme-text) mb-1 group-hover:text-(--theme-primary) transition-colors">
                    {m.name}
                  </h3>
                  <p className="font-sub text-xs text-(--theme-primary) uppercase tracking-wider mb-4 font-medium">
                    {m.role}
                  </p>
                  <p className="font-sub text-xs text-(--theme-muted) font-light leading-relaxed mb-6">
                    {m.bio}
                  </p>
                </div>

                {m.skills && m.skills.length > 0 && (
                  <div className="border-t border-(--theme-border)/40 pt-4 flex flex-wrap gap-1.5">
                    {m.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/5 border border-(--theme-border) text-(--theme-muted)"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* =========================================================
            VARIAN 2: team-horizontal-card (Kartu Melebar ke Samping)
           ========================================================= */}
        {v === "team-horizontal-card" && (
          <div className="max-w-4xl mx-auto space-y-6">
            {list.map((m, i) => (
              <div
                key={i}
                style={{
                  borderRadius: "var(--theme-radius-box)",
                  boxShadow: "var(--theme-shadow)",
                }}
                className="p-6 md:p-8 bg-(--theme-surface)/30 border border-(--theme-border) backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group hover:border-(--theme-border-hover) transition-all"
              >
                <div className="flex items-center gap-5">
                  {m.imageUrl ? (
                    <img
                      src={mediaUrl(m.imageUrl, "thumbnail")}
                      alt={m.name}
                      style={{ borderRadius: "var(--theme-radius-btn)" }}
                      className="w-16 h-16 md:w-20 md:h-20 object-cover object-center border border-(--theme-border) shadow-md shrink-0"
                    />
                  ) : (
                    <div
                      style={{ borderRadius: "var(--theme-radius-btn)" }}
                      className="w-16 h-16 md:w-20 md:h-20 bg-(--theme-primary)/20 border border-(--theme-primary)/40 flex items-center justify-center font-heading text-xl font-bold text-(--theme-primary) shrink-0 shadow-md"
                    >
                      {m.name.charAt(0)}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-heading text-lg font-semibold text-(--theme-text) group-hover:text-(--theme-primary) transition-colors">
                        {m.name}
                      </h3>
                      {m.badge && (
                        <span className="font-mono text-[10px] px-2 py-0.5 bg-white/5 border border-(--theme-border) text-(--theme-muted) uppercase">
                          {m.badge}
                        </span>
                      )}
                    </div>
                    <p className="font-sub text-xs text-(--theme-primary) uppercase tracking-wider mb-2 font-medium">
                      {m.role}
                    </p>
                    <p className="font-sub text-xs text-(--theme-muted) font-light max-w-xl leading-relaxed">
                      {m.bio}
                    </p>
                  </div>
                </div>

                {m.skills && (
                  <div className="flex flex-wrap gap-1.5 md:max-w-50 justify-start md:justify-end">
                    {m.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="font-mono text-[10px] px-2 py-0.5 bg-white/5 border border-(--theme-border) text-(--theme-muted) rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* =========================================================
            VARIAN 3: team-minimal-avatar (Avatar Kecil Minimalis Berderet)
           ========================================================= */}
        {v === "team-minimal-avatar" && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {list.map((m, i) => (
              <div
                key={i}
                style={{ borderRadius: "var(--theme-radius-box)" }}
                className="p-6 bg-white/5 border border-(--theme-border) backdrop-blur-xl text-center flex flex-col items-center"
              >
                {m.imageUrl ? (
                  <img
                    src={mediaUrl(m.imageUrl, "thumbnail")}
                    alt={m.name}
                    className="w-14 h-14 rounded-full object-cover object-center border border-(--theme-border) shadow-md mb-3"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-(--theme-primary)/20 border border-(--theme-primary)/40 flex items-center justify-center font-heading text-sm font-bold text-(--theme-primary) mb-3">
                    {m.name.charAt(0)}
                  </div>
                )}

                <h3 className="font-heading text-base font-semibold text-(--theme-text) mb-1">
                  {m.name}
                </h3>
                <p className="font-sub text-[10px] text-(--theme-primary) uppercase tracking-widest mb-3">
                  {m.role}
                </p>
                <p className="font-sub text-xs text-(--theme-muted) font-light line-clamp-2">
                  {m.bio}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================
            VARIAN 4: team-interactive-overlay (Gaya Kartu Modern Futuristik)
           ========================================================= */}
        {v === "team-interactive-overlay" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {list.map((m, i) => (
              <div
                key={i}
                style={{ borderRadius: "var(--theme-radius-box)" }}
                className="p-8 bg-(--theme-surface)/40 border border-(--theme-border) backdrop-blur-xl relative overflow-hidden group hover:border-(--theme-primary) transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-mono text-[10px] text-(--theme-primary) uppercase tracking-widest block">
                      // EXPERT_PROFILE
                    </span>
                    {m.imageUrl && (
                      <img
                        src={mediaUrl(m.imageUrl, "thumbnail")}
                        alt={m.name}
                        style={{ borderRadius: "var(--theme-radius-btn)" }}
                        className="w-12 h-12 object-cover object-center border border-(--theme-border)"
                      />
                    )}
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-(--theme-text) mb-1">
                    {m.name}
                  </h3>
                  <p className="font-sub text-xs text-(--theme-muted) uppercase mb-4">
                    {m.role}
                  </p>
                  <p className="font-sub text-xs text-(--theme-muted) font-light leading-relaxed mb-6">
                    {m.bio}
                  </p>
                </div>
                <div className="font-mono text-[10px] text-(--theme-text) border-t border-(--theme-border)/40 pt-4 flex items-center justify-between">
                  <span>STATUS: ACTIVE</span>
                  <span className="text-(--theme-primary)">VERIFIED →</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================
            VARIAN 5: team-executive-spotlight (Sorotan Pimpinan Utama C-Level)
           ========================================================= */}
        {v === "team-executive-spotlight" && list[0] && (
          <div className="max-w-4xl mx-auto">
            <div
              style={{
                borderRadius: "var(--theme-radius-box)",
                boxShadow: "var(--theme-shadow)",
              }}
              className="p-8 md:p-12 bg-(--theme-surface)/50 border border-(--theme-border) backdrop-blur-2xl relative overflow-hidden mb-8"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-(--theme-primary) to-transparent" />
              <div className="flex flex-col md:flex-row items-center gap-8">
                {list[0].imageUrl ? (
                  <img
                    src={mediaUrl(list[0].imageUrl, "thumbnail")}
                    alt={list[0].name}
                    style={{ borderRadius: "var(--theme-radius-box)" }}
                    className="w-24 h-24 md:w-32 md:h-32 object-cover object-center border border-(--theme-border) shadow-xl shrink-0"
                  />
                ) : (
                  <div
                    style={{ borderRadius: "var(--theme-radius-box)" }}
                    className="w-24 h-24 md:w-32 md:h-32 bg-(--theme-primary)/20 border border-(--theme-primary)/40 flex items-center justify-center font-heading text-3xl font-bold text-(--theme-primary) shrink-0 shadow-lg"
                  >
                    {list[0].name.charAt(0)}
                  </div>
                )}

                <div className="text-center md:text-left">
                  <span className="font-mono text-[10px] px-3 py-1 bg-white/5 border border-(--theme-border) text-(--theme-primary) uppercase tracking-widest inline-block mb-3 rounded">
                    {list[0].badge || "Chief Executive"}
                  </span>
                  <h3 className="font-heading text-2xl md:text-3xl font-semibold text-(--theme-text) mb-2">
                    {list[0].name}
                  </h3>
                  <p className="font-sub text-xs md:text-sm text-(--theme-primary) uppercase tracking-wider mb-4 font-medium">
                    {list[0].role}
                  </p>
                  <p className="font-sub text-xs md:text-sm text-(--theme-muted) font-light leading-relaxed">
                    "{list[0].bio}"
                  </p>
                </div>
              </div>
            </div>

            {/* Anggota Pendukung Lainnya */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {list.slice(1).map((m, i) => (
                <div
                  key={i}
                  style={{ borderRadius: "var(--theme-radius-box)" }}
                  className="p-6 bg-(--theme-surface)/30 border border-(--theme-border) backdrop-blur-xl flex items-center gap-4"
                >
                  {m.imageUrl ? (
                    <img
                      src={mediaUrl(m.imageUrl, "thumbnail")}
                      alt={m.name}
                      style={{ borderRadius: "var(--theme-radius-btn)" }}
                      className="w-14 h-14 object-cover object-center border border-(--theme-border) shrink-0"
                    />
                  ) : (
                    <div
                      style={{ borderRadius: "var(--theme-radius-btn)" }}
                      className="w-14 h-14 bg-(--theme-primary)/10 border border-(--theme-primary)/30 flex items-center justify-center font-heading font-bold text-(--theme-primary) shrink-0"
                    >
                      {m.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-heading text-base font-semibold text-(--theme-text) mb-1">
                      {m.name}
                    </h4>
                    <p className="font-sub text-xs text-(--theme-primary) uppercase mb-2">
                      {m.role}
                    </p>
                    <p className="font-sub text-xs text-(--theme-muted) font-light line-clamp-2">
                      {m.bio}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
