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
    <div className="bg-white">
      <div className="container mx-auto max-w-6xl px-4 py-6">
        <HeroSlider />
        <div className="mt-2 text-right text-xs text-muted-foreground">API: {healthCheck === undefined ? "Checking..." : healthCheck === "OK" ? "Connected" : "Error"}</div>

        <div className="mt-8 grid gap-8">
          <ProductExplorer onOpenDetail={(id) => setDetail({ kind: "product", id })} />
          <PostExplorer onOpenDetail={(id) => setDetail({ kind: "post", id })} />
          <FAQSection />
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

