"use client";

import { useRouter } from "next/navigation";
import ServiceExplorer from "@/components/service/service-explorer";

export default function WebPage() {
  const router = useRouter();
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Làm web</h1>
      </div>
      <ServiceExplorer onOpenDetail={(id) => router.push(`/web/${id}`)} />
    </div>
  );
}

