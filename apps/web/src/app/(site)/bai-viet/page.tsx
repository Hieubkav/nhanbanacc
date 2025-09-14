"use client";

import { useRouter } from "next/navigation";
import PostExplorer from "@/components/post/post-explorer";

export default function BaiVietPage() {
  const router = useRouter();
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Bài viết</h1>
      </div>
      <PostExplorer onOpenDetail={(id) => router.push(`/bai-viet/${id}`)} />
    </div>
  );
}

