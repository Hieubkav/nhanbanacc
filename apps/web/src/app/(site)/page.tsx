"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";
import { SearchOverlay } from "@/components/search/search-overlay";
import { SpeedDial } from "@/components/shared/speed-dial";
import { useSound } from "@/lib/use-sound";
import HeroSlider from "@/components/marketing/hero-slider";
import Link from "next/link";
import ProductExplorer from "@/components/product/product-explorer";
import ServiceExplorer from "@/components/service/service-explorer";
import PostExplorer from "@/components/post/post-explorer";
import FAQSection from "@/components/faq/faq";
import ReviewsSection from "@/components/marketing/reviews-section";

export default function Home() {
  const router = useRouter();
  const { beep } = useSound();
  const [searchOpen, setSearchOpen] = useState(false);
  // Bỏ popup chi tiết, điều hướng sang trang riêng
  const faqs = useQuery(api.faqs.list, {
    filters: [{ field: "isVisible", value: true }],
    sort: { field: "sortOrder", direction: "asc" },
    pageSize: 20,
  } as any);

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
            <ProductExplorer onOpenDetail={(id) => router.push(`/san-pham/${id}`)} />
          </section>

          {/* Service Websites Section */}
          <section className="animate-fade-in-up animation-delay-100" id="services">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dịch Vụ Thiết Kế Website</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent ml-4 dark:via-emerald-500/30"></div>
            </div>
            <div className="mb-6">
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
                Triển khai website nhanh, đẹp, tối ưu SEO. Xem mẫu đã làm và liên hệ tư vấn ngay.
              </p>
            </div>
            <ServiceExplorer onOpenDetail={(id) => router.push(`/web/${id}`)} />
          </section>

          {/* Posts Section */}
          <section className="animate-fade-in-up animation-delay-200" id="posts">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Bài Viết Mới Nhất</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent ml-4 dark:via-blue-600/30"></div>
            </div>
            <PostExplorer onOpenDetail={(id) => router.push(`/bai-viet/${id}`)} />
          </section>

          {/* FAQ Section */}
          {(faqs?.items ?? []).length > 0 && (
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
              <FAQSection faqs={faqs} />
            </section>
          )}

          {/* Reviews Section */}
          <section className="animate-fade-in-up animation-delay-600" id="reviews">
            <ReviewsSection />
          </section>
        </div>
      </div>

      {/* Footer đã chuyển sang layout chung */}

      {/* Overlays */}
      <SearchOverlay
        open={searchOpen}
        onOpenChange={(o) => {
          setSearchOpen(o);
          if (!o) beep();
        }}
        onSelect={(kind, id) => {
          // Điều hướng theo loại nội dung, thay vì bật popup
          if (kind === "product") router.push(`/san-pham/${id}`);
          // else if (kind === "service") router.push(`/web/${id}`);
          else router.push(`/bai-viet/${id}`);
          setSearchOpen(false);
          beep();
        }}
      />

      {/* Speed Dial */}
      <SpeedDial onOpenSearch={() => setSearchOpen(true)} />
    </div>
  );
}
