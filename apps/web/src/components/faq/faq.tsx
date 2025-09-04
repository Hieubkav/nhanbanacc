"use client";

import { useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";

export default function FAQSection() {
  const faqs = useQuery(api.faqs.list, { filters: [{ field: "isVisible", value: true }], sort: { field: "sortOrder", direction: "asc" }, pageSize: 20 } as any);
  const items = faqs?.items ?? [];
  if (!faqs) {
    return (
      <section className="rounded-xl border p-4">
        <div className="h-6 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-3 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 w-full animate-pulse rounded bg-muted/50" />
          ))}
        </div>
      </section>
    );
  }
  if (items.length === 0) return null;

  return (
    <section className="rounded-xl border p-4">
      <h2 className="text-xl font-semibold">Câu hỏi thường gặp</h2>
      <div className="mt-3 divide-y">
        {items.map((f: any) => (
          <details key={String(f._id)} className="group py-3">
            <summary className="marker:content-none flex cursor-pointer items-center justify-between gap-2 font-medium">
              <span>{f.question}</span>
              <span className="text-yellow-600 transition group-open:rotate-180">⌄</span>
            </summary>
            <div className="text-muted-foreground mt-2 text-sm leading-relaxed">{f.answer}</div>
          </details>
        ))}
      </div>
    </section>
  );
}

