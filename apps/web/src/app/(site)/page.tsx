"use client";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";
import { SearchOverlay } from "@/components/search/search-overlay";
import { SpeedDial } from "@/components/shared/speed-dial";
import { EntityDetailDialog } from "@/components/data/entity-detail-dialog";
import { useSound } from "@/lib/use-sound";
import HeroSlider from "@/components/marketing/hero-slider";
import ProductExplorer from "@/components/product/product-explorer";
import PostExplorer from "@/components/post/post-explorer";
import FAQSection from "@/components/faq/faq";
import Footer from "@/components/site/footer";

export default function Home() {
  const { beep } = useSound();
  const healthCheck = useQuery(api.healthCheck.get);
  const [searchOpen, setSearchOpen] = useState(false);
  const [detail, setDetail] = useState<{ kind: "product" | "post"; id: string } | null>(null);

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="container mx-auto max-w-6xl px-4 py-6">
          <HeroSlider />
          <div className="mt-2 text-right text-xs text-muted-foreground">API: {healthCheck === undefined ? "Checking..." : healthCheck === "OK" ? "Connected" : "Error"}</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="space-y-12">
          {/* Products Section */}
          <section className="animate-fade-in-up">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sản Phẩm Nổi Bật</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent ml-4 dark:via-gray-700"></div>
            </div>
            <ProductExplorer onOpenDetail={(id) => setDetail({ kind: "product", id })} />
          </section>

          {/* Posts Section */}
          <section className="animate-fade-in-up animation-delay-200">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bài Viết Mới Nhất</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent ml-4 dark:via-gray-700"></div>
            </div>
            <PostExplorer onOpenDetail={(id) => setDetail({ kind: "post", id })} />
          </section>

          {/* FAQ Section */}
          <section className="animate-fade-in-up animation-delay-400">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Câu Hỏi Thường Gặp</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent ml-4 dark:via-gray-700"></div>
            </div>
            <FAQSection />
          </section>
        </div>
      </div>

      <Footer />

      {/* Overlays */}
      <SearchOverlay open={searchOpen} onOpenChange={(o) => { setSearchOpen(o); if (!o) beep(); }} onSelect={(kind, id) => setDetail({ kind, id })} />
      {detail ? (
        <EntityDetailDialog
          open={true}
          onOpenChange={(o) => {
            if (!o) setDetail(null);
          }}
          kind={detail.kind}
          id={detail.id}
        />
      ) : null}

      {/* Speed Dial */}
      <SpeedDial onOpenSearch={() => setSearchOpen(true)} />
    </div>
  );
}

