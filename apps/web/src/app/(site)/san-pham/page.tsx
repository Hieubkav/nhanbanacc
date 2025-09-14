"use client";

import { useRouter } from "next/navigation";
import ProductExplorer from "@/components/product/product-explorer";

export default function SanPhamPage() {
  const router = useRouter();
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sản phẩm</h1>
      </div>
      <ProductExplorer onOpenDetail={(id) => router.push(`/san-pham/${id}`)} />
    </div>
  );
}

