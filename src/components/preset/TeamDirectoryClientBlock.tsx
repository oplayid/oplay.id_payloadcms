"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { BlockSiteContext } from "@/components/CanvasRenderer";
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

function readConfig(data: TeamDirectoryData) {
  const collection: "members" | "posts" =
    data.highlightCollection === "posts" ? "posts" : "members";
  const mode: "latest" | "category" | "manual" =
    data.highlightMode === "category" || data.highlightMode === "manual"
      ? data.highlightMode
      : "latest";

  const relField = collection === "posts" ? "highlightPostItems" : "highlightMemberItems";
  const rawIds = (data as any)[relField];
  const ids = Array.isArray(rawIds)
    ? rawIds
        .map((item: any) => (typeof item === "string" ? item : item?.id))
        .filter((value: any): value is string => typeof value === "string" && Boolean(value))
    : null;

  return {
    collection,
    mode,
    category: typeof data.highlightCategory === "string" ? data.highlightCategory : null,
    limit: typeof data.highlightLimit === "number" ? data.highlightLimit : 8,
    ids,
  };
}

function mapDoc(doc: Record<string, any>, collection: "members" | "posts"): TeamDirectoryMember {
  if (collection === "posts") {
    const categories = Array.isArray(doc?.categories)
      ? doc.categories.filter((s: unknown): s is string => typeof s === "string")
      : undefined;
    return {
      name: typeof doc?.title === "string" ? doc.title : "",
      role: typeof doc?.author === "string" && doc.author ? doc.author : "Artikel",
      bio: typeof doc?.excerpt === "string" ? doc.excerpt : "",
      badge: undefined,
      skills: categories && categories.length > 0 ? categories : undefined,
      imageUrl: doc?.cover ?? undefined,
    };
  }

  const skills = Array.isArray(doc?.skills)
    ? doc.skills.filter((s: unknown): s is string => typeof s === "string")
    : undefined;
  return {
    name: typeof doc?.name === "string" ? doc.name : "",
    role: typeof doc?.position === "string" ? doc.position : "",
    bio: typeof doc?.excerpt === "string" ? doc.excerpt : "",
    badge: typeof doc?.status === "string" ? doc.status : undefined,
    skills: skills && skills.length > 0 ? skills : undefined,
    imageUrl: doc?.cover ?? undefined,
  };
}

export default function TeamDirectoryClientBlock({
  data,
  themeLayout,
  siteContext,
}: {
  data: TeamDirectoryData;
  themeLayout?: string;
  siteContext?: BlockSiteContext;
}) {
  const isCollection = data?.dataSource === "collection";
  const inline = useMemo(
    () => (Array.isArray(data.members) ? data.members : []),
    [data.members],
  );
  const [resolved, setResolved] = useState<TeamDirectoryMember[]>(inline);
  const config = useMemo(() => readConfig(data || {}), [data]);

  const key = useMemo(
    () =>
      JSON.stringify({
        isCollection,
        tenant: siteContext?.tenantID,
        locale: siteContext?.locale,
        collection: config.collection,
        mode: config.mode,
        category: config.category || null,
        limit: config.limit,
        ids: config.ids || null,
      }),
    [
      config.category,
      config.collection,
      config.ids,
      config.limit,
      config.mode,
      isCollection,
      siteContext?.locale,
      siteContext?.tenantID,
    ],
  );

  useEffect(() => {
    if (!isCollection) {
      setResolved(inline);
      return;
    }
    if (!siteContext?.tenantID || typeof window === "undefined") {
      setResolved([]);
      return;
    }

    let active = true;
    const controller = new AbortController();

    const manualIds = config.mode === "manual" ? config.ids || [] : null;
    const limit = manualIds && manualIds.length > 0 ? manualIds.length : config.limit;
    const sort = config.collection === "members" ? "order" : "-publishedAt";

    const params = new URLSearchParams({
      depth: "1",
      limit: String(limit),
      sort,
      "where[and][0][tenant][equals]": siteContext.tenantID,
      "where[and][1][_status][equals]": "published",
      locale: siteContext.locale || "id",
    });

    let andIndex = 2;
    if (config.mode === "category" && config.category) {
      params.set(`where[and][${andIndex}][categories][contains]`, config.category);
      andIndex += 1;
    }
    if (manualIds && manualIds.length > 0) {
      manualIds.forEach((id, i) => {
        params.set(`where[and][${andIndex}][id][in][${i}]`, id);
      });
    }

    const endpoint = config.collection === "posts" ? "/api/posts" : "/api/members";

    fetch(`${endpoint}?${params.toString()}`, {
      credentials: "include",
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!active || !json) return;
        let docs = (Array.isArray(json.docs) ? json.docs : []) as Record<string, any>[];
        if (manualIds && manualIds.length > 0) {
          const order = new Map(manualIds.map((id, index) => [id, index]));
          docs = [...docs].sort(
            (a, b) => (order.get(String(a.id)) ?? 0) - (order.get(String(b.id)) ?? 0),
          );
        }
        setResolved(docs.map((doc) => mapDoc(doc, config.collection)).filter((m) => m.name));
      })
      .catch(() => {
        if (active) setResolved([]);
      });

    return () => {
      active = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const members = isCollection ? resolved : inline;

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
