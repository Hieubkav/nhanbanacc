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
import ReviewsSection from "@/components/marketing/reviews-section";
import Footer from "@/components/site/footer";

export default function Home() {
  const { beep } = useSound();
  const [searchOpen, setSearchOpen] = useState(false);
  const [detail, setDetail] = useState<{ kind: "product" | "post"; id: string } | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-200 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Hero Section - Full width */}
      <HeroSlider />
      
      {/* Main Content */}
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="space-y-16">
          {/* Products Section */}
          <section className="animate-fade-in-up" id="products">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Sản Phẩm Nổi Bật</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent ml-4 dark:via-blue-600/30"></div>
            </div>
            <div className="mb-6">
              {/* Hard coded content removed */}
            </div>
            <ProductExplorer onOpenDetail={(id) => setDetail({ kind: "product", id })} />
          </section>

          {/* Posts Section */}
          <section className="animate-fade-in-up animation-delay-200" id="posts">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Bài Viết Mới Nhất</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent ml-4 dark:via-blue-600/30"></div>
            </div>
            <PostExplorer onOpenDetail={(id) => setDetail({ kind: "post", id })} />
          </section>

          {/* FAQ Section */}
          <section className="animate-fade-in-up animation-delay-400" id="faq">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Câu Hỏi Thường Gặp</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent ml-4 dark:via-blue-600/30"></div>
            </div>
            <div className="mb-6">
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
                Tìm câu trả lời cho những thắc mắc phổ biến của khách hàng. 
                Nếu bạn không tìm thấy câu trả lời mong muốn, đừng ngần ngại liên hệ với chúng tôi.
              </p>
            </div>
            <FAQSection />
          </section>

          {/* Reviews Section */}
          <section className="animate-fade-in-up animation-delay-600" id="reviews">
            <ReviewsSection />
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

