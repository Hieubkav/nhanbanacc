"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";

// Cập nhật title và favicon dựa trên Settings; fallback giữ nguyên metadata tĩnh
export default function DynamicHead() {
  const settings = useQuery(api.settings.getOne);
  const faviconId = settings?.faviconId
    ? String(settings.faviconId)
    : settings?.logoId
    ? String(settings.logoId)
    : undefined;
  const favicon = useQuery(
    api.images.getViewUrl,
    faviconId ? ({ id: faviconId } as any) : (undefined as any)
  );

  const title = useMemo(() => {
    return (
      settings?.seoDefaultTitle || settings?.siteName || undefined
    );
  }, [settings?.seoDefaultTitle, settings?.siteName]);

  useEffect(() => {
    // Title
    if (title) document.title = title;

    // Favicon
    const href = favicon?.url || undefined;
    if (href) {
      const ensureLink = (rel: string, type?: string) => {
        let link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]${type ? `[type='${type}']` : ""}`);
        if (!link) {
          link = document.createElement("link");
          link.rel = rel;
          if (type) link.type = type;
          document.head.appendChild(link);
        }
        link.href = href;
      };
      ensureLink("icon", "image/x-icon");
      ensureLink("shortcut icon");
    }
  }, [title, favicon?.url]);

  return null;
}
