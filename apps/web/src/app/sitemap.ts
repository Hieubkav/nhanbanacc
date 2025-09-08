import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "/",
    "/hello",
    "/students",
    "/todos",
    "/check",
  ];

  const now = new Date();
  return pages.map((p) => ({
    url: `${siteUrl}${p}`,
    lastModified: now,
    changeFrequency: p === "/" ? "daily" : "weekly",
    priority: p === "/" ? 1.0 : 0.6,
  }));
}

