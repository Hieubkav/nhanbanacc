"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@nhanbanacc/backend/convex/_generated/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSound } from "@/lib/use-sound";

type TabKey = "products" | "posts";

export function SearchOverlay({ open, onOpenChange, onSelect }: { open: boolean; onOpenChange: (o: boolean) => void; onSelect: (kind: "product" | "post", id: string) => void }) {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<TabKey>("products");
  const { beep } = useSound();

  // Luôn truyền args hợp lệ để tránh lỗi validator khi args = undefined
  const qTrim = q.trim();
  const active = open && qTrim.length > 1;
  const safeQ = active ? qTrim : "__no_results__"; // không khớp dữ liệu thực tế
  const productSuggest = useQuery(api.products.suggest, { q: safeQ, limit: 10 } as any);
  const postSuggest = useQuery(api.posts.suggest, { q: safeQ, limit: 10 } as any);

  useEffect(() => {
    if (open) beep();
  }, [open]);

  const resultsCount = (productSuggest?.length ?? 0) + (postSuggest?.length ?? 0);
  useEffect(() => {
    if (!open) return;
    if (resultsCount > 0) beep();
  }, [resultsCount, open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onOpenChange]);

  const renderList = (items: { id: string; label: string }[] | undefined, kind: "product" | "post") => {
    return (
      <CommandGroup heading={kind === "product" ? "Sản phẩm" : "Bài viết"}>
        {items?.map((it) => (
          <CommandItem key={String(it.id)} value={String(it.id)} onSelect={() => { onSelect(kind, String(it.id)); onOpenChange(false); }}>
            <span className="line-clamp-1">{it.label}</span>
          </CommandItem>
        ))}
      </CommandGroup>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0">
        <DialogHeader>
          <DialogTitle className="sr-only">Tìm kiếm</DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
          <TabsList className="m-3">
            <TabsTrigger value="products">Sản phẩm</TabsTrigger>
            <TabsTrigger value="posts">Bài viết</TabsTrigger>
          </TabsList>
          <TabsContent value="products">
            <Command>
              <CommandInput placeholder="Tìm sản phẩm..." value={q} onValueChange={setQ as any} />
              <CommandList>
                <CommandEmpty>Không thấy kết quả</CommandEmpty>
                {renderList(productSuggest as any, "product")}
                <CommandSeparator />
                {renderList(postSuggest as any, "post")}
              </CommandList>
            </Command>
          </TabsContent>
          <TabsContent value="posts">
            <Command>
              <CommandInput placeholder="Tìm bài viết..." value={q} onValueChange={setQ as any} />
              <CommandList>
                <CommandEmpty>Không thấy kết quả</CommandEmpty>
                {renderList(postSuggest as any, "post")}
                <CommandSeparator />
                {renderList(productSuggest as any, "product")}
              </CommandList>
            </Command>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
