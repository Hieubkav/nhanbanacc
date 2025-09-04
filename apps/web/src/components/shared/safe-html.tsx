"use client";

import { useMemo } from "react";
import DOMPurify from "isomorphic-dompurify";
import { cn } from "@/lib/utils";

type Props = {
  html?: string | null;
  className?: string;
};

/**
 * Render HTML an toàn (sanitize) cho nội dung do người dùng nhập.
 * Dùng DOMPurify (isomorphic) để chạy được cả CSR/SSR.
 */
export default function SafeHtml({ html, className }: Props) {
  const clean = useMemo(() => {
    const raw = html || "";
    if (!raw) return "";
    // Sanitize với cấu hình mặc định là đủ an toàn cho rich text cơ bản
    const sanitized = DOMPurify.sanitize(raw, {
      USE_PROFILES: { html: true },
      ALLOW_UNKNOWN_PROTOCOLS: false,
    });
    return sanitized;
  }, [html]);

  if (!clean) return null;

  return (
    <div
      className={cn(
        // Dùng prose nếu người dùng đã cài typography plugin. Nếu chưa có cũng không gây lỗi.
        "prose prose-sm max-w-none dark:prose-invert leading-relaxed break-words",
        // Fallback một số spacing cơ bản nếu không có prose
        "[&>p]:my-3 [&>h1]:mt-6 [&>h1]:mb-3 [&>h1]:text-2xl [&>h2]:mt-5 [&>h2]:mb-2 [&>h2]:text-xl [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}

