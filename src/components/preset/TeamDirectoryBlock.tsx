import React from "react";
import type { BlockSiteContext } from "@/components/CanvasRenderer";
import { getHighlights, readHighlightConfig } from "@/lib/highlights";
import TeamDirectoryView, {
  type TeamDirectoryMember,
  type TeamDirectoryViewData,
} from "./TeamDirectoryView";

type TeamDirectoryData = TeamDirectoryViewData & {
  members?: TeamDirectoryMember[];
  dataSource?: "manual" | "collection";
  highlightCollection?: "members" | "posts";
  highlightMode?: "latest" | "category" | "manual";
  highlightMemberItems?: Array<string | { id?: string }> | null;
  highlightPostItems?: Array<string | { id?: string }> | null;
  highlightCategory?: string | null;
  highlightLimit?: number | null;
};

export default async function TeamDirectoryBlock({
  data,
  themeLayout,
  siteContext,
}: {
  data: TeamDirectoryData;
  themeLayout?: string;
  siteContext?: BlockSiteContext;
}) {
  let members: TeamDirectoryMember[] = Array.isArray(data.members) ? data.members : [];

  if (data.dataSource === "collection" && siteContext?.tenantID) {
    const config = readHighlightConfig(data as Record<string, any>, {
      defaultCollection: "members",
      defaultMode: "latest",
    });

    const items = await getHighlights({
      collection: config.collection,
      tenantID: siteContext.tenantID,
      locale: siteContext.locale,
      mode: config.mode,
      category: config.category,
      ids: config.ids,
      limit: config.limit ?? 8,
    });

    members = items.map((item) => {
      const raw = item.raw || {};
      const rawSkills = Array.isArray(raw.skills)
        ? raw.skills.filter((s: unknown): s is string => typeof s === "string")
        : undefined;

      return {
        name: item.title,
        role: item.subtitle || (item.kind === "posts" ? "Artikel" : ""),
        bio: item.description || "",
        badge: item.badge || undefined,
        skills:
          rawSkills && rawSkills.length > 0
            ? rawSkills
            : item.kind === "posts" && item.categories && item.categories.length > 0
              ? item.categories
              : undefined,
        imageUrl: item.image as TeamDirectoryMember["imageUrl"],
      };
    });
  }

  return (
    <TeamDirectoryView
      data={{
        variant: data.variant,
        sectionBadge: data.sectionBadge,
        sectionTitle: data.sectionTitle,
        sectionSubtitle: data.sectionSubtitle,
      }}
      members={members}
      themeLayout={themeLayout}
    />
  );
}
