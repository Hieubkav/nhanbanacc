"use client";

import { ChevronDownIcon } from "lucide-react";

export default function FAQSection({ faqs }: { faqs: any }) {
  const items = faqs?.items ?? [];

  /* Loading skeleton */
  if (!faqs) {
    return (
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-background/60 p-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(40%_30%_at_10%_10%,hsl(var(--primary)/0.12),transparent),radial-gradient(30%_20%_at_90%_0%,hsl(var(--muted-foreground)/0.08),transparent)]" />
        <div className="h-7 w-48 animate-pulse rounded-md bg-muted" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 w-full animate-pulse rounded-2xl bg-muted/60"
            />
          ))}
        </div>
      </section>
    );
  }

  // Parent component now controls rendering, but this is a good safeguard.
  if (items.length === 0) return null;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-background/60 p-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/50">
      {/* subtle background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(40%_30%_at_10%_10%,hsl(var(--primary)/0.10),transparent),radial-gradient(30%_20%_at_90%_0%,hsl(var(--muted-foreground)/0.06),transparent)]" />

      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-primary/70" />
            Câu hỏi thường gặp
          </div>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Giải đáp thắc mắc nhanh chóng
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Không thấy câu trả lời phù hợp? Hãy liên hệ để được hỗ trợ.
          </p>
        </div>
      </div>

      {/* FAQ list */}
      <div className="mt-4 space-y-3">
        {items.map((f: any) => (
          <details
            key={String(f._id)}
            className={`
              group relative overflow-hidden rounded-2xl border border-border/60 bg-background/70 p-0 transition-colors
              hover:bg-background
              [&[open]]:bg-background
              shadow-sm
            `}
          >
            {/* gradient ring on hover/open */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent transition group-hover:ring-primary/15 group-open:ring-primary/20" />

            <summary
              className={`
                marker:content-none
                flex cursor-pointer select-none items-center justify-between gap-4 px-5 py-4
                text-left
              `}
              aria-label={f.question}
            >
              <span className="text-base font-medium leading-tight">
                {f.question}
              </span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-background/70 transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                <ChevronDownIcon
                  className="h-4 w-4 transition-transform duration-300 group-open:rotate-180"
                  aria-hidden="true"
                />
              </span>
            </summary>

            {/* animated content: grid-rows trick for smooth height */}
            <div
              className={`
                grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out
                group-open:grid-rows-[1fr]
              `}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="px-5 pb-5 pt-0">
                  <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground">
                    {f.answer}
                  </div>
                </div>
              </div>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}