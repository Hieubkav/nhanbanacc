"use client";

import { useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";
import { ChevronDownIcon } from "lucide-react";

export default function FAQSection() {
  const faqs = useQuery(api.faqs.list, { filters: [{ field: "isVisible", value: true }], sort: { field: "sortOrder", direction: "asc" }, pageSize: 20 } as any);
  const items = faqs?.items ?? [];
  if (!faqs) {
    return (
      <section className="rounded-2xl border bg-white/50 p-6 shadow-sm backdrop-blur-sm dark:bg-gray-900/50">
        <div className="h-6 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 w-full animate-pulse rounded-lg bg-muted/50" />
          ))}
        </div>
      </section>
    );
  }
  if (items.length === 0) return null;

  return (
    <section className="rounded-2xl border bg-white/50 p-6 shadow-sm backdrop-blur-sm dark:bg-gray-900/50">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Câu hỏi thường gặp</h2>
      <div className="mt-6 space-y-4">
        {items.map((f: any) => (
          <details key={String(f._id)} className="group rounded-lg border bg-white/50 p-4 transition-all hover:bg-white/80 dark:bg-gray-800/50 dark:hover:bg-gray-800/80">
            <summary className="marker:content-none flex cursor-pointer items-center justify-between gap-2 text-left font-medium text-gray-900 dark:text-white">
              <span>{f.question}</span>
              <ChevronDownIcon className="h-5 w-5 text-yellow-500 transition-transform duration-300 group-open:rotate-180" />
            </summary>
            <div className="text-muted-foreground mt-3 text-sm leading-relaxed dark:text-gray-300">{f.answer}</div>
          </details>
        ))}
      </div>
    </section>
  );
}

