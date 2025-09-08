"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";

export default function SeoJsonLd() {
  const settings = useQuery(api.settings.getOne);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://dttaikhoanso.vercel.app").replace(/\/$/, "");

  const json = useMemo(() => {
    const org = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: settings?.siteName || "DT Tài Khoản Số",
      url: siteUrl,
      sameAs: [
        settings?.socialFacebook || undefined,
        settings?.socialYoutube || undefined,
        settings?.socialTiktok || undefined,
        settings?.socialZalo || undefined,
      ].filter(Boolean),
    } as any;

    const website = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      url: siteUrl,
      name: settings?.siteName || "DT Tài Khoản Số",
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    } as any;

    return JSON.stringify([org, website]);
  }, [settings, siteUrl]);

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

