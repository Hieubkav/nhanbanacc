"use client";

import { useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";
import { ChevronDownIcon } from "lucide-react";

export default function FAQSection() {
  const faqs = useQuery(api.faqs.list, { filters: [{ field: "isVisible", value: true }], sort: { field: "sortOrder", direction: "asc" }, pageSize: 20 } as any);
  const items = faqs?.items ?? [];
  if (!faqs) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white/70 p-6 shadow-sm backdrop-blur-sm dark:bg-gray-900/70 dark:border-gray-700">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-8 space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 w-full animate-pulse rounded-lg bg-muted/50" />
          ))}
        </div>
      </section>
    );
  }
  if (items.length === 0) return null;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white/70 p-6 shadow-sm backdrop-blur-sm dark:bg-gray-900/70 dark:border-gray-700">
      <div className="mb-4">
        <p className="text-gray-600 dark:text-gray-300">
          Tìm câu trả lời cho những thắc mắc phổ biến của khách hàng. 
          Nếu bạn không tìm thấy câu trả lời mong muốn, đừng ngần ngại liên hệ với chúng tôi.
        </p>
      </div>
      
      <div className="mt-8 space-y-4">
        {items.map((f: any) => (
          <details key={String(f._id)} className="group rounded-xl border border-gray-200 bg-white/50 p-5 transition-all hover:bg-white/80 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800/80">
            <summary className="marker:content-none flex cursor-pointer items-center justify-between gap-4 text-left font-medium text-gray-900 dark:text-white">
              <span className="text-lg">{f.question}</span>
              <ChevronDownIcon className="h-6 w-6 text-gold transition-transform duration-300 group-open:rotate-180" />
            </summary>
            <div className="text-muted-foreground mt-4 text-base leading-relaxed dark:text-gray-300">{f.answer}</div>
          </details>
        ))}
      </div>
    </section>
  );
}

